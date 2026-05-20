# Devfolio MCP helper — one place to read/write to https://mcp.devfolio.co/mcp.
# Usage:
#   . .\scripts\devfolio.ps1           # dot-source to load functions
#   Devfolio-Init                      # initialize a session (sets $script:DevfolioSession)
#   Devfolio-Call -Method 'tools/list'
#   Devfolio-Tool -Name 'getUserActiveHackathons'
#   Devfolio-Tool -Name 'createHackathonProject' -Arguments @{ ... }

$script:DevfolioUrl = 'https://mcp.devfolio.co/mcp'
$script:DevfolioApiKey = '4003a301d3b3c52f7275a99505a833c31f883c743c488f2c9625d7babad98950'
$script:DevfolioSession = $null

function Convert-SseToJson($raw) {
    # The MCP server returns a single SSE frame: "event: message\ndata: {json}\n\n".
    $line = ($raw -split "`n" | Where-Object { $_ -match '^data: ' } | Select-Object -First 1)
    if (-not $line) { throw "No data line in SSE response. Raw: $raw" }
    $json = $line.Substring(6)
    return $json | ConvertFrom-Json
}

function Devfolio-Init {
    $headers = @{
        'x-api-key' = $script:DevfolioApiKey
        'Content-Type' = 'application/json'
        'Accept' = 'application/json, text/event-stream'
    }
    $body = @{
        jsonrpc = '2.0'; id = '1'; method = 'initialize'
        params = @{
            protocolVersion = '2025-06-18'
            capabilities = @{}
            clientInfo = @{ name = 'solo-hackathon'; version = '1.0.0' }
        }
    } | ConvertTo-Json -Depth 6
    $resp = Invoke-WebRequest -Uri $script:DevfolioUrl -Method Post -Headers $headers -Body $body -UseBasicParsing
    $script:DevfolioSession = $resp.Headers['mcp-session-id']
    if ($script:DevfolioSession -is [array]) { $script:DevfolioSession = $script:DevfolioSession[0] }
    # Per MCP spec — client must send "initialized" notification next.
    $notifHeaders = $headers.Clone()
    $notifHeaders['mcp-session-id'] = $script:DevfolioSession
    $notifBody = @{ jsonrpc = '2.0'; method = 'notifications/initialized' } | ConvertTo-Json
    Invoke-WebRequest -Uri $script:DevfolioUrl -Method Post -Headers $notifHeaders -Body $notifBody -UseBasicParsing | Out-Null
    "session: $script:DevfolioSession"
}

function Devfolio-Call {
    param([Parameter(Mandatory)]$Method, $Params = @{})
    if (-not $script:DevfolioSession) { Devfolio-Init | Out-Null }
    $headers = @{
        'x-api-key' = $script:DevfolioApiKey
        'Content-Type' = 'application/json'
        'Accept' = 'application/json, text/event-stream'
        'mcp-session-id' = $script:DevfolioSession
    }
    $body = @{
        jsonrpc = '2.0'; id = ([guid]::NewGuid().ToString('N').Substring(0,8))
        method = $Method; params = $Params
    } | ConvertTo-Json -Depth 50
    $resp = Invoke-WebRequest -Uri $script:DevfolioUrl -Method Post -Headers $headers -Body $body -UseBasicParsing
    return Convert-SseToJson $resp.Content
}

function Devfolio-Tool {
    param([Parameter(Mandatory)]$Name, $Arguments = @{})
    $r = Devfolio-Call -Method 'tools/call' -Params @{ name = $Name; arguments = $Arguments }
    if ($r.error) { throw "Devfolio tool '$Name' error: $($r.error.message)" }
    # Content can be text (JSON-encoded) or structured. Try parsing the first text block.
    $text = $r.result.content | Where-Object { $_.type -eq 'text' } | Select-Object -First 1
    if ($text) {
        try { return $text.text | ConvertFrom-Json } catch { return $text.text }
    }
    return $r.result
}

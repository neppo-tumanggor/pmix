param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $args
)

$scriptPath = Join-Path $PSScriptRoot 'tools/scripts/pmix.cjs'
if (-not (Test-Path $scriptPath)) {
  $scriptPath = Join-Path $PSScriptRoot 'tools\\scripts\\pmix.cjs'
}

if (-not (Test-Path $scriptPath)) {
  Write-Error "pmix script not found"
  exit 1
}

& node $scriptPath @args

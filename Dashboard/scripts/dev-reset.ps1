$ErrorActionPreference = "SilentlyContinue"

$projectPath = (Get-Location).Path
$projectPattern = [Regex]::Escape($projectPath)

$nextDevProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object {
    $_.CommandLine -and
    $_.CommandLine -match "next(\\.js)?\\s+dev" -and
    $_.CommandLine -match $projectPattern
  }

foreach ($process in $nextDevProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

$port3000Owners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $port3000Owners) {
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
  if (
    $processInfo -and
    $processInfo.Name -eq "node.exe" -and
    $processInfo.CommandLine -and
    $processInfo.CommandLine -match "next" -and
    $processInfo.CommandLine -match $projectPattern
  ) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

$lockPath = Join-Path $projectPath ".next\\dev\\lock"
if (Test-Path $lockPath) {
  Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Dev reset complete for: $projectPath"

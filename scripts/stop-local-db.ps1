$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgRoot = "C:\Program Files\PostgreSQL"
$pgBin = Get-ChildItem -Directory $pgRoot -ErrorAction SilentlyContinue |
  Sort-Object { [int]$_.Name } -Descending |
  ForEach-Object { Join-Path $_.FullName "bin" } |
  Where-Object { Test-Path (Join-Path $_ "pg_ctl.exe") } |
  Select-Object -First 1
if (!$pgBin) {
  throw "PostgreSQL bin directory not found under $pgRoot"
}
$pgMajor = Split-Path (Split-Path $pgBin -Parent) -Leaf
$dataDir = Join-Path $projectRoot "local\postgres-data-$pgMajor"

if (Test-Path $dataDir) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir stop -m fast
}


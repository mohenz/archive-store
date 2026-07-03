$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$dataDir = Join-Path $projectRoot "local\postgres-data"

if (Test-Path $dataDir) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir stop -m fast
}


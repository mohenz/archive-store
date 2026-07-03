$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgRoot = "C:\Program Files\PostgreSQL"
$pgBin = Get-ChildItem -Directory $pgRoot -ErrorAction SilentlyContinue |
  Sort-Object { [int]$_.Name } -Descending |
  ForEach-Object { Join-Path $_.FullName "bin" } |
  Where-Object { Test-Path (Join-Path $_ "initdb.exe") } |
  Select-Object -First 1
if (!$pgBin) {
  throw "PostgreSQL bin directory not found under $pgRoot"
}
$pgMajor = Split-Path (Split-Path $pgBin -Parent) -Leaf
$dataDir = Join-Path $projectRoot "local\postgres-data-$pgMajor"
$logPath = Join-Path $projectRoot "local\postgres.log"
$port = "54324"
$dbName = "archive_store"

New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot "local") | Out-Null

if (!(Test-Path $dataDir)) {
  & (Join-Path $pgBin "initdb.exe") -D $dataDir -U postgres --auth=trust --encoding=UTF8 --locale=C
}

$statusOutput = & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir status 2>&1
$isRunning = $LASTEXITCODE -eq 0
if (!$isRunning) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir -l $logPath -o "-p $port -h 127.0.0.1" start
}

$dbExists = & (Join-Path $pgBin "psql.exe") -h 127.0.0.1 -p $port -U postgres -d postgres -tAc "select 1 from pg_database where datname = '$dbName'"
if ($LASTEXITCODE -ne 0) {
  throw "PostgreSQL is not accepting connections on 127.0.0.1:$port"
}
if ($null -eq $dbExists -or $dbExists.Trim() -ne "1") {
  & (Join-Path $pgBin "createdb.exe") -h 127.0.0.1 -p $port -U postgres $dbName
}

& (Join-Path $pgBin "psql.exe") -h 127.0.0.1 -p $port -U postgres -d $dbName -v ON_ERROR_STOP=1 -f (Join-Path $projectRoot "local\schema.sql")

Write-Host "PostgreSQL $pgMajor ready: 127.0.0.1:$port / db=$dbName / user=postgres / auth=trust"

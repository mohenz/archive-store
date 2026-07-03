$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$dataDir = Join-Path $projectRoot "local\postgres-data"
$logPath = Join-Path $projectRoot "local\postgres.log"
$port = "54324"
$dbName = "archive_store"

New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot "local") | Out-Null

if (!(Test-Path $dataDir)) {
  & (Join-Path $pgBin "initdb.exe") -D $dataDir -U postgres --auth=trust --encoding=UTF8 --locale=C
}

$statusOutput = & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir status 2>&1
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir -l $logPath -o "-p $port -h 127.0.0.1" start
}

$env:PGHOST = "127.0.0.1"
$env:PGPORT = $port
$env:PGUSER = "postgres"
$env:PGDATABASE = "postgres"

$dbExists = & (Join-Path $pgBin "psql.exe") -tAc "select 1 from pg_database where datname = '$dbName'"
if ($dbExists.Trim() -ne "1") {
  & (Join-Path $pgBin "createdb.exe") $dbName
}

$env:PGDATABASE = $dbName
& (Join-Path $pgBin "psql.exe") -v ON_ERROR_STOP=1 -f (Join-Path $projectRoot "local\schema.sql")

Write-Host "PostgreSQL ready: 127.0.0.1:$port / db=$dbName / user=postgres / auth=trust"

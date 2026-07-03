$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

npm.cmd run dev -- --host 127.0.0.1 *> dev-server.log


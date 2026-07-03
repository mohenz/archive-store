param(
  [string]$ManifestPath = (Join-Path $PSScriptRoot "..\stitch-manifest.json"),
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

$resolvedManifest = Resolve-Path -LiteralPath $ManifestPath
$root = Split-Path -Parent $resolvedManifest
$manifest = Get-Content -LiteralPath $resolvedManifest -Raw -Encoding UTF8 | ConvertFrom-Json

function Save-StitchAsset {
  param(
    [Parameter(Mandatory = $true)] [string]$Url,
    [Parameter(Mandatory = $true)] [string]$OutputPath
  )

  $fullOutputPath = Join-Path $root $OutputPath
  $outputDir = Split-Path -Parent $fullOutputPath
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

  if ($WhatIfOnly) {
    Write-Host "DRY RUN curl.exe -L `"$Url`" -o `"$fullOutputPath`""
    return
  }

  Write-Host "Downloading $OutputPath"
  curl.exe -L $Url -o $fullOutputPath
}

foreach ($screen in $manifest.screens) {
  foreach ($image in $screen.exports.images) {
    Save-StitchAsset -Url $image.url -OutputPath $image.output
  }

  foreach ($code in $screen.exports.code) {
    Save-StitchAsset -Url $code.url -OutputPath $code.output
  }
}

Write-Host "Stitch asset download complete."


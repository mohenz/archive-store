# Stitch MCP Integration

## Purpose
This folder stores Stitch MCP connection metadata and exported design deliverables for `archive_store`.

## Stitch Project
- title: 디자인 작업 명세 처리
- project_id: `3657601612466408108`
- requested_screen: Design System
- requested_screen_id: `asset-stub-assets_34fe84e586a74e45a1fb0291e1c61500`

## Folder Layout
- `stitch-manifest.json`: project, screen, and hosted asset URL manifest
- `scripts/download-stitch-assets.ps1`: downloads hosted image/code URLs with `curl.exe -L`
- `exports/design-system/images/`: downloaded image assets
- `exports/design-system/code/`: downloaded code assets
- `sync-log.md`: MCP sync status and blockers

## Current Status
Stitch MCP is configured in the tool layer, but the current call returned `Auth required`.
After Stitch MCP authentication is completed, fetch the hosted URLs through MCP and add them to `stitch-manifest.json`, then run:

```powershell
.\integrations\stitch\scripts\download-stitch-assets.ps1
```


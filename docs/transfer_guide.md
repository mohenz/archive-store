# Archive Store PC Transfer Guide

## 목적
다른 PC에서 `archive_store` 프로젝트를 같은 기준으로 복원하기 위한 절차입니다.

## Git 저장소
- repository: `https://github.com/mohenz/archive-store.git`
- branch: `main`

## 새 PC 준비 항목
- Git
- Node.js / npm
- PostgreSQL 18 for Windows
  - 기본 스크립트는 `C:\Program Files\PostgreSQL\18\bin` 경로를 기준으로 합니다.
  - 설치 경로가 다르면 `scripts\start-local-db.ps1`, `scripts\stop-local-db.ps1`의 PostgreSQL bin 경로를 조정합니다.

## 복원 절차
```powershell
git clone https://github.com/mohenz/archive-store.git
cd archive-store
npm install
Copy-Item .env.example .env.local
```

`.env.local`에 최소값을 설정합니다.

```text
VITE_ARCHIVE_PIN=<개인 PIN>
VITE_DATA_BACKEND=local-api
VITE_LOCAL_API_URL=http://127.0.0.1:5175
```

로컬 실행:

```powershell
start.cmd
```

종료:

```powershell
end.cmd
```

## 접속 정보
- app: `http://127.0.0.1:5174/`
- api health: `http://127.0.0.1:5175/api/health`
- db: `127.0.0.1:54324/archive_store`

## 검증 명령
```powershell
npm run build
npm run check:syntax
curl.exe -s http://127.0.0.1:5175/api/health
```

## Git에 포함되지 않는 로컬 자료
아래 항목은 민감 정보 또는 실행 산출물이므로 Git에 포함하지 않습니다.

- `.env.local`
- `docs\required_user_inputs.md`
- `local\postgres-data\`
- `local\uploads\`
- `local\*.log`
- `dev-server.log`
- `node_modules\`
- `dist\`

기존 PC의 실제 업로드 파일과 DB 데이터를 새 PC로 옮겨야 하면 `local\uploads\`와 PostgreSQL 데이터를 별도 백업/복원해야 합니다. 단순 개발 환경 이관만 필요하면 Git clone 후 위 절차만 수행합니다.

# Archive Store

Firebase 기반 개인용 아카이브 저장소입니다.

## 현재 범위
- React/Vite 프론트엔드 스캐폴딩
- Firebase Auth, Firestore, Storage 클라이언트 연동 구조
- Firebase 백엔드 모드의 이메일/비밀번호 로그인 화면
- 로컬 API 모드의 단일 사용자 PIN 잠금 화면
- 파일 선택/드래그 앤 드롭/클립보드 업로드 UI 골격
- 200MB 단일 파일 제한, 1GB 총량 표시, 실행파일 차단
- 파일 타입 필터, 검색, 저장소 사용량 패널, 미리보기 모달 골격
- Stitch MCP 산출물 수집 구조

## 시작 전 준비
1. Firebase 프로젝트 `archive-store-fae71`을 사용합니다.
2. Web App을 추가하고 Firebase config 값을 확인합니다.
3. Firebase Authentication에서 Email/Password 제공업체를 활성화하고 운영 계정을 생성합니다.
4. 로컬 API 기준은 `config\.env.example`, Firebase 기준은 `config\.env.firebase.example`을 복사해 `.env.local`을 생성합니다.
5. Cloud Firestore, Firebase Storage를 활성화합니다.

## 실행
간단 실행:

```powershell
scripts\start.cmd
```

종료:

```powershell
scripts\end.cmd
```

개별 실행:

```powershell
npm install
npm run db:start
npm run dev:api
npm run dev
```

기본 개발 서버 URL:

```text
http://127.0.0.1:5174/
```

로컬 API:

```text
http://127.0.0.1:5175/api/health
```

로컬 PostgreSQL:

```text
host=127.0.0.1
port=54324
database=archive_store
user=postgres
auth=trust
```

## 로컬 검증 상태
- PostgreSQL 18 프로젝트 전용 클러스터: `local/postgres-data`
- 파일 저장 위치: `local/uploads`
- 메타데이터 테이블: `archive_files`
- 로컬 API 헬스체크: `GET /api/health`
- 파일 목록: `GET /api/files`
- 파일 업로드: `POST /api/files` multipart `file`
- 시작/종료 스크립트: `scripts\start.cmd`, `scripts\end.cmd`

## 주요 문서
- `docs/requirements/개인용_아카이브_저장소_기능검토보고서.md`
- `docs/requirements/프로젝트_아키텍처_및_개발계획서.md`
- `docs/requirements/디자인_작업_명세서_Stitch.md`
- `docs/firebase_setup.md`
- `docs/firebase_infra_setup.md`
- `docs/transfer_guide.md`

## 배포 방향
- Firebase Hosting, Firestore, Storage 인프라 연결을 기준으로 진행합니다.

# Firebase Setup

## 필요한 Firebase 기능
- Authentication: Email/Password 로그인 사용. Firebase Console에서 Email/Password 제공업체를 활성화하고 운영 계정을 생성해야 함. 앱 로그인 화면은 이 계정으로 접속함.
- Cloud Firestore: 파일 메타데이터 저장
- Firebase Storage: 실제 파일 저장

## Firestore 컬렉션
`users/{uid}/files/{fileId}`

필드:
- `filename`: 원본 파일명
- `mimeType`: MIME 타입
- `size`: 바이트 단위 파일 크기
- `storagePath`: Firebase Storage 경로
- `downloadUrl`: 다운로드 URL
- `category`: `image`, `text`, `document`, `other`
- `tags`: 문자열 배열
- `uploadedAt`: 서버 타임스탬프
- `updatedAt`: 서버 타임스탬프

## Storage 경로
`users/{uid}/files/{fileId}_{filename}`

## 권장 보안 원칙
- 사용자는 본인 uid 경로만 읽고 쓸 수 있어야 합니다.
- Firestore 메타데이터와 Storage 파일 경로의 uid가 일치해야 합니다.
- 텍스트 미리보기는 HTML로 삽입하지 말고 텍스트로 렌더링해야 합니다.
- 다운로드 트래픽 과금 방지를 위해 예산 알림을 설정해야 합니다.
- Firebase 백엔드 모드에서는 로그인한 사용자의 `auth.uid`와 Firestore/Storage 경로의 `uid`가 일치해야 합니다. 업로드/목록 조회는 이 `uid` 기준으로 수행합니다.

## 현재 확정 정책
- 인증 방식: Firebase Email/Password Auth
- 외부 사용자: 불가
- 단일 파일 최대 용량: 200MB
- 사용자별 총 저장 용량: 1GB
- 허용 파일: 실행 가능한 파일 외 일반 이미지/문서/텍스트/미디어 파일
- 차단 파일: exe 등 실행 가능한 파일 전체
- 과금: 사용량 기준 과금, 월 예산 알림 20,000원
- Storage 다운로드 트래픽 경고 기준: 1GB
- 백업: 불필요
- 배포: Firebase Hosting, Firestore, Storage 기준으로 진행

## 사용자 제공 필요 값
- Firebase project id: `archive-store-fae71`
- Firebase Web App config 전체
- Firebase Authentication Email/Password 운영 계정
- Stitch hosted image/code URL 또는 MCP 인증 재확인

## 로컬 선검증 경로
Firebase 연결 전에는 로컬 PostgreSQL과 로컬 API로 기능 흐름을 먼저 확인합니다.

- DB: `127.0.0.1:54324/archive_store`
- API: `http://127.0.0.1:5175`
- 앱: `http://127.0.0.1:5174`
- 데이터 저장: `local/postgres-data`, `local/uploads`
- 로컬 API 백엔드: `config\.env.example` 기준 `VITE_DATA_BACKEND=local-api`
- Firebase 백엔드: `config\.env.firebase.example` 기준 `VITE_DATA_BACKEND=firebase`
- Firebase 인프라 절차: `docs\firebase_infra_setup.md`

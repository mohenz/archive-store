# Firebase Infra Setup

## 목적
`archive_store`를 Firebase Hosting, Firestore, Storage 기준으로 연결하기 위한 준비 절차입니다.

## 현재 준비된 항목
- Firebase Web SDK 의존성
- Firebase CLI 로컬 개발 의존성: `firebase-tools`
- Firebase Hosting 설정: `firebase/firebase.json`
- Firestore rules: `firebase/firestore.rules`
- Storage rules: `firebase/storage.rules`
- Firebase 전용 env 예시: `config\.env.firebase.example`
- Firebase CLI 프로젝트 예시: `firebase\.firebaserc.example`

## 필요한 실제 값
아래 값은 Git에 올리지 않습니다.

- Firebase project id: `archive-store-fae71`
- Firebase Web App config 6개 값
- Firebase Authentication Email/Password 운영 계정

## 로컬 연결 절차
```powershell
npm install
npm run firebase:login
npm run firebase:projects
Copy-Item firebase\.firebaserc.example .firebaserc
Copy-Item config\.env.firebase.example .env.local
```

`.firebaserc`는 현재 `archive-store-fae71` 프로젝트를 기본값으로 사용합니다.

`.env.local`에 Firebase Web App config를 입력합니다.

```text
VITE_FIREBASE_PROJECT_ID=archive-store-fae71
VITE_DATA_BACKEND=firebase
```

Firebase Console에서 Authentication > Sign-in method의 Email/Password 제공업체를 활성화하고, 로그인에 사용할 운영 계정을 생성합니다.

## 로컬 에뮬레이터
```powershell
npm run firebase:emulators
```

- Hosting emulator: `http://127.0.0.1:5176`
- Auth emulator: `127.0.0.1:9099`
- Firestore emulator: `127.0.0.1:8080`
- Storage emulator: `127.0.0.1:9199`
- Emulator UI: `http://127.0.0.1:4001`

## 배포
전체 배포:

```powershell
npm run firebase:deploy
```

Hosting만 배포:

```powershell
npm run firebase:deploy:hosting
```

Firestore/Storage rules만 배포:

```powershell
npm run firebase:deploy:rules
```

## 주의
- `.env.local`과 `.firebaserc`는 로컬/배포 환경 전용이며 Git에 포함하지 않습니다.
- Firebase 백엔드 모드는 PIN이 아니라 Firebase Auth 로그인 상태를 기준으로 Firestore/Storage 접근을 허용합니다.
- Firebase Storage 다운로드 트래픽은 과금될 수 있으므로 예산 알림을 먼저 설정합니다.

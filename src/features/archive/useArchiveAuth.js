import { useEffect, useState } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { archivePolicy } from '../../config/archivePolicy.js';
import { auth, isFirebaseConfigured } from '../../firebase/client.js';

const unlockSessionKey = 'archive-store-unlocked';

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'auth/too-many-requests':
      return '로그인 시도가 많습니다. 잠시 후 다시 시도하세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인하세요.';
    default:
      return error?.message || '로그인에 실패했습니다.';
  }
}

export function useArchiveAuth({ dataBackend }) {
  const isFirebaseBackend = dataBackend === 'firebase';
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseBackend && isFirebaseConfigured);
  const [email, setEmail] = useState(() => localStorage.getItem('archive_store_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(() => localStorage.getItem('archive_store_remember_email') === 'true');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(unlockSessionKey) === 'true');
  const [authStatus, setAuthStatus] = useState('');

  const userId = isFirebaseBackend ? authUser?.uid : archivePolicy.userId;

  useEffect(() => {
    if (!isFirebaseBackend || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setAuthUser(nextUser);
      setAuthLoading(false);
    });
  }, [isFirebaseBackend]);

  async function handleLogin(event) {
    event.preventDefault();
    if (!auth) {
      setAuthStatus('Firebase 인증 설정 후 로그인할 수 있습니다.');
      return;
    }

    setAuthStatus('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
      if (rememberEmail) {
        localStorage.setItem('archive_store_remember_email', 'true');
        localStorage.setItem('archive_store_remembered_email', email.trim());
      } else {
        localStorage.removeItem('archive_store_remember_email');
        localStorage.removeItem('archive_store_remembered_email');
      }
    } catch (error) {
      setAuthStatus(getAuthErrorMessage(error));
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    if (!auth) return;

    setResetStatus('비밀번호 재설정 이메일을 전송하는 중...');
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus('비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해 주세요.');
      setResetEmail('');
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        setResetStatus('가입되어 있지 않은 이메일 주소입니다.');
      } else if (error?.code === 'auth/invalid-email') {
        setResetStatus('올바르지 않은 이메일 형식입니다.');
      } else {
        setResetStatus('이메일 전송에 실패했습니다.');
      }
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem(unlockSessionKey);
    setIsUnlocked(false);
    setAuthUser(null);
    if (auth) {
      await signOut(auth);
    }
  }

  function handleUnlock(event) {
    event.preventDefault();
    if (pin === archivePolicy.pin) {
      sessionStorage.setItem(unlockSessionKey, 'true');
      setIsUnlocked(true);
      setAuthStatus('');
      return;
    }

    setAuthStatus('PIN이 일치하지 않습니다.');
  }

  function openResetMode() {
    setIsResetMode(true);
    setResetStatus('');
  }

  function closeResetMode() {
    setIsResetMode(false);
  }

  let screenType = null;
  if (isFirebaseBackend && authLoading) {
    screenType = 'loading';
  } else if (isFirebaseBackend && isResetMode) {
    screenType = 'reset';
  } else if (isFirebaseBackend && !authUser) {
    screenType = 'firebase';
  } else if (!isFirebaseBackend && !isUnlocked) {
    screenType = 'pin';
  }

  return {
    authLoading,
    authStatus,
    authUser,
    email,
    handleLogin,
    handleLogout,
    handlePasswordReset,
    handleUnlock,
    isFirebaseBackend,
    password,
    pin,
    rememberEmail,
    resetEmail,
    resetStatus,
    screenType,
    setEmail,
    setPassword,
    setPin,
    setRememberEmail,
    setResetEmail,
    userId,
    closeResetMode,
    openResetMode,
  };
}

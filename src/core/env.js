export function getEnv(key) {
  if (key === 'VITE_FIREBASE_API_KEY') return process.env.VITE_FIREBASE_API_KEY || '';
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN') return process.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  if (key === 'VITE_FIREBASE_PROJECT_ID') return process.env.VITE_FIREBASE_PROJECT_ID || '';
  if (key === 'VITE_FIREBASE_STORAGE_BUCKET') return process.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  if (key === 'VITE_FIREBASE_MESSAGING_SENDER_ID') return process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  if (key === 'VITE_FIREBASE_APP_ID') return process.env.VITE_FIREBASE_APP_ID || '';
  if (key === 'VITE_FIREBASE_MEASUREMENT_ID') return process.env.VITE_FIREBASE_MEASUREMENT_ID || '';
  if (key === 'VITE_ARCHIVE_PIN') return process.env.VITE_ARCHIVE_PIN || '';
  if (key === 'VITE_DATA_BACKEND') return process.env.VITE_DATA_BACKEND || '';
  if (key === 'VITE_LOCAL_API_URL') return process.env.VITE_LOCAL_API_URL || '';
  
  return '';
}

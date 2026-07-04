import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot);
  
  const envDefine = {};
  Object.keys(env).forEach((key) => {
    envDefine[`process.env.${key}`] = JSON.stringify(env[key]);
  });
  
  return {
    root: projectRoot,
    envDir: projectRoot,
    plugins: [react()],
    define: envDefine,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase-app': ['firebase/app'],
            'firebase-auth': ['firebase/auth'],
            'firebase-firestore': ['firebase/firestore'],
            'firebase-storage': ['firebase/storage'],
            react: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5174,
    },
  };
});

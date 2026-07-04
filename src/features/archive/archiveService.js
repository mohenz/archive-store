import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '../../firebase/client.js';
import { getFileCategory } from '../../core/fileTypes.js';

export function requireFirebase() {
  if (!isFirebaseConfigured || !db || !storage) {
    throw new Error('Firebase 환경변수가 설정되지 않았습니다.');
  }
}

export function subscribeFiles(userId, onFiles, onError) {
  requireFirebase();

  const filesRef = collection(db, 'users', userId, 'files');
  const filesQuery = query(filesRef, orderBy('uploadedAt', 'desc'));

  return onSnapshot(
    filesQuery,
    (snapshot) => {
      onFiles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    },
    onError,
  );
}

export async function uploadArchiveFile({ file, userId, onProgress }) {
  requireFirebase();

  const safeName = file.name.replace(/[^\w.\-가-힣 ]/g, '_');
  const fileId = crypto.randomUUID();
  const storagePath = `users/${userId}/files/${fileId}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

  await new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      reject,
      resolve,
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, 'users', userId, 'files'), {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    storagePath,
    downloadUrl,
    category: getFileCategory(file),
    tags: [],
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteArchiveFile({ file, userId }) {
  requireFirebase();

  if (file.storagePath) {
    try {
      await deleteObject(ref(storage, file.storagePath));
    } catch (error) {
      if (error?.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  }

  await deleteDoc(doc(db, 'users', userId, 'files', file.id));
}


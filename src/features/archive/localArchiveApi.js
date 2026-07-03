const apiBaseUrl = import.meta.env.VITE_LOCAL_API_URL || 'http://127.0.0.1:5175';

export async function fetchLocalFiles() {
  const response = await fetch(`${apiBaseUrl}/api/files`);
  if (!response.ok) {
    throw new Error('로컬 파일 목록 조회에 실패했습니다.');
  }

  return response.json();
}

export async function uploadLocalFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${apiBaseUrl}/api/files`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('로컬 파일 업로드에 실패했습니다.');
  }

  return response.json();
}


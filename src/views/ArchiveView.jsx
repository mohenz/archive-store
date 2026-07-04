import { File, FileQuestion, FileText, Grid2X2, Image, Layers, Search, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { archivePolicy } from '../config/archivePolicy.js';
import { validateArchiveFiles } from '../core/fileValidation.js';
import { formatBytes, getFileInitial } from '../core/fileTypes.js';
import { uploadArchiveFile } from '../features/archive/archiveService.js';
import { uploadLocalFile } from '../features/archive/localArchiveApi.js';
import { useArchiveFiles } from '../features/archive/useArchiveFiles.js';
import { FilePreviewModal } from '../views/FilePreviewModal.jsx';

const categories = [
  { id: 'all', label: '전체', Icon: Layers },
  { id: 'image', label: '이미지', Icon: Image },
  { id: 'text', label: '텍스트', Icon: FileText },
  { id: 'document', label: '문서', Icon: File },
  { id: 'other', label: '기타', Icon: Grid2X2 },
];

const pageSizeOptions = [20, 40, 60, 80, 100, 'all'];
const unlockSessionKey = 'archive-store-unlocked';

const fileCategoryIcons = {
  image: Image,
  text: FileText,
  document: File,
  other: FileQuestion,
};

export function ArchiveView() {
  const { files, setFiles, usedBytes, loading, error, firebaseReady, dataBackend } = useArchiveFiles(archivePolicy.userId);
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(unlockSessionKey) === 'true');
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
      const matchesQuery = !normalizedQuery || file.filename.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, files, query]);

  const usedRatio = Math.min((usedBytes / archivePolicy.storageLimitBytes) * 100, 100);
  const effectivePageSize = pageSize === 'all' ? filteredFiles.length || 1 : pageSize;
  const pageCount = pageSize === 'all' ? 1 : Math.max(Math.ceil(filteredFiles.length / effectivePageSize), 1);
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleFiles = useMemo(() => {
    if (pageSize === 'all') return filteredFiles;

    const start = (safeCurrentPage - 1) * effectivePageSize;
    return filteredFiles.slice(start, start + effectivePageSize);
  }, [effectivePageSize, filteredFiles, pageSize, safeCurrentPage]);

  const pageNumbers = useMemo(() => {
    const groupStart = Math.floor((safeCurrentPage - 1) / 10) * 10 + 1;
    const groupEnd = Math.min(groupStart + 9, pageCount);
    return Array.from({ length: groupEnd - groupStart + 1 }, (_, index) => groupStart + index);
  }, [pageCount, safeCurrentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, pageSize, query]);

  function handleUnlock(event) {
    event.preventDefault();
    if (pin === archivePolicy.pin) {
      sessionStorage.setItem(unlockSessionKey, 'true');
      setIsUnlocked(true);
      setUploadStatus('');
      return;
    }

    setUploadStatus('PIN이 일치하지 않습니다.');
  }

  async function handleFiles(nextFiles) {
    if (!nextFiles.length) return;

    const { accepted, rejected } = validateArchiveFiles({ files: nextFiles, usedBytes });
    if (rejected.length) {
      setUploadStatus(rejected.join(' '));
    }

    if (!accepted.length) return;

    if (dataBackend === 'local-api') {
      for (const file of accepted) {
        setUploadStatus(`${file.name} 로컬 업로드 준비`);
        const uploadedFile = await uploadLocalFile(file);
        setFiles((currentFiles) => [uploadedFile, ...currentFiles]);
      }
      setUploadStatus('로컬 업로드 완료');
      return;
    }

    if (!firebaseReady) {
      setUploadStatus('Firebase 설정 후 업로드할 수 있습니다.');
      return;
    }

    for (const file of accepted) {
      setUploadStatus(`${file.name} 업로드 준비`);
      await uploadArchiveFile({
        file,
        userId: archivePolicy.userId,
        onProgress: (progress) => setUploadStatus(`${file.name} ${progress}%`),
      });
    }
    setUploadStatus('업로드 완료');
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(Array.from(event.dataTransfer.files));
  }

  function handlePaste(event) {
    const pastedFiles = Array.from(event.clipboardData.files);
    if (pastedFiles.length) {
      handleFiles(pastedFiles);
      return;
    }

    const text = event.clipboardData.getData('text/plain');
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const file = new File([blob], `clipboard_${Date.now()}.txt`, { type: 'text/plain' });
      handleFiles([file]);
    }
  }

  if (!isUnlocked) {
    return (
      <main className="auth-shell">
        <form className="pin-panel" onSubmit={handleUnlock}>
          <p className="eyebrow">Archive Store</p>
          <h1>PIN 인증</h1>
          <label>
            <span>PIN</span>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </label>
          <button type="submit">열기</button>
          {uploadStatus && <p className="pin-error">{uploadStatus}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell" onPaste={handlePaste}>
      <section className="toolbar">
        <div>
          <p className="eyebrow">Archive Store</p>
          <h1>개인용 아카이브 저장소</h1>
        </div>
      </section>

      <section className="workspace-layout">
        <aside className="left-panel" aria-label="아카이브 현황과 업로드">
          <section className="storage-band">
            <div>
              <span>아카이브 현황</span>
              <strong>{formatBytes(usedBytes)} / {formatBytes(archivePolicy.storageLimitBytes)}</strong>
            </div>
            <div className="meter" aria-label="스토리지 사용량">
              <span style={{ width: `${usedRatio}%` }} />
            </div>
          </section>

          <section className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            <div className="upload-zone-copy">
              <UploadCloud size={24} aria-hidden="true" />
              <div>
                <strong>파일 업로드</strong>
                <span>파일을 끌어오거나 클립보드 이미지를 붙여넣기</span>
              </div>
            </div>
            <label className="upload-button">
              <UploadCloud size={18} aria-hidden="true" />
              <span>업로드</span>
              <input type="file" multiple onChange={(event) => handleFiles(Array.from(event.target.files))} />
            </label>
          </section>
        </aside>

        <section className="right-panel" aria-label="파일 목록 영역">
          <section className="controls">
            <div className="category-tabs" aria-label="파일 종류 필터">
              {categories.map((category) => (
                <button
                  className={activeCategory === category.id ? 'active' : ''}
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.Icon size={16} aria-hidden="true" />
                  {category.label}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일명 검색" />
            </label>
          </section>

          {(uploadStatus || error || loading || !firebaseReady) && (
            <section className="status-line">
              {loading && <span>파일 목록을 불러오는 중</span>}
              {dataBackend === 'local-api' && <span>로컬 PostgreSQL API 기준으로 확인 중입니다.</span>}
              {dataBackend === 'firebase' && !firebaseReady && <span>Firebase 설정 전이라 샘플 데이터가 표시됩니다.</span>}
              {uploadStatus && <span>{uploadStatus}</span>}
              {error && <span>{error}</span>}
            </section>
          )}

          <section className="list-tools" aria-label="파일 목록 표시 설정">
            <span>총 {filteredFiles.length}개</span>
            <label>
              <span>목록</span>
              <select value={pageSize} onChange={(event) => setPageSize(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'all' : option}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="file-list" aria-label="파일 목록">
            {visibleFiles.map((file) => {
              const FileIcon = fileCategoryIcons[file.category] ?? fileCategoryIcons.other;
              return (
                <button className="file-row" key={file.id} type="button" onClick={() => setSelectedFile(file)}>
                  <span className={`file-badge ${file.category}`} aria-label={getFileInitial(file.category)} title={getFileInitial(file.category)}>
                    <FileIcon size={18} aria-hidden="true" />
                  </span>
                  <strong>{file.filename}</strong>
                  <span>{file.mimeType || '-'}</span>
                  <small>{formatBytes(file.size)}</small>
                </button>
              );
            })}
          </section>

          <nav className="pagination" aria-label="파일 목록 페이지">
            <button type="button" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>
              이전
            </button>
            <div>
              {pageNumbers.map((page) => (
                <button
                  className={safeCurrentPage === page ? 'active' : ''}
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button type="button" disabled={safeCurrentPage >= pageCount} onClick={() => setCurrentPage((page) => Math.min(page + 1, pageCount))}>
              다음
            </button>
          </nav>
        </section>
      </section>

      {selectedFile && <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
    </main>
  );
}

import { File, FileQuestion, FileText, Grid2X2, Image, Layers, LogOut, Search, Trash2, UploadCloud } from 'lucide-react';
import { archivePolicy } from '../config/archivePolicy.js';
import { formatBytes, getFileInitial } from '../core/fileTypes.js';
import { FilePreviewModal } from './FilePreviewModal.jsx';

const categories = [
  { id: 'all', label: '전체', Icon: Layers },
  { id: 'image', label: '이미지', Icon: Image },
  { id: 'text', label: '텍스트', Icon: FileText },
  { id: 'document', label: '문서', Icon: File },
  { id: 'other', label: '기타', Icon: Grid2X2 },
];

const pageSizeOptions = [20, 40, 60, 80, 100, 'all'];

const fileCategoryIcons = {
  image: Image,
  text: FileText,
  document: File,
  other: FileQuestion,
};

export function ArchiveWorkspaceScreen({
  activeCategory,
  authUser,
  currentPage,
  dataBackend,
  error,
  filteredFiles,
  firebaseReady,
  isAllSelected,
  isFirebaseBackend,
  isSomeSelected,
  loading,
  onCategoryChange,
  onDeleteFiles,
  onDrop,
  onFiles,
  onLogout,
  onPageChange,
  onPageSizeChange,
  onPaste,
  onQueryChange,
  onSelectAllToggle,
  onSelectedFileChange,
  onToggleSelected,
  pageCount,
  pageNumbers,
  pageSize,
  query,
  selectedFile,
  selectedFiles,
  selectedIds,
  status,
  usedBytes,
  usedRatio,
  visibleFiles,
}) {
  return (
    <main className="app-shell" onPaste={onPaste}>
      <section className="toolbar">
        <div>
          <h1>자료실</h1>
        </div>
        {isFirebaseBackend && (
          <div className="toolbar-actions">
            <span>{authUser.email}</span>
            <button className="icon-button" type="button" onClick={onLogout} title="로그아웃">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section className="workspace-layout">
        <aside className="left-panel" aria-label="자료실 현황과 업로드">
          <section className="storage-band">
            <div>
              <span>자료실 현황</span>
              <strong>{formatBytes(usedBytes)} / {formatBytes(archivePolicy.storageLimitBytes)}</strong>
            </div>
            <div className="meter" aria-label="스토리지 사용량">
              <span style={{ width: `${usedRatio}%` }} />
            </div>
          </section>

          <section className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
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
              <input type="file" multiple onChange={(event) => onFiles(Array.from(event.target.files))} />
            </label>
          </section>
        </aside>

        <section className="right-panel" aria-label="파일 목록 영역">
          <section className="controls">
            <div className="category-tabs" aria-label="파일 종류 필터">
              {categories.map((category) => (
                <button
                  className={`${activeCategory === category.id ? 'active' : ''} tab-${category.id}`}
                  key={category.id}
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  title={category.label}
                >
                  <category.Icon size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="파일명 검색" />
            </label>
          </section>

          {(status || error || loading || !firebaseReady) && (
            <section className="status-line">
              {loading && <span>파일 목록을 불러오는 중</span>}
              {dataBackend === 'local-api' && <span>로컬 PostgreSQL API 기준으로 확인 중입니다.</span>}
              {dataBackend === 'firebase' && !firebaseReady && <span>Firebase 설정 전이라 샘플 데이터가 표시됩니다.</span>}
              {status && <span>{status}</span>}
              {error && <span>{error}</span>}
            </section>
          )}

          <section className="list-tools" aria-label="파일 목록 표시 설정">
            <div className="left-tools-group">
              <label className="select-all-label" title="모든 파일 선택">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={onSelectAllToggle}
                  aria-label="모든 파일 선택"
                />
              </label>
              <span className="selected-count">선택 {selectedFiles.length}개</span>
              <div className="delete-tools">
                <button type="button" disabled={!selectedFiles.length} onClick={() => onDeleteFiles(selectedFiles, '선택한')} title="선택한 파일 삭제">
                  <Trash2 size={16} aria-hidden="true" />
                  선택
                </button>
                <button type="button" disabled={!filteredFiles.length} onClick={() => onDeleteFiles(filteredFiles, '현재 목록의')} title="현재 목록 전체 삭제">
                  <Trash2 size={16} aria-hidden="true" />
                  전체
                </button>
              </div>
              <span className="total-count">총 {filteredFiles.length}개</span>
            </div>
            <label className="page-size-selector">
              <span>목록</span>
              <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
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
                <div className="file-row" key={file.id}>
                  <input
                    aria-label={`${file.filename} 선택`}
                    checked={selectedIds.has(file.id)}
                    type="checkbox"
                    onChange={() => onToggleSelected(file.id)}
                  />
                  <button className="file-open" type="button" onClick={() => onSelectedFileChange(file)}>
                    <span className={`file-badge ${file.category}`} aria-label={getFileInitial(file.category)} title={getFileInitial(file.category)}>
                      <FileIcon size={18} aria-hidden="true" />
                    </span>
                    <strong>{file.filename}</strong>
                    <span className="file-mime">{file.mimeType || '-'}</span>
                    <small>{formatBytes(file.size)}</small>
                  </button>
                </div>
              );
            })}
          </section>

          <nav className="pagination" aria-label="파일 목록 페이지">
            <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange((page) => Math.max(page - 1, 1))}>
              이전
            </button>
            <div>
              {pageNumbers.map((page) => (
                <button
                  className={currentPage === page ? 'active' : ''}
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button type="button" disabled={currentPage >= pageCount} onClick={() => onPageChange((page) => Math.min(page + 1, pageCount))}>
              다음
            </button>
          </nav>
        </section>
      </section>

      {selectedFile && <FilePreviewModal file={selectedFile} onClose={() => onSelectedFileChange(null)} />}
    </main>
  );
}

import { Download, X } from 'lucide-react';
import { formatBytes } from '../core/fileTypes.js';

export function FilePreviewModal({ file, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p>{file.category}</p>
            <h2 id="preview-title">{file.filename}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="preview-body">
          {file.category === 'image' && file.downloadUrl ? (
            <img src={file.downloadUrl} alt="" />
          ) : (
            <div className="preview-placeholder">
              <strong>{file.mimeType || '파일'}</strong>
              <span>{formatBytes(file.size)}</span>
            </div>
          )}
        </div>

        <footer>
          <span>{formatBytes(file.size)}</span>
          {file.downloadUrl && (
            <a className="download-link" href={file.downloadUrl} download={file.filename}>
              <Download size={18} aria-hidden="true" />
              다운로드
            </a>
          )}
        </footer>
      </section>
    </div>
  );
}


import { validateArchiveFiles } from './fileValidation.js';

describe('validateArchiveFiles', () => {
  test('허용된 확장자와 제한 크기 내의 파일은 통과해야 한다', () => {
    const files = [
      { name: 'document.pdf', size: 5 * 1024 * 1024 }, // 5MB
      { name: 'photo.jpg', size: 10 * 1024 * 1024 },  // 10MB
    ];
    const { accepted, rejected } = validateArchiveFiles({ files, usedBytes: 0 });
    expect(accepted).toHaveLength(2);
    expect(rejected).toHaveLength(0);
  });

  test('실행 가능한 차단된 확장자의 파일은 거부되어야 한다', () => {
    const files = [
      { name: 'malware.exe', size: 1024 },
      { name: 'script.sh', size: 2048 },
    ];
    const { accepted, rejected } = validateArchiveFiles({ files, usedBytes: 0 });
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(2);
    expect(rejected[0]).toContain('실행 가능한 파일 형식은 차단됩니다');
  });

  test('단일 파일 크기가 제한을 초과하는 경우 거부되어야 한다', () => {
    const files = [
      { name: 'huge_video.mp4', size: 300 * 1024 * 1024 }, // 300MB (max 200MB)
    ];
    const { accepted, rejected } = validateArchiveFiles({ files, usedBytes: 0 });
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toContain('단일 파일 최대');
  });

  test('사용자의 총 저장 용량을 초과하는 경우 거부되어야 한다', () => {
    const files = [
      { name: 'archive.zip', size: 150 * 1024 * 1024 }, // 150MB
    ];
    // 이미 900MB 사용 중 -> 150MB 추가 시 1.05GB로 1GB(storageLimitBytes) 한도 초과
    const { accepted, rejected } = validateArchiveFiles({ files, usedBytes: 900 * 1024 * 1024 });
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toContain('사용자 총 저장 용량');
  });
});

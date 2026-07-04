import { archivePolicy } from '../config/archivePolicy.js';
import { getEnv } from '../core/env.js';
import { useArchiveAuth } from '../features/archive/useArchiveAuth.js';
import { useArchiveFiles } from '../features/archive/useArchiveFiles.js';
import { useArchiveListControls } from '../features/archive/useArchiveListControls.js';
import { useArchiveMutations } from '../features/archive/useArchiveMutations.js';
import { ArchiveAuthScreen } from './ArchiveAuthScreen.jsx';
import { ArchiveWorkspaceScreen } from './ArchiveWorkspaceScreen.jsx';

export function ArchiveView() {
  const rawBackend = getEnv('VITE_DATA_BACKEND') || 'local-api';
  const dataBackend = String(rawBackend).trim().replace(/^\uFEFF/g, '');
  const authState = useArchiveAuth({ dataBackend });
  const { files, setFiles, usedBytes, loading, error, firebaseReady } = useArchiveFiles(authState.userId);
  const listState = useArchiveListControls(files);
  const usedRatio = Math.min((usedBytes / archivePolicy.storageLimitBytes) * 100, 100);
  const mutations = useArchiveMutations({
    dataBackend,
    firebaseReady,
    selectedFile: listState.selectedFile,
    setFiles,
    setSelectedFile: listState.setSelectedFile,
    setSelectedIds: listState.setSelectedIds,
    usedBytes,
    userId: authState.userId,
  });

  if (authState.screenType === 'loading') {
    return <div className="auth-loading-placeholder" />;
  }

  if (authState.screenType) {
    return (
      <ArchiveAuthScreen
        authLoading={authState.authLoading}
        email={authState.email}
        onBackToLogin={authState.closeResetMode}
        onEmailChange={authState.setEmail}
        onLogin={authState.handleLogin}
        onPasswordChange={authState.setPassword}
        onPasswordReset={authState.handlePasswordReset}
        onPinChange={authState.setPin}
        onRememberEmailChange={authState.setRememberEmail}
        onResetEmailChange={authState.setResetEmail}
        onResetMode={authState.openResetMode}
        onUnlock={authState.handleUnlock}
        password={authState.password}
        pin={authState.pin}
        rememberEmail={authState.rememberEmail}
        resetEmail={authState.resetEmail}
        resetStatus={authState.resetStatus}
        status={authState.authStatus}
        type={authState.screenType}
      />
    );
  }

  return (
    <ArchiveWorkspaceScreen
      activeCategory={listState.activeCategory}
      authUser={authState.authUser}
      currentPage={listState.currentPage}
      dataBackend={dataBackend}
      error={error}
      filteredFiles={listState.filteredFiles}
      firebaseReady={firebaseReady}
      isAllSelected={listState.isAllSelected}
      isFirebaseBackend={authState.isFirebaseBackend}
      isSomeSelected={listState.isSomeSelected}
      loading={loading}
      onCategoryChange={listState.setActiveCategory}
      onDeleteFiles={mutations.deleteFiles}
      onDrop={mutations.handleDrop}
      onFiles={mutations.handleFiles}
      onLogout={authState.handleLogout}
      onPageChange={listState.setCurrentPage}
      onPageSizeChange={listState.setPageSize}
      onPaste={mutations.handlePaste}
      onQueryChange={listState.setQuery}
      onSelectAllToggle={listState.handleSelectAllToggle}
      onSelectedFileChange={listState.setSelectedFile}
      onToggleSelected={listState.toggleSelected}
      pageCount={listState.pageCount}
      pageNumbers={listState.pageNumbers}
      pageSize={listState.pageSize}
      query={listState.query}
      selectedFile={listState.selectedFile}
      selectedFiles={listState.selectedFiles}
      selectedIds={listState.selectedIds}
      status={mutations.mutationStatus}
      usedBytes={usedBytes}
      usedRatio={usedRatio}
      visibleFiles={listState.visibleFiles}
    />
  );
}

import { test, expect } from '@playwright/test';

test('로그인 화면 진입 및 인증 테스트', async ({ page }) => {
  await page.goto('/');

  const dataBackend = process.env.VITE_DATA_BACKEND || 'local-api';
  const isFirebase = dataBackend.trim().replace(/^\uFEFF/g, '') === 'firebase';

  if (isFirebase) {
    // Firebase 계정 로그인 폼 검증
    await expect(page.locator('h1')).toHaveText('계정 로그인');
    
    // 이메일 및 비밀번호 입력 필드 활성 여부 및 입력 테스트
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await emailInput.fill('test-e2e@example.com');
    await passwordInput.fill('invalidpassword123');
    
    // 로그인 제출 실행
    await page.click('button[type="submit"]');
    
    // 가짜 계정이므로 실패 알림(오류 메시지)이 노출되는지 검증하여 통신 흐름 확인
    const errorMsg = page.locator('.pin-error');
    await expect(errorMsg).toBeVisible();
  } else {
    // 로컬 PIN 인증 폼 검증
    await expect(page.locator('h1')).toHaveText('PIN 인증');
    
    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toBeVisible();
    
    // 올바른 로컬 PIN 번호 입력
    await pinInput.fill('0814');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 메인 아카이브 대시보드 진입 확인
    await expect(page.locator('h1')).toHaveText('개인용 아카이브 저장소');
  }
});

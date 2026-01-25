/**
 * CoreDNA2 E2E Test Suite
 * Playwright tests for all major features
 * 
 * Run with: npm run test:e2e
 * Single test: npx playwright test --grep "Email Delivery"
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('CoreDNA2 E2E Tests', () => {
  
  // ============================================================================
  // PHASE 1: BRAND DNA & PORTFOLIO MANAGEMENT
  // ============================================================================

  test('should load dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    expect(await page.title()).toContain('CoreDNA');
    const heading = page.locator('text=CoreDNA');
    await expect(heading).toBeVisible();
  });

  test('should extract brand DNA from website', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Fill extraction form
    await page.fill('input[placeholder*="website"]', 'https://example.com');
    await page.fill('input[placeholder*="brand"]', 'Example Brand');
    
    // Click extract button
    await page.click('button:has-text("Extract")');
    
    // Wait for result
    await page.waitForTimeout(5000);
    const result = page.locator('text=Brand DNA Result');
    await expect(result).toBeVisible({ timeout: 10000 });
  });

  test('should save portfolio after extraction', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Extract brand
    await page.fill('input[placeholder*="website"]', 'https://test.com');
    await page.fill('input[placeholder*="brand"]', 'Test Brand');
    await page.click('button:has-text("Extract")');
    await page.waitForTimeout(3000);
    
    // Save portfolio
    const saveButton = page.locator('button:has-text("Save Portfolio")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check dashboard
    await page.goto(`${BASE_URL}/#/dashboard`);
    const portfolioCard = page.locator('text=Test Brand');
    await expect(portfolioCard).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // PHASE 2: EMAIL DELIVERY
  // ============================================================================

  test('should configure email provider', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings`);
    
    // Navigate to email section
    const emailTab = page.locator('text=📧 Email Delivery');
    await expect(emailTab).toBeVisible();
    
    // Select provider
    await page.selectOption('select', 'resend');
    await expect(page.locator('select')).toHaveValue('resend');
    
    // Enter API key (dummy)
    await page.fill('input[placeholder*="API key"]', 'test_key_12345');
    
    // Save
    const saveButton = page.locator('button:has-text("Save Settings")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should send test email', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings`);
    
    // Configure email
    await page.selectOption('select', 'resend');
    await page.fill('input[placeholder*="API key"]', process.env.RESEND_API_KEY || '');
    
    // Send test
    const testButton = page.locator('button:has-text("Send Test Email")');
    if (await testButton.isVisible()) {
      await testButton.click();
      await page.waitForTimeout(2000);
      
      // Look for success notification
      const successToast = page.locator('text=✓').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================================
  // PHASE 2: SOCIAL MEDIA POSTING
  // ============================================================================

  test('should configure social media platforms', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings`);
    
    // Scroll to social section
    const socialSection = page.locator('text=📱 Social Media');
    await socialSection.scrollIntoViewIfNeeded();
    await expect(socialSection).toBeVisible();
    
    // Configure Instagram
    const instagramToken = page.locator('input[placeholder*="Instagram"]').first();
    await instagramToken.fill('test_instagram_token');
    
    // Configure Twitter
    const twitterToken = page.locator('input[placeholder*="Twitter"]');
    await twitterToken.fill('test_twitter_token');
    
    // Save
    const saveButton = page.locator('button:has-text("Save Settings")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should schedule and post to social media', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/scheduler`);
    
    // Create post
    await page.fill('input[placeholder*="content"]', 'Test post from CoreDNA2');
    await page.fill('input[placeholder*="image"]', 'https://via.placeholder.com/1024x1024');
    
    // Schedule
    await page.click('button:has-text("Schedule")');
    await page.waitForTimeout(1000);
    
    // Post to platform
    const postButton = page.locator('button:has-text("Post to Platform")');
    if (await postButton.isVisible()) {
      await postButton.click();
      await page.waitForTimeout(2000);
      
      const successToast = page.locator('text=✓').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================================
  // PHASE 2: LEAD GENERATION
  // ============================================================================

  test('should search for leads', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Scroll to lead section
    const leadSection = page.locator('text=Lead Hunter');
    await leadSection.scrollIntoViewIfNeeded();
    
    // Enter niche
    await page.fill('input[placeholder*="niche"]', 'digital marketing');
    
    // Search
    await page.click('button:has-text("Search Leads")');
    await page.waitForTimeout(3000);
    
    // Verify results
    const leadCards = page.locator('[data-testid="lead-card"]');
    const count = await leadCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter and score leads', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Search leads
    const leadSection = page.locator('text=Lead Hunter');
    await leadSection.scrollIntoViewIfNeeded();
    await page.fill('input[placeholder*="niche"]', 'saas');
    await page.click('button:has-text("Search Leads")');
    await page.waitForTimeout(3000);
    
    // Check scoring
    const scoreElements = page.locator('[data-testid="lead-score"]');
    const count = await scoreElements.count();
    expect(count).toBeGreaterThan(0);
  });

  // ============================================================================
  // PHASE 3: CAMPAIGN GENERATION
  // ============================================================================

  test('should generate campaign assets', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/campaigns`);
    
    // Select DNA
    const dnaSelect = page.locator('select[data-testid="dna-select"]');
    if (await dnaSelect.isVisible()) {
      await dnaSelect.click();
      await page.click('text=Example Brand');
    }
    
    // Set campaign goal
    await page.fill('input[placeholder*="goal"]', 'Increase brand awareness');
    
    // Select channels
    await page.click('label:has-text("Instagram")');
    await page.click('label:has-text("LinkedIn")');
    
    // Generate
    await page.click('button:has-text("Generate Assets")');
    await page.waitForTimeout(8000);
    
    // Verify assets
    const assetCards = page.locator('[data-testid="asset-card"]');
    const count = await assetCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should generate video for campaign', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/campaigns`);
    
    // Generate campaign first
    const dnaSelect = page.locator('select[data-testid="dna-select"]');
    if (await dnaSelect.isVisible()) {
      await dnaSelect.click();
      await page.click('text=Example Brand');
    }
    
    await page.fill('input[placeholder*="goal"]', 'Product launch');
    await page.click('button:has-text("Generate Assets")');
    await page.waitForTimeout(5000);
    
    // Generate video
    const videoButton = page.locator('button:has-text("Generate Video")').first();
    if (await videoButton.isVisible()) {
      await videoButton.click();
      await page.waitForTimeout(5000);
      
      const videoUrl = page.locator('[data-testid="video-url"]');
      await expect(videoUrl).toBeVisible({ timeout: 10000 });
    }
  });

  // ============================================================================
  // PHASE 3: WEBSITE BUILDER & DEPLOYMENT
  // ============================================================================

  test('should generate website from brand DNA', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/builder`);
    
    // Select DNA
    const dnaSelect = page.locator('select[data-testid="dna-select"]');
    if (await dnaSelect.isVisible()) {
      await dnaSelect.click();
      await page.click('text=Example Brand');
    }
    
    // Generate
    await page.click('button:has-text("Generate Website")');
    await page.waitForTimeout(5000);
    
    // Verify generation
    const preview = page.locator('[data-testid="site-preview"]');
    await expect(preview).toBeVisible({ timeout: 10000 });
  });

  test('should deploy website to Vercel', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/builder`);
    
    // Configure credentials
    const vercelTokenInput = page.locator('input[placeholder*="Vercel"]');
    if (await vercelTokenInput.isVisible()) {
      await vercelTokenInput.fill(process.env.VERCEL_TOKEN || 'test_token');
    }
    
    // Select DNA and generate
    const dnaSelect = page.locator('select[data-testid="dna-select"]');
    if (await dnaSelect.isVisible()) {
      await dnaSelect.click();
      await page.click('text=Example Brand');
    }
    
    await page.click('button:has-text("Deploy to Vercel")');
    await page.waitForTimeout(5000);
    
    // Verify deployment
    const liveUrl = page.locator('[data-testid="live-url"]');
    await expect(liveUrl).toBeVisible({ timeout: 15000 });
  });

  // ============================================================================
  // PHASE 3: CLOSER AGENT
  // ============================================================================

  test('should run Closer Agent on lead', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Search leads
    const leadSection = page.locator('text=Lead Hunter');
    await leadSection.scrollIntoViewIfNeeded();
    await page.fill('input[placeholder*="niche"]', 'consulting');
    await page.click('button:has-text("Search Leads")');
    await page.waitForTimeout(3000);
    
    // Run Closer Agent
    const closerButton = page.locator('button:has-text("Run Closer Agent")').first();
    if (await closerButton.isVisible()) {
      await closerButton.click();
      await page.waitForTimeout(5000);
      
      // Verify strategy
      const strategy = page.locator('[data-testid="closer-strategy"]');
      await expect(strategy).toBeVisible({ timeout: 10000 });
    }
  });

  test('should send email via Closer Agent', async ({ page }) => {
    // Setup email first
    await page.goto(`${BASE_URL}/#/settings`);
    await page.selectOption('select', 'resend');
    await page.fill('input[placeholder*="API key"]', process.env.RESEND_API_KEY || 'test_key');
    
    // Go back to extract
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Search leads
    const leadSection = page.locator('text=Lead Hunter');
    await leadSection.scrollIntoViewIfNeeded();
    await page.fill('input[placeholder*="niche"]', 'startup');
    await page.click('button:has-text("Search Leads")');
    await page.waitForTimeout(3000);
    
    // Run Closer Agent with email option
    const sendEmailCheckbox = page.locator('input[data-testid="send-email"]').first();
    if (await sendEmailCheckbox.isVisible()) {
      await sendEmailCheckbox.check();
    }
    
    const closerButton = page.locator('button:has-text("Run Closer Agent")').first();
    if (await closerButton.isVisible()) {
      await closerButton.click();
      await page.waitForTimeout(5000);
    }
  });

  // ============================================================================
  // PHASE 4: OFFLINE SUPPORT & SYNC
  // ============================================================================

  test('should work offline and sync when online', async ({ page, context }) => {
    // Create new page with offline mode
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to extract (should queue)
    await page.fill('input[placeholder*="website"]', 'https://offline-test.com');
    await page.fill('input[placeholder*="brand"]', 'Offline Brand');
    
    // Click extract (may fail but should queue)
    const extractButton = page.locator('button:has-text("Extract")');
    if (await extractButton.isEnabled()) {
      await extractButton.click();
    }
    
    // Go online
    await context.setOffline(false);
    await page.waitForTimeout(2000);
    
    // Check if operations synced
    const syncStatus = page.locator('[data-testid="sync-status"]');
    if (await syncStatus.isVisible()) {
      const status = await syncStatus.textContent();
      expect(status).toContain('synced');
    }
  });

  // ============================================================================
  // PHASE 4: ERROR HANDLING & NOTIFICATIONS
  // ============================================================================

  test('should show error notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/extract`);
    
    // Try to extract without URL (should error)
    await page.click('button:has-text("Extract")');
    await page.waitForTimeout(1000);
    
    // Verify error notification
    const errorToast = page.locator('[data-testid="toast-error"]').first();
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('should show success notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/dashboard`);
    
    // Save a setting to trigger success
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
      
      // Verify success notification
      const successToast = page.locator('[data-testid="toast-success"]').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  test('should load dashboard in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/#/dashboard`);
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should generate campaign in under 15 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/campaigns`);
    
    const dnaSelect = page.locator('select[data-testid="dna-select"]');
    if (await dnaSelect.isVisible()) {
      await dnaSelect.click();
      await page.click('text=Example Brand');
    }
    
    await page.fill('input[placeholder*="goal"]', 'Brand awareness');
    
    const startTime = Date.now();
    await page.click('button:has-text("Generate Assets")');
    await page.waitForTimeout(15000);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(15000);
  });
});

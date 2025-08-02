import { expect, test } from "@playwright/test";
import { ApiVerifier } from "./widget/page-objects/apiVerifier";
import { testAuth } from "./utils/testAuth";

test.describe("Chat Settings", () => {
  let apiVerifier: ApiVerifier;

  test.beforeEach(async ({ page }) => {
    apiVerifier = new ApiVerifier(page);
    await apiVerifier.startCapturing();
    
    // Authenticate as admin user
    await testAuth(page, "admin");
    
    // Navigate to chat settings page
    await page.goto("/settings/chat");
    await page.waitForLoadState("networkidle");
  });

  test("should display chat settings page with all sections", async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Settings/);
    
    // Verify widget installation section
    await expect(page.getByText("Widget Installation")).toBeVisible();
    await expect(page.getByText("Documentation")).toBeVisible();
    
    // Verify chat visibility section
    await expect(page.getByText("Chat Icon Visibility")).toBeVisible();
    await expect(page.getByText("Choose when your customers can see the chat widget")).toBeVisible();
    
    // Verify host URL section
    await expect(page.getByText("Chat widget host URL")).toBeVisible();
    await expect(page.getByText("The URL where your chat widget is installed")).toBeVisible();
    
    // Verify email response section
    await expect(page.getByText("Respond to email inquiries with chat")).toBeVisible();
    await expect(page.getByText("Automatically respond to emails as if the customer was using the chat widget")).toBeVisible();
  });

  test("should toggle chat visibility and save settings", async ({ page }) => {
    // Find the chat visibility switch
    const visibilitySwitch = page.locator("[data-testid='switch-section-wrapper']").first();
    
    // Check initial state (should be off by default)
    const switchInput = visibilitySwitch.locator("input[type='checkbox']");
    const isInitiallyChecked = await switchInput.isChecked();
    
    // Toggle the switch
    await visibilitySwitch.click();
    
    // Verify the switch state changed
    const isNowChecked = await switchInput.isChecked();
    expect(isNowChecked).not.toBe(isInitiallyChecked);
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
    
    // Verify API call was made
    // Note: This would require mocking or intercepting the API calls
    // await apiVerifier.verifyMailboxUpdateApiCall();
  });

  test("should update chat visibility mode", async ({ page }) => {
    // Enable chat visibility first
    const visibilitySwitch = page.locator("[data-testid='switch-section-wrapper']").first();
    const switchInput = visibilitySwitch.locator("input[type='checkbox']");
    
    if (!(await switchInput.isChecked())) {
      await visibilitySwitch.click();
    }
    
    // Wait for the mode selection to appear
    await page.waitForSelector("text=Show chat icon for", { timeout: 5000 });
    
    // Change mode to "All customers"
    await page.getByText("Select when to show chat icon").click();
    await page.getByText("All customers").click();
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
    
    // Change mode to "Customers with value greater than"
    await page.getByText("All customers").click();
    await page.getByText("Customers with value greater than").click();
    
    // Wait for the input field to appear
    await page.waitForSelector("input[type='number']", { timeout: 5000 });
    
    // Enter a value
    await page.locator("input[type='number']").fill("100");
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
  });

  test("should update host URL", async ({ page }) => {
    // Find the host URL input
    const hostUrlInput = page.locator("#widgetHost");
    
    // Clear and enter new URL
    await hostUrlInput.clear();
    await hostUrlInput.fill("https://example.com");
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
  });

  test("should update email response settings", async ({ page }) => {
    // Find the email response tabs
    const emailResponseTabs = page.locator("div").filter({ hasText: "Respond to email inquiries with chat" }).locator(".. >> div").last();
    
    // Click on "Draft" tab
    await emailResponseTabs.getByText("Draft").click();
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
    
    // Click on "Reply" tab
    await emailResponseTabs.getByText("Reply").click();
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
    
    // Click on "Off" tab
    await emailResponseTabs.getByText("Off").click();
    
    // Wait for save indicator
    await page.waitForSelector("text=Saved", { timeout: 10000 });
  });

  test("should display widget installation code snippets", async ({ page }) => {
    // Check HTML/JavaScript tab
    await page.getByText("HTML/JavaScript").click();
    
    // Verify code block is visible
    await expect(page.locator("code").first()).toBeVisible();
    
    // Check React/Next.js tab
    await page.getByText("React/Next.js").click();
    
    // Verify code block is visible
    await expect(page.locator("code").first()).toBeVisible();
    
    // Test accordion items
    await page.getByText("Customize the widget").click();
    await expect(page.getByText("Supported options:")).toBeVisible();
    
    await page.getByText("Add contextual help buttons").click();
    await expect(page.getByText("data-helper-prompt")).toBeVisible();
    
    await page.getByText("Authenticate your users").click();
    await expect(page.getByText("HMAC secret")).toBeVisible();
  });
});

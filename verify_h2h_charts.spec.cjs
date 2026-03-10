const { test, expect } = require('@playwright/test');
const path = require('path');

test('Verify Head-to-Head tab charts', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for upload button
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('text=Cargar Excel o CSV');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, 'verification_data.csv'));

  // Go to H2H tab
  await page.click('button:has-text("Head-to-Head")');

  // Wait for charts
  await page.waitForSelector('text=Comparativa por Calibre (FOB USD)');
  await page.waitForSelector('text=Comparativa de Volumen por Calibre');

  // Hover over the first bar in the first chart to check tooltip
  // Note: Hovering in Recharts might be tricky, but we can try to find a bar
  await page.locator('.recharts-bar-rectangle').first().hover();

  // Take screenshot
  await page.screenshot({ path: '/home/jules/verification/h2h_charts_check.png', fullPage: true });
});

const { test, expect } = require('@playwright/test');
const path = require('path');

test('Verify H2H Individual Results', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="email"]', 'admin@puravida.cl');
  await page.fill('input[type="password"]', 'admin');
  await page.click('button:has-text("Iniciar Sesión")');

  // Upload file
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('text=Cargar Excel o CSV');
  const fileChooser = await fileChooserPromise;

  const csvContent = `Nave,Cliente real,Cajas,Total vta,Final USD,Variedad_rot,Calibre_rot,Peso Neto,Contenedor,Productor,Fecha_despacho
Vessel1,HUASHENG,100,5000,700,Lapins,J,5,CONT1,PROD1,2024-01-01
Vessel1,YUHUA,100,4500,600,Lapins,J,5,CONT2,PROD2,2024-01-01
Vessel1,FRUIT MATE,100,6000,800,Lapins,J,5,CONT3,PROD3,2024-01-01`;

  const fs = require('fs');
  fs.writeFileSync('test_h2h.csv', csvContent);
  await fileChooser.setFiles(path.join(__dirname, 'test_h2h.csv'));

  // Wait for the upload to complete and the dashboard to appear
  await page.waitForSelector('text=Filtros Generales');

  // Go to H2H tab
  await page.click('button:has-text("Head-to-Head")');

  // Select multiple clients in B
  // Find the MultiSelect for Group B (it's the one under "COMPARAR CON (B)")
  const multiSelectTrigger = page.locator('div:has-text("COMPARAR CON (B)")').locator('..').locator('div.cursor-pointer');
  await multiSelectTrigger.click();

  // Wait for the dropdown and click FRUIT MATE
  await page.locator('div.absolute >> text=FRUIT MATE').click();

  // Close the dropdown by clicking outside or on the trigger again
  await multiSelectTrigger.click();

  // Wait for content
  await page.waitForSelector('text=RESULTADO DEL EJERCICIO');

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/home/jules/verification/h2h_individual_results.png', fullPage: true });
});

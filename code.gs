
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Stokify Pro - System Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Fungsi pembantu jika Anda ingin menambahkan integrasi Google Sheets nantinya.
 * Saat ini aplikasi masih menggunakan localStorage untuk penyimpanan data.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

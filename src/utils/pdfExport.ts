// src/utils/pdfExport.ts

import html2pdf from 'html2pdf.js';

/**
 * Basit bir test içeriği oluşturan fonksiyon
 */
export function generateBasicPDFContent(testTitle: string): HTMLElement {
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '16px';
  container.style.lineHeight = '1.5';

  // Başlık
  const title = document.createElement('h1');
  title.textContent = testTitle;
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  container.appendChild(title);

  // Açıklama
  const description = document.createElement('p');
  description.textContent = 'Bu bir örnek testtir. PDF çıktısı başarıyla oluşturuldu.';
  description.style.textAlign = 'center';
  container.appendChild(description);

  return container;
}

/**
 * PDF'i tarayıcıdan indirmek için fonksiyon
 */
export async function exportToPDF(testTitle: string) {
  const content = generateBasicPDFContent(testTitle);
  document.body.appendChild(content); // DOM'a ekle

  const options = {
    margin:       10,
    filename:     `${testTitle.replace(/[^\w\d]/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(content).save();
    console.log('PDF başarıyla indirildi.');
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    alert('PDF indirilemedi.');
  } finally {
    document.body.removeChild(content); // Temizlik
  }
}

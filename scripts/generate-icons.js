import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

// ES-Module-Kompatibilität für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon-Größen, die wir generieren möchten
const sizes = [16, 32, 64, 128, 192, 512];

// Pfad zur SVG-Datei
const svgPath = path.join(__dirname, '../public/AFM3.svg');

// Ausgabeverzeichnis
const outputDir = path.join(__dirname, '../public');

// Stellen Sie sicher, dass das Ausgabeverzeichnis existiert
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Erstellen Sie ein Favicon (16x16)
async function generateFavicon() {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  
  // Hintergrundfarbe (blau)
  ctx.fillStyle = '#1E40AF';
  ctx.fillRect(0, 0, 16, 16);
  
  try {
    // Laden Sie das SVG
    const img = await loadImage(svgPath);
    
    // Zeichnen Sie das SVG auf den Canvas
    ctx.drawImage(img, 0, 0, 16, 16);
    
    // Speichern Sie das Favicon
    const buffer = canvas.toBuffer('image/x-icon');
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), buffer);
    console.log('Favicon erstellt: favicon.ico');
  } catch (error) {
    console.error('Fehler beim Erstellen des Favicons:', error);
  }
}

// Generieren Sie PNG-Icons in verschiedenen Größen
async function generatePNGIcons() {
  try {
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Hintergrundfarbe (transparent)
      ctx.clearRect(0, 0, size, size);
      
      // Laden Sie das SVG
      const img = await loadImage(svgPath);
      
      // Zeichnen Sie das SVG auf den Canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // Speichern Sie das PNG
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(outputDir, `logo${size}.png`);
      fs.writeFileSync(outputPath, buffer);
      console.log(`PNG-Icon erstellt: logo${size}.png`);
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der PNG-Icons:', error);
  }
}

// Führen Sie die Funktionen aus
async function generateAllIcons() {
  await generateFavicon();
  await generatePNGIcons();
  console.log('Alle Icons wurden erfolgreich generiert!');
}

generateAllIcons();

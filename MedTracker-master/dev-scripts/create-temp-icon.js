const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Criar um ícone básico com um círculo e texto
async function createTempIcon() {
  const size = 1024;
  const outputDir = path.join(__dirname, '../assets/images');
  
  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Criar um SVG básico
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4A90E2"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2.5}" fill="white"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="#4A90E2" text-anchor="middle" dominant-baseline="middle">MT</text>
    </svg>
  `;

  // Converter SVG para PNG
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'icon.png'));

  console.log('Ícone temporário criado em:', path.join(outputDir, 'icon.png'));
}

createTempIcon();

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'splash.png': 1242,
  'adaptive-icon.png': 1024,
  'favicon.png': 48
};

const sourceIcon = path.join(__dirname, '../assets/images/icon.png');
const outputDir = path.join(__dirname, '../assets/images');

// Criar diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Gerar ícones
async function generateIcons() {
  try {
    for (const [filename, size] of Object.entries(sizes)) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(outputDir, filename));
      console.log(`Generated ${filename} (${size}x${size})`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

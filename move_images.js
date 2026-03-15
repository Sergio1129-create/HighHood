const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

const logoPath = path.join(__dirname, 'logo.png');
const targetLogoPath = path.join(imagesDir, 'logo.png');

if (fs.existsSync(logoPath)) {
    fs.renameSync(logoPath, targetLogoPath);
    console.log('Moved logo.png');
} else {
    console.log('logo.png not found');
}

const bgPath = path.join(__dirname, 'fondo-hero.png');
const targetBgPath = path.join(imagesDir, 'fondo-hero.png');

if (fs.existsSync(bgPath)) {
    fs.renameSync(bgPath, targetBgPath);
    console.log('Moved fondo-hero.png');
} else {
    console.log('fondo-hero.png not found');
}

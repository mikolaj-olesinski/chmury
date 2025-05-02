const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs').promises;
const sizes = [128, 144, 152, 192, 256, 512];

async function generateIcons() {
    // Generate PWA icons
    for (const size of sizes) {
        await sharp('images/logo.png')
            .resize(size, size)
            .toFile(`images/pwa-icon-${size}.png`);
        console.log(`Generated ${size}x${size} icon`);
    }

    // Generate favicon as PNG (32x32)
    await sharp('images/logo.png')
        .resize(32, 32)
        .toFile('images/favicon.png');
    console.log('Generated favicon.png');

    // Convert PNG to ICO
    const buf = await pngToIco('images/favicon.png');
    await fs.writeFile('favicon.ico', buf);
    console.log('Generated favicon.ico');

    // Clean up temporary favicon.png
    await fs.unlink('images/favicon.png');
}

generateIcons().catch(console.error); 
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const svgPath = path.join(__dirname, "public", "icon.svg");
const sizes = [192, 512];

async function generate() {
  const svg = fs.readFileSync(svgPath);
  for (const size of sizes) {
    const outPath = path.join(__dirname, "public", `icon-${size}.png`);
    await sharp(svg, { density: 300 })
      .resize(size, size, { fit: "contain", background: { r: 224, g: 122, b: 95 } })
      .png()
      .toFile(outPath);
    console.log(`Created ${outPath}`);
  }
}

generate().catch(console.error);

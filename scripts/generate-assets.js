const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { execSync } = require('child_process')

async function generateBrandingAssets() {
  console.log('🚀 Processing Custom User Logo Branding Assets...')

  const assetsDir = path.join(__dirname, '..', 'assets')
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true })
  }

  const iconPath = path.join(assetsDir, 'icon.png')

  if (!fs.existsSync(iconPath)) {
    console.error('❌ assets/icon.png not found!')
    process.exit(1)
  }

  console.log('🎨 Reading custom user logo from assets/icon.png...')

  // Load custom logo image buffer
  const sourceImage = sharp(iconPath)
  const metadata = await sourceImage.metadata()
  console.log(`📐 Custom logo dimensions: ${metadata.width}x${metadata.height}`)

  // 1. Generate 1024x1024 master icon files
  const iconBuffer = await sharp(iconPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 7, g: 12, b: 26, alpha: 1 } })
    .png()
    .toBuffer()

  await fs.promises.writeFile(path.join(assetsDir, 'icon-only.png'), iconBuffer)
  await fs.promises.writeFile(path.join(assetsDir, 'icon.png'), iconBuffer)

  // 2. Generate 1024x1024 adaptive foreground (inset slightly for Android safe zone)
  const foregroundBuffer = await sharp(iconPath)
    .resize(720, 720, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 152,
      bottom: 152,
      left: 152,
      right: 152,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()

  await fs.promises.writeFile(path.join(assetsDir, 'icon-foreground.png'), foregroundBuffer)

  // 3. Generate background buffer
  const bgBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 7, g: 12, b: 26, alpha: 1 }
    }
  }).png().toBuffer()

  await fs.promises.writeFile(path.join(assetsDir, 'icon-background.png'), bgBuffer)

  // 4. Generate 2732x2732 master splash screen with centered logo
  const logoResizedForSplash = await sharp(iconPath)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const splashBuffer = await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 7, g: 12, b: 26, alpha: 1 }
    }
  })
  .composite([{ input: logoResizedForSplash, top: 966, left: 966 }])
  .png()
  .toBuffer()

  await fs.promises.writeFile(path.join(assetsDir, 'splash.png'), splashBuffer)
  await fs.promises.writeFile(path.join(assetsDir, 'splash-dark.png'), splashBuffer)

  // 5. Update web favicons
  const publicFavicon = path.join(__dirname, '..', 'public', 'images', 'favicon.png')
  await sharp(iconPath)
    .resize(512, 512, { fit: 'contain', background: { r: 7, g: 12, b: 26, alpha: 1 } })
    .png()
    .toFile(publicFavicon)

  console.log('✅ Custom logo processed into master asset files in /assets directory!')

  console.log('⚡ Generating 148 Android resolution assets with @capacitor/assets...')
  execSync('npx @capacitor/assets generate --android', { stdio: 'inherit', cwd: path.join(__dirname, '..') })

  // Direct Android splash update
  const androidDrawableSplash = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'drawable', 'splash.png')
  await sharp(splashBuffer)
    .resize(1080, 1920, { fit: 'cover' })
    .png()
    .toFile(androidDrawableSplash)

  console.log('🎉 Custom Logo fully applied across all Android app launcher icons, splash screens, & web favicons!')
}

generateBrandingAssets().catch(err => {
  console.error('❌ Error processing custom logo branding assets:', err)
  process.exit(1)
})

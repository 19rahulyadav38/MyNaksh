/* eslint-env node */
/**
 * Builds release APKs and copies them to dist/ with shareable names:
 *   dist/MyNaksh-<version>-arm64-v8a.apk     most phones (recommended)
 *   dist/MyNaksh-<version>-armeabi-v7a.apk   older 32-bit phones
 *   dist/MyNaksh-<version>-x86_64.apk        emulators
 *   dist/MyNaksh-<version>-universal.apk     any device (larger)
 *
 * Usage: npm run build:apk
 *
 * Signed with the template debug keystore: installable by sideloading for
 * demos and testing, not suitable for Play Store distribution.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const outputDir = path.join(androidDir, 'app/build/outputs/apk/release');
const ARCHITECTURES = ['arm64-v8a', 'armeabi-v7a', 'x86_64'];
const VARIANTS = [...ARCHITECTURES, 'universal'];

function run(command, cwd = root) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function sizeMb(file) {
  return (fs.statSync(file).size / 1024 / 1024).toFixed(1);
}

const { version } = require(path.join(root, 'package.json'));
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

console.log(
  `\n▶ Building release APKs (${ARCHITECTURES.join(', ')} + universal)…\n`,
);
fs.rmSync(outputDir, { recursive: true, force: true });
run(
  `${gradlew} assembleRelease -PsplitAbi -PreactNativeArchitectures=${ARCHITECTURES.join(
    ',',
  )}`,
  androidDir,
);

const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, { recursive: true });

console.log('\n✔ APKs ready:');
for (const variant of VARIANTS) {
  const built = path.join(outputDir, `app-${variant}-release.apk`);
  if (!fs.existsSync(built)) {
    console.error(`✖ Missing ${path.relative(root, built)}`);
    process.exit(1);
  }
  const output = path.join(distDir, `MyNaksh-${version}-${variant}.apk`);
  fs.copyFileSync(built, output);
  console.log(
    `  ${path.relative(root, output).padEnd(42)} ${sizeMb(output)} MB`,
  );
}
console.log('\n  Most phones: share the arm64-v8a APK. Install via adb:');
console.log(`  adb install -r dist/MyNaksh-${version}-arm64-v8a.apk\n`);

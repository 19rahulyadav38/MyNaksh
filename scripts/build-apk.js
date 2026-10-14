/* eslint-env node */
/**
 * Builds a release APK and copies it to dist/ with a shareable name:
 *   dist/MyNaksh-<version>-<commit>.apk
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
const builtApk = path.join(
  androidDir,
  'app/build/outputs/apk/release/app-release.apk',
);
// Phones (arm64/armv7) and x86_64 emulators. 32-bit x86 is dropped to keep the APK smaller.
const ARCHITECTURES = 'arm64-v8a,armeabi-v7a,x86_64';

function run(command, cwd = root) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function shortCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: root })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

const { version } = require(path.join(root, 'package.json'));
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

console.log(`\n▶ Building release APK (${ARCHITECTURES})…\n`);
run(
  `${gradlew} assembleRelease -PreactNativeArchitectures=${ARCHITECTURES}`,
  androidDir,
);

if (!fs.existsSync(builtApk)) {
  console.error(`✖ Build finished but no APK found at ${builtApk}`);
  process.exit(1);
}

const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, { recursive: true });
const output = path.join(distDir, `MyNaksh-${version}-${shortCommit()}.apk`);
fs.copyFileSync(builtApk, output);

const sizeMb = (fs.statSync(output).size / 1024 / 1024).toFixed(1);
console.log(`\n✔ APK ready: ${path.relative(root, output)} (${sizeMb} MB)`);
console.log(
  '  Install on a connected device: adb install -r "' + output + '"\n',
);

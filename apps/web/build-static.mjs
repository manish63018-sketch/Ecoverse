import { renameSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const apiPath = './src/app/api';
const backupPath = './api-backup';
const middlewarePath = './src/middleware.ts';
const middlewareBackupPath = './middleware-backup.ts';
const proxyPath = './src/proxy.ts';
const proxyBackupPath = './proxy-backup.ts';

let apiRenamed = false;
let middlewareRenamed = false;
let proxyRenamed = false;

try {
  // 1. Rename api directory to hide it from static build
  if (existsSync(apiPath)) {
    renameSync(apiPath, backupPath);
    apiRenamed = true;
    console.log('Backed up api directory.');
  }

  // 2. Rename middleware/proxy files if they exist to avoid export warnings/failures
  if (existsSync(middlewarePath)) {
    renameSync(middlewarePath, middlewareBackupPath);
    middlewareRenamed = true;
    console.log('Backed up middleware.ts.');
  }
  if (existsSync(proxyPath)) {
    renameSync(proxyPath, proxyBackupPath);
    proxyRenamed = true;
    console.log('Backed up proxy.ts.');
  }

  // 3. Run the next build
  console.log('Running static next build...');
  execSync('npx next build', {
    env: { ...process.env, NEXT_PUBLIC_BUILD_TARGET: 'static' },
    stdio: 'inherit'
  });
  console.log('Static next build succeeded!');

} catch (err) {
  console.error('Static build failed:', err);
  process.exitCode = 1;
} finally {
  // 4. Restore everything
  if (apiRenamed && existsSync(backupPath)) {
    renameSync(backupPath, apiPath);
    console.log('Restored api directory.');
  }
  if (middlewareRenamed && existsSync(middlewareBackupPath)) {
    renameSync(middlewareBackupPath, middlewarePath);
    console.log('Restored middleware.ts.');
  }
  if (proxyRenamed && existsSync(proxyBackupPath)) {
    renameSync(proxyBackupPath, proxyPath);
    console.log('Restored proxy.ts.');
  }
}

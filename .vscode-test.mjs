import { defineConfig } from '@vscode/test-cli';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const tempUserDataDir = join(
  tmpdir(),
  `vscode-test-${Math.random().toString(36).slice(2)}`
);

const workspaceFolder = join(
  tmpdir(),
  `vscode-test-workspace-${Math.random().toString(36).slice(2)}`
);

if (!existsSync(workspaceFolder)) {
  console.log(`Creating test workspace directory: ${workspaceFolder}`);
  mkdirSync(workspaceFolder, { recursive: true });
}

console.log(`Using temporary user data directory for vscode: ${tempUserDataDir}`);
console.log(`Using test workspace directory: ${workspaceFolder}`);

export default defineConfig({
  files: 'out/test/**/*.test.js',
  workspaceFolder: workspaceFolder,
  launchArgs: [
    '--user-data-dir=' + tempUserDataDir,
  ],
  mocha: {
    timeout: 10000, // default is 2000 ms
  }
  // coverage: {} // https://github.com/microsoft/vscode-test-cli/issues/40#issuecomment-2815825666
});

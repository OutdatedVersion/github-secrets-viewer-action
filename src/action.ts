import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import proc from 'node:child_process';

export const run = async (env = process.env) => {
  assert(
    !!env.INPUT_SECRETS || !!env['INPUT_SECRETS-PATH'],
    'env.INPUT_SECRETS or env.INPUT_SECRETS-PATH must be set'
  );
  assert(!!env['INPUT_GPG-PUBLIC-KEY'], 'env.INPUT_GPG-PUBLIC-KEY must be set');

  console.log('::group::GPG version');
  console.log(proc.execSync('gpg --version').toString().trim());
  console.log('::endgroup::');

  const importOutput = proc
    .spawnSync('gpg', ['-vv', '--import', '-'], {
      input: env['INPUT_GPG-PUBLIC-KEY'],
    })
    .stderr.toString();

  const publicKeyId = importOutput
    .split('\n')
    .find((line) => line.trim().startsWith('keyid:'))
    ?.trim()
    .substring('keyid: '.length);

  assert(!!publicKeyId, 'could not figure out public key ID');

  console.log(`[info] Imported GPG public key (${publicKeyId})`);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'secrets'));
  console.log(`[debug] Using directory ${tmpDir}`);

  // https://www.gnupg.org/documentation/manuals/gnupg/Unattended-GPG-key-generation.html
  const keyConfig = [
    'Key-Type: RSA',
    'Key-Length: 4096',
    'Key-Usage: encrypt',
    'Subkey-Type: 1',
    'Subkey-Length: 4096',
    'Name-Real: GitHub secrets viewer',
    'Expire-Date: 0',
    '%no-protection',
    '%transient-key',
  ].join('\n');
  await fs.writeFile(path.join(tmpDir, 'gpg-key-config'), keyConfig);
  console.log('::group::GPG key config');
  console.log(keyConfig);
  console.log('::endgroup::');

  const keygenOutput = proc
    .spawnSync('gpg', ['-vv', '--full-gen-key', '--batch', path.join(tmpDir, 'gpg-key-config')])
    .stderr.toString();
  console.log('[info] Generated GPG key for local use');

  const secretKeyId = keygenOutput
    .split('\n')
    .find((line) => line.includes('GitHub secrets viewer'))
    ?.match(/"(.+) GitHub secrets viewer"/i)?.[1];

  assert(!!secretKeyId, 'could not figure out secret key ID: ' + keygenOutput);

  const secretContentPath = path.join(tmpDir, 'content');

  if (env.INPUT_SECRETS) {
    await fs.appendFile(secretContentPath, `${env.INPUT_SECRETS.trim()}\n`, {
      encoding: 'utf8',
    });
  }

  if (env['INPUT_SECRETS-PATH']) {
    const p = path.resolve(env['INPUT_SECRETS-PATH']);
    const contents = await fs.readFile(p);
    await fs.appendFile(path.join(tmpDir, 'content'), contents, { encoding: 'utf8' });
    console.log(`[debug] Content from '${p}' included`);
  }

  const encryptCmd = [
    'gpg',
    '--encrypt',
    // auto-trust generated key
    '--trust-model',
    'always',
    '--local-user',
    secretKeyId,
    '--recipient',
    publicKeyId,
    '--output',
    path.join(tmpDir, 'secrets.gpg'),
    path.join(tmpDir, 'content'),
  ].join(' ');
  console.log(`[debug] Encryption command '${encryptCmd}'`);
  proc.execSync(encryptCmd);

  const contents = await fs.readdir(tmpDir);
  console.log('[debug] Directory contents', contents);
  assert(contents.includes('secrets.gpg'), 'encryption failed silently');

  console.log(`[info] Content encrypted ${path.join(tmpDir, 'secrets.gpg')}`);
  if (env.GITHUB_OUTPUT) {
    await fs.appendFile(env.GITHUB_OUTPUT, `path=${path.join(tmpDir, 'secrets.gpg')}`);
  }

  await fs.rm(secretContentPath);
};

run();

import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export function generateKeysIfNotExist() {
  const keysDir = path.join(process.cwd(), '.keys');
  const privateKeyPath = path.join(keysDir, 'private.pem');
  const publicKeyPath = path.join(keysDir, 'public.pem');

  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    console.log('Keys already exist. Skipping key generation.');
    return;
  }

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
  }

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log('Keys generated and saved to', keysDir);
}

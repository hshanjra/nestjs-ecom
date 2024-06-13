import * as crypto from 'node:crypto';

export default function generateRandomString(length: number): string {
  if (length <= 0) {
    throw new Error('Length must be a positive integer');
  }

  // Generate random bytes and convert to base64
  const randomBytes = crypto.randomBytes(Math.ceil((length * 3) / 4));
  const randomString = randomBytes
    .toString('base64')
    .replace(/\+/g, '0') // Replace '+' with '0'
    .replace(/\//g, '0') // Replace '/' with '0'
    .replace(/=+$/, ''); // Remove any trailing '=' characters

  // Return the string trimmed to the specified length
  return randomString.substring(0, length);
}

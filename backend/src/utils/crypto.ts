import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const secret = process.env.MESSAGE_ENCRYPTION_KEY || 'kinderconnect-message-secret';
const key = createHash('sha256').update(secret).digest();

export const encryptField = (value: string) => {
  if (!value) {
    return '';
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptField = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const [ivHex, tagHex, dataHex] = value.split(':');
  if (!ivHex || !tagHex || !dataHex) {
    return value;
  }

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);

  return decrypted.toString('utf8');
};

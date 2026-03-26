"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptField = exports.encryptField = void 0;
const crypto_1 = require("crypto");
const secret = process.env.MESSAGE_ENCRYPTION_KEY || 'kinderconnect-message-secret';
const key = (0, crypto_1.createHash)('sha256').update(secret).digest();
const encryptField = (value) => {
    if (!value) {
        return '';
    }
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};
exports.encryptField = encryptField;
const decryptField = (value) => {
    if (!value) {
        return '';
    }
    const [ivHex, tagHex, dataHex] = value.split(':');
    if (!ivHex || !tagHex || !dataHex) {
        return value;
    }
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
};
exports.decryptField = decryptField;

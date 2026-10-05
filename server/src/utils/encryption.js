import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Retrieves and validates the 32-byte master encryption key from environment.
 * Throws a fatal error if missing or incorrectly sized.
 */
const getMasterKey = () => {
  const keyEnv = process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_MASTER_KEY;
  if (!keyEnv) {
    throw new Error(
      'FATAL SECURITY CONFIGURATION ERROR: ENCRYPTION_KEY is not defined in environment variables.'
    );
  }

  // Support 64-char hex string (32 bytes) or raw 32-char ASCII/UTF8 string
  let keyBuffer;
  if (keyEnv.length === 64 && /^[0-9a-fA-F]+$/.test(keyEnv)) {
    keyBuffer = Buffer.from(keyEnv, 'hex');
  } else if (Buffer.byteLength(keyEnv, 'utf8') === 32) {
    keyBuffer = Buffer.from(keyEnv, 'utf8');
  } else {
    // If key is not exactly 32 bytes, derive a 32-byte key via SHA-256 or reject
    keyBuffer = crypto.createHash('sha256').update(keyEnv).digest();
  }

  if (keyBuffer.length !== 32) {
    throw new Error(
      'FATAL SECURITY ERROR: Encryption key must be exactly 32 bytes (256 bits).'
    );
  }

  return keyBuffer;
};

/**
 * Encrypt sensitive plaintext using AES-256-GCM.
 * @param {string} text - Plaintext to encrypt (e.g. AI API key)
 * @returns {{ encryptedText: string, iv: string, authTag: string }}
 */
export const encryptKey = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Encryption error: Input text must be a non-empty string.');
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedText: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag,
  };
};

/**
 * Decrypt ciphertext using AES-256-GCM with cryptographic integrity verification.
 * @param {string} encryptedText - Hex-encoded ciphertext
 * @param {string} iv - Hex-encoded initialization vector
 * @param {string} authTag - Hex-encoded authentication tag
 * @returns {string} Decrypted plaintext
 */
export const decryptKey = (encryptedText, iv, authTag) => {
  if (!encryptedText || !iv || !authTag) {
    throw new Error('Decryption error: Missing ciphertext, IV, or Auth Tag.');
  }

  const key = getMasterKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export default {
  encryptKey,
  decryptKey,
};

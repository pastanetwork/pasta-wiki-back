const crypto = require('crypto');
const { encryption_values } = require("./env-values-dictionnary");

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const keyHex = encryption_values.key;

function encrypt(text) {
    if (!text || typeof text !== 'string') {
        console.log((!text || typeof text !== 'string'), "|", text, "|", typeof text);
        return { ok: false };
    }
    
    try {
        const key = Buffer.from(keyHex, 'base64').slice(0, KEY_LENGTH);
        
        if (key.length !== KEY_LENGTH) {
            console.log('Invalid key length after decoding:', key.length);
            return { ok: false };
        }
        
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        
        return {
            ok: true,
            data: `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
        };
    } catch (error) {
        console.log('Encryption error:', error);
        return { ok: false };
    }
}

function decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') {
        console.log('Invalid encrypted data');
        return { ok: false };
    }
    
    try {
        const parts = encryptedData.split(':');
        
        if (parts.length !== 3) {
            console.log('Invalid encrypted data format');
            return { ok: false };
        }
        
        const [ivHex, authTagHex, encrypted] = parts;
        const key = Buffer.from(keyHex, 'base64').slice(0, KEY_LENGTH);
        
        if (key.length !== KEY_LENGTH) {
            console.log('Invalid key length after decoding:', key.length);
            return { ok: false };
        }
        
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return { ok: true, data: decrypted };
    } catch (error) {
        console.log('Decryption error:', error);
        return { ok: false };
    }
}

module.exports = { encrypt, decrypt };
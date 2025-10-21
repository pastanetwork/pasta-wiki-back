
const crypto = require('crypto');
const { encryption_values } = require("./env-values-dictionnary")

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const keyHex = encryption_values.key;

function encrypt(text) {
	if (!text || typeof text !== 'string') {
		return {ok:false};
	}
	
	if (!keyHex || keyHex.length !== KEY_LENGTH * 2) {
		return {ok:false};
	}
	
	try {
		const key = Buffer.from(keyHex, 'hex');
		const iv = crypto.randomBytes(IV_LENGTH);
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag();
		return {ok:true,key:`${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`}
	} catch (error) {
		return {ok:false};
	}
}

function decrypt(encryptedData) {
	if (!encryptedData || typeof encryptedData !== 'string') {
		return {ok:false};
	}
	
	if (!keyHex || keyHex.length !== KEY_LENGTH * 2) {
		return {ok:false};
	}
	
	try {
		const parts = encryptedData.split(':');
		
		if (parts.length !== 3) {
		return {ok:false};
		}
		
		const [ivHex, authTagHex, encrypted] = parts;
		const key = Buffer.from(keyHex, 'hex');
		const iv = Buffer.from(ivHex, 'hex');
		const authTag = Buffer.from(authTagHex, 'hex');
		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		
		return {ok:true,key:decrypted};
	} catch (error) {
		return {ok:false};
	}
}


module.exports = { encrypt, decrypt};
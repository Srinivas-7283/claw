// Encryption utilities for API keys and sensitive data
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;

if (!MASTER_KEY || MASTER_KEY.length !== 64) {
    throw new Error(
        "ENCRYPTION_MASTER_KEY must be set and be 64 characters (32 bytes hex)"
    );
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(MASTER_KEY!, "hex"),
        iv
    );

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

    if (!ivHex || !authTagHex || !encrypted) {
        throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(MASTER_KEY!, "hex"),
        iv
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

// Generate a new encryption key (for setup)
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
}

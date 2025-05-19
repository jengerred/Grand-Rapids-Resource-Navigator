import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFACore {
  static generateSecret(email: string, issuer: string) {
    return speakeasy.generateSecret({
      name: `${issuer} (${email})`,
      length: 32,
      issuer
    });
  }

  static async generateQRCode(otpauth_url: string) {
    return QRCode.toDataURL(otpauth_url);
  }

  static verifyCode(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }
}

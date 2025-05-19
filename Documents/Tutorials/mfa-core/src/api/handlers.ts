import { MFACore } from '../core/totp';
import { MFAPolicy } from '../core/security';

export class MFAHandlers {
  static async setupMFA(user: { email: string }) {
    const secret = MFACore.generateSecret(user.email, 'YourApp');
    return {
      secret: secret.base32,
      backupCodes: MFAPolicy.createBackupCodes()
    };
  }

  static async verifyLoginAttempt(secret: string, code: string) {
    if (!MFAPolicy.validateCodeFormat(code)) return false;
    return MFACore.verifyCode(secret, code);
  }
}

export class MFAPolicy {
    static createBackupCodes(count = 10) {
      return Array.from({ length: count }, () => 
        crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{4}/g)?.join('-')
      ).filter(Boolean) as string[];
    }
  
    static validateCodeFormat(code: string) {
      return /^\d{6}$/.test(code);
    }
  
    static rateLimiter() {
      return {
        points: 5,
        duration: 60 * 15 // 15 minutes
      };
    }
  }
  
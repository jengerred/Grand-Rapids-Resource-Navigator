export interface MFASchema {
    twoFactorSecret?: string;
    twoFactorEnabled: boolean;
    backupCodes?: string[];
    lastUsedFactor?: Date;
  }
  
  export const MFADefaults = {
    twoFactorEnabled: false,
    backupCodes: [] as string[]
  };
  
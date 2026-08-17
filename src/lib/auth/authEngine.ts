import { db } from '../database/db';

export interface UserAuthCredentials {
  email: string;
  passwordHash: string;
  securityQuestion: string;
  securityAnswerHash: string;
  masterRecoveryKey: string;
}

export const DEFAULT_AUTH_CREDENTIALS: UserAuthCredentials = {
  email: 'debashishbordoloi007@gmail.com',
  passwordHash: '',
  securityQuestion: 'What is your primary business name?',
  securityAnswerHash: '',
  masterRecoveryKey: 'SECURE-2026-RESET'
};

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthEngine = {
  async initDefaultAuth(): Promise<UserAuthCredentials> {
    const existing = await db.settings.get('authCredentials');
    if (existing) {
      return existing.value;
    }

    const defaultPassHash = await hashString('saveme@GOD2023');
    const defaultAnswerHash = await hashString('debashish');

    const credentials: UserAuthCredentials = {
      ...DEFAULT_AUTH_CREDENTIALS,
      passwordHash: defaultPassHash,
      securityAnswerHash: defaultAnswerHash
    };

    await db.settings.put({ key: 'authCredentials', value: credentials });
    return credentials;
  },

  async verifyLogin(emailInput: string, passwordInput: string): Promise<boolean> {
    const credentials = await this.initDefaultAuth();
    const cleanEmail = emailInput.trim().toLowerCase();
    const targetEmail = credentials.email.toLowerCase();

    if (cleanEmail !== targetEmail && cleanEmail !== 'debashishbordoloi007@gmail.com') {
      return false;
    }

    const inputHash = await hashString(passwordInput);
    return inputHash === credentials.passwordHash;
  },

  async resetPassword(emailInput: string, keyOrAnswer: string, newPasswordInput: string): Promise<{ success: boolean; message?: string }> {
    const credentials = await this.initDefaultAuth();
    const inputKey = keyOrAnswer.trim();

    if (!inputKey) {
      return { success: false, message: 'Please enter Master Recovery Key (SECURE-2026-RESET) or Security Answer.' };
    }

    const inputHash = await hashString(inputKey.toLowerCase());
    const isMasterKeyMatch = inputKey === credentials.masterRecoveryKey || inputKey === 'SECURE-2026-RESET';
    const isAnswerMatch = inputHash === credentials.securityAnswerHash || inputKey.toLowerCase().includes('debashish');

    if (!isMasterKeyMatch && !isAnswerMatch) {
      return { success: false, message: 'Incorrect Recovery Key or Security Answer. Hint: Master Key is SECURE-2026-RESET' };
    }

    const newHash = await hashString(newPasswordInput);
    const updated: UserAuthCredentials = {
      ...credentials,
      email: emailInput.trim() || credentials.email,
      passwordHash: newHash
    };

    await db.settings.put({ key: 'authCredentials', value: updated });
    return { success: true };
  },

  setSessionLoggedIn(): void {
    sessionStorage.setItem('doc_os_logged_in', 'true');
  },

  isSessionLoggedIn(): boolean {
    return sessionStorage.getItem('doc_os_logged_in') === 'true';
  },

  logout(): void {
    sessionStorage.removeItem('doc_os_logged_in');
  }
};

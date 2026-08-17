import { db } from '../database/db';

export interface UserAccount {
  username: string;
  passwordHash: string;
}

export interface UserAuthStore {
  accounts: Record<string, string>; // username -> passwordHash
  securityQuestion: string;
  securityAnswerHash: string;
  masterRecoveryKey: string;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthEngine = {
  async initDefaultAuth(): Promise<UserAuthStore> {
    const existing = await db.settings.get('authStore');
    
    const defaultDebashishHash = await hashString('saveme@GOD2023');
    const defaultGomtayeHash = await hashString('gomtaya@sir');
    const defaultAnswerHash = await hashString('debashish');

    if (existing) {
      // Ensure both default accounts exist in store
      const store: UserAuthStore = existing.value;
      if (!store.accounts['debashishbordoloi007@gmail.com']) {
        store.accounts['debashishbordoloi007@gmail.com'] = defaultDebashishHash;
      }
      if (!store.accounts['gomtaye']) {
        store.accounts['gomtaye'] = defaultGomtayeHash;
      }
      await db.settings.put({ key: 'authStore', value: store });
      return store;
    }

    const store: UserAuthStore = {
      accounts: {
        'debashishbordoloi007@gmail.com': defaultDebashishHash,
        'gomtaye': defaultGomtayeHash
      },
      securityQuestion: 'What is your primary business name?',
      securityAnswerHash: defaultAnswerHash,
      masterRecoveryKey: 'SECURE-2026-RESET'
    };

    await db.settings.put({ key: 'authStore', value: store });
    return store;
  },

  async verifyLogin(userInput: string, passwordInput: string): Promise<boolean> {
    const store = await this.initDefaultAuth();
    const cleanUser = userInput.trim().toLowerCase();
    const inputHash = await hashString(passwordInput);

    // Search accounts case-insensitively
    for (const [storedUser, storedHash] of Object.entries(store.accounts)) {
      if (storedUser.toLowerCase() === cleanUser) {
        return inputHash === storedHash;
      }
    }

    return false;
  },

  async resetPassword(userInput: string, keyOrAnswer: string, newPasswordInput: string): Promise<{ success: boolean; message?: string }> {
    const store = await this.initDefaultAuth();
    const inputKey = keyOrAnswer.trim();
    const cleanUser = userInput.trim().toLowerCase();

    if (!inputKey) {
      return { success: false, message: 'Please enter Recovery Key or Security Answer.' };
    }

    const inputHash = await hashString(inputKey.toLowerCase());
    const isMasterKeyMatch = inputKey === store.masterRecoveryKey || inputKey === 'SECURE-2026-RESET';
    const isAnswerMatch = inputHash === store.securityAnswerHash || inputKey.toLowerCase().includes('debashish') || inputKey.toLowerCase().includes('gomtaye');

    if (!isMasterKeyMatch && !isAnswerMatch) {
      return { success: false, message: 'Incorrect Recovery Key or Security Answer.' };
    }

    const newHash = await hashString(newPasswordInput);
    
    // Find matching account key or set for user
    let targetAccountKey = Object.keys(store.accounts).find(k => k.toLowerCase() === cleanUser);
    if (!targetAccountKey) {
      targetAccountKey = cleanUser || 'debashishbordoloi007@gmail.com';
    }

    store.accounts[targetAccountKey] = newHash;
    await db.settings.put({ key: 'authStore', value: store });
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

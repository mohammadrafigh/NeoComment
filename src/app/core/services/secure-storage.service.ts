import { Injectable } from "@angular/core";
import { SecureStorage } from "@nativescript/secure-storage";

@Injectable({
  providedIn: "root",
})
export class SecureStorageService {
  private secureStorage = new SecureStorage();

  /**
   *
   * @param key
   * @param value
   * @returns a Promise that resolves to true if the value was set successfully, false otherwise.
   */
  set(key: string, value: string): Promise<boolean> {
    return this.secureStorage.set({ key, value });
  }

  /**
   *
   * @param key
   * @param value
   * @returns true if the value was set successfully, false otherwise.
   */
  setSync(key: string, value: string): boolean {
    return this.secureStorage.setSync({ key, value });
  }

  /**
   *
   * @param key
   * @returns a Promise that resolves to the value associated with the key, or null if the key does not exist.
   */
  async get<T>(key: string): Promise<T> {
    const value = await this.secureStorage.get({ key });
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param key
   * @returns the value associated with the key, or null if the key does not exist.
   */
  getSync<T>(key: string): T {
    const value = this.secureStorage.getSync({ key });
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param key
   * @returns a Promise that resolves to true if the value was removed successfully, false otherwise.
   */
  remove(key: string): Promise<boolean> {
    return this.secureStorage.remove({ key });
  }

  /**
   *
   * @param key
   * @returns true if the value was removed successfully, false otherwise.
   */
  removeSync(key: string): boolean {
    return this.secureStorage.removeSync({ key });
  }

  /**
   *
   * @returns a Promise that resolves to true if all values were removed successfully, false otherwise.
   */
  removeAll(): Promise<boolean> {
    return this.secureStorage.removeAll();
  }

  /**
   *
   * @returns true if all values were removed successfully, false otherwise.
   */
  removeAllSync(): boolean {
    return this.secureStorage.removeAllSync();
  }
}

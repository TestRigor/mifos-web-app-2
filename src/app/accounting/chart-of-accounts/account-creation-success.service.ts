/** Angular Imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service to track GL Account creation success state.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountCreationSuccessService {
  private accountCreatedSubject = new BehaviorSubject<boolean>(false);
  private readonly STORAGE_KEY = 'mifos_account_creation_success';
  
  public accountCreated$ = this.accountCreatedSubject.asObservable();

  constructor() {
    // Check if there's a persistent success state on service initialization
    const persistentState = this.getPersistentSuccessState();
    if (persistentState) {
      this.accountCreatedSubject.next(true);
    }
  }

  /**
   * Mark that an account was successfully created.
   */
  markAccountCreated(): void {
    this.accountCreatedSubject.next(true);
    // Also store in localStorage for persistence across navigation
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      created: true,
      timestamp: Date.now()
    }));
  }

  /**
   * Clear the success state (called when success message is shown).
   */
  clearSuccessState(): void {
    this.accountCreatedSubject.next(false);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if an account was recently created.
   */
  isAccountCreated(): boolean {
    return this.accountCreatedSubject.value || this.getPersistentSuccessState();
  }

  /**
   * Check localStorage for persistent success state.
   * Success state is valid for 30 seconds to prevent stale states.
   */
  private getPersistentSuccessState(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        // Success state is valid for 30 seconds
        if (data.created && (now - data.timestamp) < 30000) {
          return true;
        } else {
          // Remove expired state
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (e) {
      // Invalid data, remove it
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return false;
  }
}
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class SessionStorageService {
    constructor() { }

    // Save data to session storage
    setItem(key: string, value: any): void {
        try {
            const stringValue = JSON.stringify(value);
            sessionStorage.setItem(key, stringValue);
        } catch (error) {
            console.error('Error saving to session storage', error);
        }
    }

    // Get data from session storage
    getItem<T>(key: string): T | null {
        try {
            const data = sessionStorage.getItem(key);
            return data ? (JSON.parse(data) as T) : null;
        } catch (error) {
            console.error('Error reading from session storage', error);
            return null;
        }
    }

    // Remove data from session storage
    removeItem(key: string): void {
        sessionStorage.removeItem(key);
    }

    // Clear all session storage data
    clear(): void {
        sessionStorage.clear();
    }

    // Check if a key exists
    exists(key: string): boolean {
        return sessionStorage.getItem(key) !== null;
    }
}

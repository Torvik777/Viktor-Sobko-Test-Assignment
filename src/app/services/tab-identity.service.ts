import { Injectable } from '@angular/core';

const DEVICE_ID_KEY = 'presence:deviceId';
const TAB_ID_KEY = 'presence:tabId';

@Injectable({
  providedIn: 'root'
})
export class TabIdentityService {
  readonly deviceId: string;
  readonly tabId: string;
  constructor() { 
    this.deviceId = this.getOrCreateDeviceId();
    this.tabId = this.getOrCreateTabId();
  }

  private getOrCreateDeviceId(): string {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const id = this.uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  }

  private getOrCreateTabId(): string {
    const existing = sessionStorage.getItem(TAB_ID_KEY);
    if (existing) return existing;

    const id = this.uuid();
    sessionStorage.setItem(TAB_ID_KEY, id);
    return id;
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }


}

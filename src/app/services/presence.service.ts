import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TabIdentityService } from './tab-identity.service';
import { UserTabsApiService } from './user-tabs-api.service';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

private auth = inject(AuthService);
  private ids = inject(TabIdentityService);
  private api = inject(UserTabsApiService);

  private isActive = signal<boolean>(document.visibilityState === 'visible' && document.hasFocus());

  private heartbeatTimer: number | null = null;


  private readonly HEARTBEAT_MS = 10_000; 
  private readonly ACTIVE_TTL_SEC = 30;   
  private readonly IDLE_TTL_SEC = 120;

  // private readonly HEARTBEAT_MS = 1_000;  
  // private readonly ACTIVE_TTL_SEC = 3;   
  // private readonly IDLE_TTL_SEC = 6; 

  start(): void {
    if (this.heartbeatTimer !== null) return;

    this.attachTabActivityListeners();
    void this.pushNow();

    this.heartbeatTimer = window.setInterval(() => {
      void this.pushNow();
    }, this.HEARTBEAT_MS);

    effect(() => {
      this.isActive();
      if (this.auth.isAuthenticated()) {
        void this.pushNow();
      }
    });
  }

  stop(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.detachTabActivityListeners();
  }

  getIdentity() {
    return { deviceId: this.ids.deviceId, tabId: this.ids.tabId };
  }

  classify(lastSeenIso: string, isActiveFlag: boolean): 'active' | 'idle' | 'stale' {
    const last = new Date(lastSeenIso).getTime();
    const ageSec = (Date.now() - last) / 1000;

    if (ageSec > this.IDLE_TTL_SEC) return 'stale';
    if (isActiveFlag && ageSec <= this.ACTIVE_TTL_SEC) return 'active';
    return 'idle';
  }

  private async pushNow(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;

    const row = {
      user_id: user.id,
      device_id: this.ids.deviceId,
      tab_id: this.ids.tabId,
      user_agent: navigator.userAgent,
      is_active: this.isActive(),
      last_seen: new Date().toISOString(),
    };

    const res = await this.api.upsertTab(row);
  }

  private onFocus = () => this.isActive.set(true);
  private onBlur = () => this.isActive.set(false);
  private onVisibilityChange = () => {
    const active = document.visibilityState === 'visible' && document.hasFocus();
    this.isActive.set(active);
  };

  private attachTabActivityListeners(): void {
    window.addEventListener('focus', this.onFocus);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private detachTabActivityListeners(): void {
    window.removeEventListener('focus', this.onFocus);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}

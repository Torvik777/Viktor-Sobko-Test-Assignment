import { Component, effect, inject,signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { TabIdentityService } from '../../services/tab-identity.service';
import { PresenceService } from '../../services/presence.service';
import { UserTabsApiService, UserTabRow } from '../../services/user-tabs-api.service';
import { DatePipe } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

type UiTab = UserTabRow & { state: 'active' | 'idle' | 'stale'; isCurrent: boolean };

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [ButtonModule, CardModule, DividerModule, DatePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected tabIdentityService = inject(TabIdentityService);
  protected userTabsApiService = inject(UserTabsApiService);
  protected presenceService = inject(PresenceService);

  tabs = signal<UiTab[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  private pollTimer: number | null = null;

  constructor() {
    this.presenceService.start();

    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this.router.navigateByUrl('/login');
      }
    });
    this.presenceService.start();
    this.startPolling();
  }

  onLogout(): void {
    void this.auth.signOut();
  }

  ngOnDestroy(): void {
    this.presenceService.stop();
     if (this.pollTimer !== null) clearInterval(this.pollTimer);
  }

  devices = computed(() => {
    const map = new Map<string, UiTab[]>();
    for (const t of this.tabs()) {
      const arr = map.get(t.device_id) ?? [];
      arr.push(t);
      map.set(t.device_id, arr);
    }
    return Array.from(map.entries()).map(([deviceId, tabs]) => ({
      deviceId,
      tabs: tabs.sort((a, b) => (a.tab_id > b.tab_id ? 1 : -1)),
    }));
  });

  activeTabsCount = computed(() => this.tabs().filter(t => t.state === 'active').length);
  onlineTabsCount = computed(() => this.tabs().filter(t => t.state !== 'stale').length);


   private startPolling(): void {
    void this.loadTabs();

    this.pollTimer = window.setInterval(() => {
      void this.loadTabs();
    }, 5000);
  }

  private async loadTabs(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    const { deviceId, tabId } = this.presenceService.getIdentity();

    try {
      const res = await this.userTabsApiService.listMyTabs(user.id);
      if (res.error) throw res.error;

      const rows = (res.data ?? []) as UserTabRow[];

      const ui: UiTab[] = rows.map(r => ({
        ...r,
        state: this.presenceService.classify(r.last_seen, r.is_active),
        isCurrent: r.device_id === deviceId && r.tab_id === tabId,
      }));

      this.tabs.set(ui);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load tabs');
    } finally {
      this.loading.set(false);
    }
  }

}

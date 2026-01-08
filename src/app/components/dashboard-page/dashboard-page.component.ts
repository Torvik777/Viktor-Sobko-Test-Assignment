import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { TabIdentityService } from '../../services/tab-identity.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected tabIdentityService = inject(TabIdentityService);

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this.router.navigateByUrl('/login');
      }
    });
  }

  onLogout(): void {
    void this.auth.signOut();
  }
}

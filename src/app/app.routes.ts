import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { authGuard } from './guards/auth.guard';
import { DashboardPageComponent } from './components/dashboard-page/dashboard-page.component';

export const routes: Routes = [
    { path: 'login', component: LoginPageComponent },
    { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
];

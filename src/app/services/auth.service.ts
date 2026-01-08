import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from './../core/supabase.client';

type SbUser = (Awaited<ReturnType<typeof supabase.auth.getUser>>)['data']['user'];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  private _user = signal<SbUser>(null);
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user());

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() { }


   async init(): Promise<void> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      this._user.set(null);
    } else {
      this._user.set(data.user);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      this._user.set(session?.user ?? null);

      const target = session?.user ? '/dashboard' : '/login';
      if (this.router.url !== target) {
        this.router.navigateByUrl(target);
      }
    });
  }


    async signUp(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      if (signInRes.error) {
        this.error.set(signInRes.error.message);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Sign up failed');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }


    async signIn(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Sign in failed');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }

    async signOut(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Sign out failed');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AuthActions,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '@ethelpms/shared/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

@Component({
  selector: 'admin-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <span class="material-symbols-outlined logo-icon">admin_panel_settings</span>
            <h1>Platform Console</h1>
            <p>Sign in to manage the EthelPMS platform</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                formControlName="email"
                type="email"
                placeholder="admin@ethelpms.com"
                autocomplete="email"
              />
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.controls.email.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword ? 'password' : 'text'"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="loginForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 32px;
      border-radius: 16px;
    }

    .login-header {
      text-align: center;
      width: 100%;
      margin-bottom: 24px;

      .logo-icon {
        font-size: 48px;
        color: var(--accent-primary);
        margin-bottom: 12px;
        display: block;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 500;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(220, 38, 38, 0.08);
      color: var(--accent-danger);
      margin-bottom: 20px;
      font-size: 14px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .submit-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
      border-radius: 8px;
    }
  `],
})
export default class LoginComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly error = this.store.selectSignal(selectAuthError);

  hidePassword = true;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor() {
    // Redirect to dashboard if already authenticated
    this.isAuthenticated$.pipe(
      filter(Boolean),
      take(1),
    ).subscribe(() => this.router.navigate(['/dashboard']));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.getRawValue();
    this.store.dispatch(AuthActions.login({ credentials: { email, password } }));
  }
}

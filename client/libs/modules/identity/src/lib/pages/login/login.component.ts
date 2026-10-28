import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthActions, selectIsLoading, selectAuthError } from '@ethelpms/shared/core';

@Component({
  selector: 'ethel-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    <div class="form-container">
      <h1>{{ 'auth.login.title' | translate }}</h1>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field class="full-width" appearance="outline">
          <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" autocomplete="email" />
          @if (form.controls.email.hasError('required')) {
            <mat-error>{{ 'validation.emailRequired' | translate }}</mat-error>
          } @else if (form.controls.email.hasError('email')) {
            <mat-error>{{ 'validation.emailInvalid' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width" appearance="outline">
          <mat-label>{{ 'auth.login.password' | translate }}</mat-label>
          <input
            matInput
            formControlName="password"
            [type]="hidePassword() ? 'password' : 'text'"
            autocomplete="current-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword.set(!hidePassword())"
            [attr.aria-label]="'auth.login.togglePassword' | translate"
          >
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.password.hasError('required')) {
            <mat-error>{{ 'validation.passwordRequired' | translate }}</mat-error>
          }
        </mat-form-field>

        <button
          mat-flat-button
          color="primary"
          class="full-width submit-btn"
          type="submit"
          [disabled]="form.invalid || isLoading()"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            {{ 'auth.login.submit' | translate }}
          }
        </button>
      </form>

      <div class="link">
        <a [routerLink]="['/auth/forgot-password']">
          {{ 'auth.login.forgotPassword' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    h1 {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #991b1b;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .link {
      text-align: center;
      margin-top: 1rem;
    }

    .link a {
      color: var(--mat-sys-primary, #1976d2);
      text-decoration: none;
      font-size: 0.875rem;
    }

    .link a:hover {
      text-decoration: underline;
    }
  `,
})
export default class LoginComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly hidePassword = signal(true);
  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly error = this.store.selectSignal(selectAuthError);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.store.dispatch(AuthActions.login({ credentials: { email, password } }));
  }
}

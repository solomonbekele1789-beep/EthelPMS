import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@ethelpms/shared/core';

@Component({
  selector: 'ethel-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    <div class="form-container">
      <h1>{{ 'auth.forgotPassword.title' | translate }}</h1>

      @if (submitted()) {
        <div class="success-banner">
          {{ 'auth.forgotPassword.successMessage' | translate }}
        </div>
        <div class="link">
          <a [routerLink]="['/auth/login']">
            {{ 'auth.forgotPassword.backToLogin' | translate }}
          </a>
        </div>
      } @else {
        <p class="description">
          {{ 'auth.forgotPassword.description' | translate }}
        </p>

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

          <button
            mat-flat-button
            color="primary"
            class="full-width submit-btn"
            type="submit"
            [disabled]="form.invalid || sending()"
          >
            @if (sending()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'auth.forgotPassword.submit' | translate }}
            }
          </button>
        </form>

        <div class="link">
          <a [routerLink]="['/auth/login']">
            {{ 'auth.forgotPassword.backToLogin' | translate }}
          </a>
        </div>
      }
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

    .description {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .success-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #166534;
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
export default class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly submitted = signal(false);
  readonly sending = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.sending.set(true);
    const { email } = this.form.getRawValue();

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.sending.set(false);
        this.submitted.set(true);
      },
      error: () => {
        // Always show success to prevent user enumeration
        this.sending.set(false);
        this.submitted.set(true);
      },
    });
  }
}

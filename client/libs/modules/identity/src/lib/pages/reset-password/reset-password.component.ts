import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@ethelpms/shared/core';
import { NotificationService } from '@ethelpms/shared/ui';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'ethel-reset-password',
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
      <h1>{{ 'auth.resetPassword.title' | translate }}</h1>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field class="full-width" appearance="outline">
          <mat-label>{{ 'auth.resetPassword.password' | translate }}</mat-label>
          <input
            matInput
            formControlName="password"
            [type]="hidePassword() ? 'password' : 'text'"
            autocomplete="new-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword.set(!hidePassword())"
            [attr.aria-label]="'auth.resetPassword.togglePassword' | translate"
          >
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.password.hasError('required')) {
            <mat-error>{{ 'validation.passwordRequired' | translate }}</mat-error>
          } @else if (form.controls.password.hasError('minlength')) {
            <mat-error>{{ 'validation.minLength' | translate }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width" appearance="outline">
          <mat-label>{{ 'auth.resetPassword.confirmPassword' | translate }}</mat-label>
          <input
            matInput
            formControlName="confirmPassword"
            [type]="hideConfirm() ? 'password' : 'text'"
            autocomplete="new-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideConfirm.set(!hideConfirm())"
            [attr.aria-label]="'auth.resetPassword.toggleConfirm' | translate"
          >
            <mat-icon>{{ hideConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.confirmPassword.hasError('required')) {
            <mat-error>{{ 'validation.confirmPasswordRequired' | translate }}</mat-error>
          }
        </mat-form-field>

        @if (form.hasError('passwordMismatch') && form.controls.confirmPassword.touched) {
          <div class="error-banner">
            {{ 'validation.passwordMismatch' | translate }}
          </div>
        }

        <button
          mat-flat-button
          color="primary"
          class="full-width submit-btn"
          type="submit"
          [disabled]="form.invalid || submitting()"
        >
          @if (submitting()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            {{ 'auth.resetPassword.submit' | translate }}
          }
        </button>
      </form>

      <div class="link">
        <a [routerLink]="['/auth/login']">
          {{ 'auth.resetPassword.backToLogin' | translate }}
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
export default class ResetPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly hidePassword = signal(true);
  readonly hideConfirm = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.error.set(null);

    const { password } = this.form.getRawValue();

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success('auth.resetPassword.successMessage');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err?.error?.message ?? 'auth.resetPassword.errorGeneric'
        );
      },
    });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-module-not-available',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="error-page">
      <span class="error-page__icon icon">extension_off</span>
      <h1 class="error-page__title">{{ 'errors.moduleNotAvailable' | translate }}</h1>
      <p class="error-page__message">{{ 'errors.moduleNotAvailableMessage' | translate }}</p>
      <div class="error-page__actions">
        <a routerLink="/dashboard" class="error-page__btn error-page__btn--primary">
          {{ 'nav.dashboard' | translate }}
        </a>
        <button class="error-page__btn error-page__btn--secondary" (click)="goBack()">
          {{ 'common.back' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    }

    .error-page__icon {
      font-size: 72px;
      color: var(--accent-warning, #d97706);
      opacity: 0.7;
      margin-bottom: 1.5rem;
    }

    .error-page__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      margin: 0 0 0.5rem;
    }

    .error-page__message {
      font-size: 1rem;
      color: var(--text-secondary, #6b7280);
      margin: 0 0 2rem;
      max-width: 400px;
    }

    .error-page__actions {
      display: flex;
      gap: 0.75rem;
    }

    .error-page__btn {
      display: inline-flex;
      align-items: center;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: background 0.15s;

      &--primary {
        background: var(--accent-primary, #2563eb);
        color: #ffffff;

        &:hover {
          background: #1d4ed8;
        }
      }

      &--secondary {
        background: var(--bg-primary, #ffffff);
        color: var(--text-primary, #111827);
        border: 1px solid var(--border-color, #e5e7eb);

        &:hover {
          background: var(--bg-secondary, #f9fafb);
        }
      }
    }

    .icon {
      font-family: 'Material Symbols Outlined', sans-serif;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export default class ModuleNotAvailableComponent {
  goBack(): void {
    window.history.back();
  }
}

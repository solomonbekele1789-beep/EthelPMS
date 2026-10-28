import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';

import { selectCurrentUser } from '@ethelpms/shared/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="dashboard">
      @if (user(); as u) {
        <h1 class="dashboard__welcome">{{ 'dashboard.welcome' | translate: { name: u.firstName } }}</h1>
      } @else {
        <h1 class="dashboard__welcome">{{ 'dashboard.title' | translate }}</h1>
      }

      <div class="dashboard__stats">
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <span class="icon">people</span>
          </div>
          <div class="dashboard__stat-info">
            <span class="dashboard__stat-value">--</span>
            <span class="dashboard__stat-label">{{ 'nav.users' | translate }}</span>
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <span class="icon">folder_open</span>
          </div>
          <div class="dashboard__stat-info">
            <span class="dashboard__stat-value">--</span>
            <span class="dashboard__stat-label">{{ 'nav.projects' | translate }}</span>
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <span class="icon">task_alt</span>
          </div>
          <div class="dashboard__stat-info">
            <span class="dashboard__stat-value">--</span>
            <span class="dashboard__stat-label">{{ 'nav.tasks' | translate }}</span>
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <span class="icon">assessment</span>
          </div>
          <div class="dashboard__stat-info">
            <span class="dashboard__stat-value">--</span>
            <span class="dashboard__stat-label">{{ 'nav.reports' | translate }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard__placeholder">
        <span class="icon dashboard__placeholder-icon">construction</span>
        <p>Dashboard widgets will be populated as modules are activated.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }

    .dashboard__welcome {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary, #111827);
      margin: 0 0 1.5rem;
    }

    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .dashboard__stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-primary, #ffffff);
      border-radius: 10px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
      border: 1px solid var(--border-color, #e5e7eb);
    }

    .dashboard__stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--accent-primary, #2563eb);
      flex-shrink: 0;
    }

    .dashboard__stat-info {
      display: flex;
      flex-direction: column;
    }

    .dashboard__stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      line-height: 1.2;
    }

    .dashboard__stat-label {
      font-size: 0.8125rem;
      color: var(--text-secondary, #6b7280);
    }

    .dashboard__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: var(--bg-primary, #ffffff);
      border: 2px dashed var(--border-color, #e5e7eb);
      border-radius: 10px;
      text-align: center;

      p {
        color: var(--text-secondary, #6b7280);
        margin: 0.75rem 0 0;
        font-size: 0.875rem;
      }
    }

    .dashboard__placeholder-icon {
      font-size: 48px;
      color: var(--text-secondary, #6b7280);
      opacity: 0.5;
    }

    .icon {
      font-family: 'Material Symbols Outlined', sans-serif;
      font-size: 24px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export default class DashboardComponent {
  private readonly store = inject(Store);
  readonly user = this.store.selectSignal(selectCurrentUser);
}

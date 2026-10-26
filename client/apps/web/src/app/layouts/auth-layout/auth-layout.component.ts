import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__card">
        <div class="auth-layout__logo">
          <h1 class="auth-layout__title">EthelPMS</h1>
          <p class="auth-layout__subtitle">NGO Project Management System</p>
        </div>
        <router-outlet />
      </div>
      <footer class="auth-layout__footer">
        <p>&copy; {{ currentYear }} EthelPMS. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .auth-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-secondary, #f9fafb);
      padding: 1rem;
    }

    .auth-layout__card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-primary, #ffffff);
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      padding: 2.5rem 2rem;
    }

    .auth-layout__logo {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-layout__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--accent-primary, #2563eb);
      margin: 0 0 0.25rem;
      letter-spacing: -0.025em;
    }

    .auth-layout__subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary, #6b7280);
      margin: 0;
    }

    .auth-layout__footer {
      margin-top: 2rem;

      p {
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
        margin: 0;
      }
    }
  `]
})
export default class AuthLayoutComponent {
  readonly currentYear = new Date().getFullYear();
}

import { Component, Input } from '@angular/core';
import { BreadcrumbNavComponent } from '../breadcrumb-nav/breadcrumb-nav.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [BreadcrumbNavComponent],
  template: `
    <div class="page-header">
      <app-breadcrumb-nav></app-breadcrumb-nav>
      <div class="header-row">
        <div class="header-title-wrapper">
          <h1>{{ title }}</h1>
          @if (subtitle) { <p class="subtitle">{{ subtitle }}</p> }
        </div>
        <div class="actions">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .page-header {
      width: 100%;
      padding: 1rem 0;
      box-sizing: border-box;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1.5rem;
      flex-wrap: wrap;
      box-sizing: border-box;
    }
    .header-title-wrapper {
      display: flex;
      flex-direction: column;
    }
    h1 {
      margin: 4px 0 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.3;
    }
    .subtitle {
      color: #64748b;
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-left: auto;
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}

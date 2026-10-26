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
        <div>
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
    .page-header { padding: 16px 0; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
    h1 { margin: 8px 0 4px; font-size: 24px; font-weight: 600; }
    .subtitle { color: #6b7280; margin: 0; }
    .actions { display: flex; gap: 8px; }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}

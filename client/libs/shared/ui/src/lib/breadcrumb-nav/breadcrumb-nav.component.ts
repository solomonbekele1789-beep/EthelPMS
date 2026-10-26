import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface Breadcrumb {
  label: string;
  route: string;
}

@Component({
  selector: 'app-breadcrumb-nav',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      @for (crumb of breadcrumbs(); track crumb.route; let last = $last) {
        @if (!last) {
          <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
          <mat-icon class="separator">chevron_right</mat-icon>
        } @else {
          <span class="breadcrumb-current">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; color: #6b7280;
    }
    .breadcrumb-link { color: #6b7280; text-decoration: none; }
    .breadcrumb-link:hover { color: #3b82f6; text-decoration: underline; }
    .breadcrumb-current { color: #374151; font-weight: 500; }
    .separator { font-size: 18px; width: 18px; height: 18px; color: #d1d5db; }
  `]
})
export class BreadcrumbNavComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.activatedRoute.root))
    ),
    { initialValue: [] as Breadcrumb[] }
  );

  private buildBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children = route.children;
    if (children.length === 0) return breadcrumbs;

    for (const child of children) {
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL) {
        url += `/${routeURL}`;
      }
      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, route: url });
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}

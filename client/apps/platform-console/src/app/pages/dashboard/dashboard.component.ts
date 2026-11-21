import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlatformTenantService } from '../../services/tenant.service';
import { TenantListItemDto } from '../../models/tenant.model';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard">
      <div class="header">
        <h1>Platform Overview</h1>
        <a mat-flat-button color="primary" routerLink="/tenants/create">
          <mat-icon>add</mat-icon> New Tenant
        </a>
      </div>

      <div class="kpi-grid">
        <mat-card class="kpi-card">
          <span class="kpi-label">Total Tenants</span>
          <span class="kpi-value">{{ totalCount() }}</span>
        </mat-card>
        <mat-card class="kpi-card">
          <span class="kpi-label">Active</span>
          <span class="kpi-value active">{{ activeCount() }}</span>
        </mat-card>
        <mat-card class="kpi-card">
          <span class="kpi-label">Pending / Provisioning</span>
          <span class="kpi-value pending">{{ pendingCount() }}</span>
        </mat-card>
        <mat-card class="kpi-card">
          <span class="kpi-label">Suspended</span>
          <span class="kpi-value suspended">{{ suspendedCount() }}</span>
        </mat-card>
      </div>

      <mat-card class="recent-card">
        <h2>Recent Tenants</h2>
        @if (tenants().length === 0) {
          <p class="empty">No tenants registered yet.</p>
        } @else {
          <div class="tenant-rows">
            @for (t of tenants().slice(0, 5); track t.id) {
              <a class="tenant-row" [routerLink]="['/tenants', t.id]">
                <div>
                  <strong>{{ t.name }}</strong>
                  <span class="slug">({{ t.slug }})</span>
                </div>
                <span class="status-pill">{{ t.status }}</span>
              </a>
            }
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .kpi-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
    .kpi-label { font-size: 13px; color: #666; }
    .kpi-value { font-size: 32px; font-weight: 700; }
    .kpi-value.active { color: #2e7d32; }
    .kpi-value.pending { color: #ed6c02; }
    .kpi-value.suspended { color: #d32f2f; }
    .recent-card { padding: 20px; }
    .tenant-rows { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .tenant-row { display: flex; justify-content: space-between; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; text-decoration: none; color: inherit; }
    .slug { margin-left: 8px; color: #666; font-size: 13px; }
    .status-pill { font-size: 12px; font-weight: 600; }
  `],
})
export default class DashboardComponent implements OnInit {
  private readonly tenantService = inject(PlatformTenantService);

  readonly tenants = signal<TenantListItemDto[]>([]);
  readonly totalCount = signal(0);

  readonly activeCount = computed(() => this.tenants().filter((t) => t.status === 'Active').length);
  readonly pendingCount = computed(() =>
    this.tenants().filter((t) => t.status === 'Pending' || t.status === 'Provisioning').length
  );
  readonly suspendedCount = computed(() => this.tenants().filter((t) => t.status === 'Suspended').length);

  ngOnInit(): void {
    this.tenantService.listTenants({ page: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        const list = res.items ?? res.data ?? [];
        this.tenants.set(list);
        this.totalCount.set(res.totalCount ?? list.length);
      },
    });
  }
}

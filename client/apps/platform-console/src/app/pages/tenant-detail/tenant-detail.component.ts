import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '@ethelpms/shared/ui';
import { PlatformTenantService } from '../../services/tenant.service';
import {
  AccessKeyDto,
  ProvisioningLogDto,
  TenantDetailDto,
  TenantModuleDto,
  TenantUsageDto,
} from '../../models/tenant.model';

@Component({
  selector: 'admin-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="tenant-detail">
      <div class="header">
        <div>
          <a routerLink="/tenants" class="back-link">&larr; Back to Tenants</a>
          <h1>{{ tenant()?.name || 'Tenant Details' }}</h1>
          <span class="subtitle">{{ tenant()?.slug }} &middot; {{ tenant()?.status }}</span>
        </div>
        <div class="actions">
          @if (tenant()?.status === 'Pending') {
            <button mat-flat-button color="primary" (click)="triggerProvisioning()">Provision</button>
          }
          @if (tenant()?.status === 'Active') {
            <button mat-stroked-button color="warn" (click)="suspendTenant()">Suspend</button>
          }
          @if (tenant()?.status === 'Suspended') {
            <button mat-flat-button color="primary" (click)="reactivateTenant()">Reactivate</button>
          }
        </div>
      </div>

      <mat-tab-group>
        <!-- Tab 1: Overview & Usage & Branding -->
        <mat-tab label="Overview">
          <div class="tab-content grid-2">
            <mat-card class="panel">
              <h3>Usage & Limits</h3>
              @if (usage(); as u) {
                <div class="usage-row">
                  <span>Users: {{ u.currentUsers }} / {{ u.maxUsers }}</span>
                  <mat-progress-bar mode="determinate" [value]="u.maxUsers ? (u.currentUsers / u.maxUsers) * 100 : 0" />
                </div>
                <div class="usage-row">
                  <span>Projects: {{ u.currentProjects }} / {{ u.maxProjects }}</span>
                  <mat-progress-bar mode="determinate" [value]="u.maxProjects ? (u.currentProjects / u.maxProjects) * 100 : 0" />
                </div>
                <div class="usage-row">
                  <span>Storage Used: {{ (u.storageUsedBytes / 1048576) | number:'1.1-2' }} MB</span>
                </div>
              }
            </mat-card>

            <mat-card class="panel">
              <h3>Branding</h3>
              <mat-form-field appearance="outline" class="full">
                <mat-label>Logo URL</mat-label>
                <input matInput [(ngModel)]="brandingLogoUrl" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full">
                <mat-label>Primary Color (Hex)</mat-label>
                <input matInput [(ngModel)]="brandingPrimaryColor" placeholder="#1976d2" />
              </mat-form-field>
              <button mat-flat-button color="primary" (click)="saveBranding()">Save Branding</button>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 2: Interactive Module Toggles -->
        <mat-tab label="Modules">
          <div class="tab-content">
            <mat-card class="panel">
              <h3>Enabled Modules</h3>
              <div class="module-list">
                @for (mod of modules(); track mod.moduleName) {
                  <div class="module-row">
                    <span class="module-name">{{ mod.moduleName }}</span>
                    <mat-slide-toggle
                      [checked]="mod.isEnabled"
                      (change)="onToggleModule(mod.moduleName, $event.checked)">
                      {{ mod.isEnabled ? 'Enabled' : 'Disabled' }}
                    </mat-slide-toggle>
                  </div>
                }
              </div>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 3: Access Keys -->
        <mat-tab label="Access Keys">
          <div class="tab-content">
            <mat-card class="panel">
              <h3>API Access Keys</h3>
              <div class="key-create-row">
                <mat-form-field appearance="outline">
                  <mat-label>New Key Label</mat-label>
                  <input matInput [(ngModel)]="newKeyLabel" placeholder="e.g. KoboToolbox Sync" />
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="createAccessKey()" [disabled]="!newKeyLabel.trim()">
                  Generate Key
                </button>
              </div>

              @if (createdRawKey()) {
                <div class="raw-key-banner">
                  <strong>Copy this key now (shown once):</strong>
                  <code>{{ createdRawKey() }}</code>
                </div>
              }

              <div class="key-list">
                @for (k of accessKeys(); track k.id) {
                  <div class="key-row">
                    <div>
                      <strong>{{ k.label }}</strong>
                      <span class="muted"> ({{ k.maskedKey }})</span>
                    </div>
                    <button mat-stroked-button color="warn" [disabled]="k.isRevoked" (click)="revokeAccessKey(k.id)">
                      {{ k.isRevoked ? 'Revoked' : 'Revoke' }}
                    </button>
                  </div>
                }
              </div>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 4: Provisioning Log -->
        <mat-tab label="Provisioning Log">
          <div class="tab-content">
            <mat-card class="panel">
              <div class="panel-header">
                <h3>Provisioning Pipeline</h3>
                <button mat-stroked-button color="primary" (click)="triggerProvisioning()">Retry Provisioning</button>
              </div>
              @if (provisioningLogs().length === 0) {
                <p class="muted">No provisioning logs recorded yet.</p>
              } @else {
                <div class="log-list">
                  @for (log of provisioningLogs(); track log.id) {
                    <div class="log-row">
                      <div>
                        <strong>{{ log.step }}</strong>
                        @if (log.message) {
                          <div class="error-msg">{{ log.message }}</div>
                        }
                      </div>
                      <span class="status-tag">{{ log.status }}</span>
                    </div>
                  }
                </div>
              }
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tenant-detail { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .back-link { text-decoration: none; font-size: 13px; color: #1976d2; }
    .subtitle { color: #666; font-size: 14px; }
    .actions { display: flex; gap: 8px; }
    .tab-content { padding: 16px 0; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
    .panel { padding: 20px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; }
    .full { width: 100%; }
    .usage-row { margin: 12px 0; display: flex; flex-direction: column; gap: 6px; }
    .module-list, .key-list, .log-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .module-row, .key-row, .log-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; }
    .key-create-row { display: flex; gap: 12px; align-items: center; }
    .raw-key-banner { background: #fff3e0; border: 1px solid #ffb74d; padding: 12px; border-radius: 6px; margin: 12px 0; display: flex; flex-direction: column; gap: 4px; }
    .muted { color: #666; font-size: 13px; }
    .error-msg { color: #d32f2f; font-size: 12px; }
  `],
})
export default class TenantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantService = inject(PlatformTenantService);
  private readonly notification = inject(NotificationService);

  private tenantId = '';
  readonly tenant = signal<TenantDetailDto | null>(null);
  readonly usage = signal<TenantUsageDto | null>(null);
  readonly modules = signal<TenantModuleDto[]>([]);
  readonly accessKeys = signal<AccessKeyDto[]>([]);
  readonly provisioningLogs = signal<ProvisioningLogDto[]>([]);
  readonly createdRawKey = signal<string | null>(null);

  brandingLogoUrl = '';
  brandingPrimaryColor = '';
  newKeyLabel = '';

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.tenantId) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.tenantService.getTenant(this.tenantId).subscribe((t) => {
      this.tenant.set(t);
      this.brandingLogoUrl = t.logoUrl ?? '';
      this.brandingPrimaryColor = t.primaryColor ?? '';
    });
    this.tenantService.getTenantUsage(this.tenantId).subscribe((u) => this.usage.set(u));
    this.tenantService.listModules(this.tenantId).subscribe((m) => this.modules.set(m ?? []));
    this.tenantService.listAccessKeys(this.tenantId).subscribe((k) => this.accessKeys.set(k ?? []));
    this.tenantService.getProvisioningStatus(this.tenantId).subscribe((l) => this.provisioningLogs.set(l ?? []));
  }

  onToggleModule(moduleName: string, enabled: boolean): void {
    this.tenantService.toggleModule(this.tenantId, moduleName, enabled).subscribe({
      next: () => {
        this.modules.update((list) =>
          list.map((m) => (m.moduleName === moduleName ? { ...m, isEnabled: enabled } : m))
        );
        this.notification.success(`Module '${moduleName}' ${enabled ? 'enabled' : 'disabled'}.`);
      },
    });
  }

  saveBranding(): void {
    this.tenantService
      .updateBranding(this.tenantId, {
        logoUrl: this.brandingLogoUrl || null,
        primaryColor: this.brandingPrimaryColor || null,
      })
      .subscribe({
        next: () => this.notification.success('Branding updated.'),
      });
  }

  triggerProvisioning(): void {
    this.tenantService.provisionTenant(this.tenantId).subscribe({
      next: () => {
        this.notification.success('Provisioning triggered.');
        this.loadAll();
      },
    });
  }

  suspendTenant(): void {
    const reason = window.prompt('Enter suspension reason:');
    if (!reason?.trim()) return;
    this.tenantService.suspendTenant(this.tenantId, reason.trim()).subscribe({
      next: () => {
        this.notification.success('Tenant suspended.');
        this.loadAll();
      },
    });
  }

  reactivateTenant(): void {
    this.tenantService.reactivateTenant(this.tenantId).subscribe({
      next: () => {
        this.notification.success('Tenant reactivated.');
        this.loadAll();
      },
    });
  }

  createAccessKey(): void {
    if (!this.newKeyLabel.trim()) return;
    this.tenantService
      .createAccessKey(this.tenantId, { label: this.newKeyLabel.trim(), scopes: ['read', 'write'] })
      .subscribe({
        next: (res) => {
          this.createdRawKey.set(res.key);
          this.newKeyLabel = '';
          this.tenantService.listAccessKeys(this.tenantId).subscribe((k) => this.accessKeys.set(k ?? []));
        },
      });
  }

  revokeAccessKey(keyId: string): void {
    this.tenantService.revokeAccessKey(this.tenantId, keyId).subscribe({
      next: () => {
        this.notification.success('Access key revoked.');
        this.tenantService.listAccessKeys(this.tenantId).subscribe((k) => this.accessKeys.set(k ?? []));
      },
    });
  }
}

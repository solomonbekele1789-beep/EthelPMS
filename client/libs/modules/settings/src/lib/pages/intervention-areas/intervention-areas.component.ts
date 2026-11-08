import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@ethelpms/shared/ui';

import {
  InterventionAreaDto,
  InterventionAreaService,
  CreateInterventionAreaRequest,
  UpdateInterventionAreaRequest,
} from '@ethelpms/modules/projects';

import { SettingsNavComponent } from '../../components/settings-nav/settings-nav.component';
import {
  InterventionAreaDialogComponent,
  InterventionAreaDialogData,
} from './intervention-area-dialog.component';

@Component({
  selector: 'ethel-intervention-areas-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SettingsNavComponent,
  ],
  template: `
    <app-page-header
      title="Intervention Areas & Geographic Hierarchy"
      subtitle="Configure administrative boundaries (Country, Region, Zone, Woreda, Kebele) and physical intervention sites with device GPS coordinates."
    >
      <div class="header-actions">
        @if (flatAreas().length === 0) {
          <button mat-stroked-button color="accent" (click)="seedSampleHierarchy()" [disabled]="seeding()">
            <mat-icon>auto_awesome</mat-icon>
            <span>Seed Ethiopian Hierarchy</span>
          </button>
        }
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add_location_alt</mat-icon>
          <span>Add Intervention Area</span>
        </button>
      </div>
    </app-page-header>

    <ethel-settings-nav></ethel-settings-nav>

    <!-- Summary KPI cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <mat-icon class="stat-icon icon-total">public</mat-icon>
        <div class="stat-info">
          <span class="stat-num">{{ flatAreas().length }}</span>
          <span class="stat-label">Total Configured Areas</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon icon-region">map</mat-icon>
        <div class="stat-info">
          <span class="stat-num">{{ countByType('Region') }}</span>
          <span class="stat-label">Regions</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon icon-woreda">location_city</mat-icon>
        <div class="stat-info">
          <span class="stat-num">{{ countByType('Woreda') }}</span>
          <span class="stat-label">Woredas (Districts)</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon icon-gps">satellite_alt</mat-icon>
        <div class="stat-info">
          <span class="stat-num">{{ countWithGps() }}</span>
          <span class="stat-label">GPS Geotagged Sites</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="toolbar-card">
      <div class="tier-tabs">
        <button
          class="tier-tab"
          [class.active]="selectedTier() === 'ALL'"
          (click)="setTier('ALL')"
        >
          All ({{ flatAreas().length }})
        </button>
        @for (tier of tiers; track tier) {
          <button
            class="tier-tab"
            [class.active]="selectedTier() === tier"
            (click)="setTier(tier)"
          >
            {{ tier }} ({{ countByType(tier) }})
          </button>
        }
      </div>

      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Filter by name, code, landmark..."
        />
        @if (searchQuery) {
          <button mat-icon-button (click)="searchQuery = ''" class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (filteredAreas().length === 0) {
      <app-empty-state
        icon="explore_off"
        title="No intervention areas found"
        message="Create your first administrative area or click 'Seed Ethiopian Hierarchy' to bootstrap standard regions and woredas."
      >
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add_location_alt</mat-icon>
          <span>Add Intervention Area</span>
        </button>
      </app-empty-state>
    } @else {
      <!-- Area Cards Grid -->
      <div class="areas-grid">
        @for (area of filteredAreas(); track area.id) {
          <mat-card class="area-card" [class.inactive]="!area.isActive">
            <mat-card-header class="card-header">
              <div class="header-left">
                <span class="tier-chip tier-{{ area.areaType.toLowerCase() }}">
                  {{ area.areaType }}
                </span>
                <span class="area-code">{{ area.code }}</span>
              </div>

              <div class="header-right">
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Area actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openCreateChildDialog(area)">
                    <mat-icon>add</mat-icon>
                    <span>Add Child Area Under This</span>
                  </button>
                  <button mat-menu-item (click)="openEditDialog(area)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit Details</span>
                  </button>
                  <button mat-menu-item (click)="confirmDelete(area)" class="danger-action">
                    <mat-icon color="warn">delete</mat-icon>
                    <span class="text-warn">Delete Area</span>
                  </button>
                </mat-menu>
              </div>
            </mat-card-header>

            <mat-card-content class="card-body">
              <h3 class="area-name">{{ area.name }}</h3>

              <!-- Hierarchy Breadcrumb -->
              <div class="hierarchy-breadcrumb">
                <mat-icon class="bc-icon">subdirectory_arrow_right</mat-icon>
                <span class="bc-text">
                  {{ getHierarchyBreadcrumb(area) }}
                </span>
              </div>

              @if (area.description) {
                <p class="area-desc">{{ area.description }}</p>
              }

              <!-- Geospatial & GPS Details -->
              <div class="gps-section">
                @if (area.latitude !== null && area.latitude !== undefined && area.longitude !== null && area.longitude !== undefined) {
                  <div class="gps-pill">
                    <mat-icon class="gps-pin-icon">location_on</mat-icon>
                    <span class="gps-coords">{{ area.latitude }}, {{ area.longitude }}</span>
                    @if (area.gpsSource) {
                      <span class="gps-source-tag">({{ area.gpsSource }})</span>
                    }
                    <a
                      [href]="'https://www.google.com/maps?q=' + area.latitude + ',' + area.longitude"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="maps-link"
                      matTooltip="Open in Google Maps"
                    >
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </div>
                } @else {
                  <div class="gps-pill empty">
                    <mat-icon>location_off</mat-icon>
                    <span>No GPS coordinates set</span>
                  </div>
                }

                @if (area.landmarkOrAddress) {
                  <div class="landmark-text">
                    <mat-icon>storefront</mat-icon>
                    <span>{{ area.landmarkOrAddress }}</span>
                  </div>
                }
              </div>
            </mat-card-content>

            <mat-card-actions class="card-footer">
              <div class="footer-status">
                <span class="status-indicator" [class.active]="area.isActive"></span>
                <span class="status-text">{{ area.isActive ? 'Active' : 'Inactive' }}</span>
              </div>

              <div class="footer-actions">
                <button
                  mat-button
                  color="primary"
                  class="child-btn"
                  (click)="openCreateChildDialog(area)"
                  matTooltip="Add sub-area (e.g. Zone, Woreda, Kebele, Site)"
                >
                  <mat-icon>add</mat-icon>
                  <span>Add Sub-Area</span>
                </button>
              </div>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .stat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;

        &.icon-total { color: #2563eb; }
        &.icon-region { color: #7c3aed; }
        &.icon-woreda { color: #059669; }
        &.icon-gps { color: #ea580c; }
      }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }
      }
    }

    .toolbar-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .tier-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;

      .tier-tab {
        background: #f1f5f9;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.825rem;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        &.active {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }
      }
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px 12px;
      width: 280px;

      mat-icon {
        color: #94a3b8;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: 0.875rem;
        color: #1e293b;

        &::placeholder {
          color: #94a3b8;
        }
      }

      .clear-btn {
        width: 24px;
        height: 24px;
        line-height: 24px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .areas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .area-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      transition: transform 0.15s, box-shadow 0.15s;
      background: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      &.inactive {
        opacity: 0.65;
        border-color: #cbd5e1;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px 8px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .area-code {
          font-family: monospace;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }
      }
    }

    .tier-chip {
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.tier-country { background: #fef3c7; color: #92400e; }
      &.tier-region { background: #dbeafe; color: #1e40af; }
      &.tier-zone { background: #e0e7ff; color: #3730a3; }
      &.tier-woreda { background: #f3e8ff; color: #6b21a8; }
      &.tier-kebele { background: #dcfce7; color: #166534; }
      &.tier-site { background: #ffedd5; color: #9a3412; }
    }

    .card-body {
      padding: 8px 16px 16px;

      .area-name {
        margin: 0 0 6px 0;
        font-size: 1.15rem;
        font-weight: 600;
        color: #0f172a;
      }

      .hierarchy-breadcrumb {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 10px;
        color: #64748b;
        font-size: 0.8rem;

        .bc-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .bc-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .area-desc {
        color: #475569;
        font-size: 0.85rem;
        line-height: 1.4;
        margin: 0 0 12px 0;
      }
    }

    .gps-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 8px 12px;

      .gps-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: #1e293b;

        .gps-pin-icon {
          color: #ea580c;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        .gps-coords {
          font-family: monospace;
          font-weight: 500;
        }

        .gps-source-tag {
          color: #64748b;
          font-size: 0.725rem;
        }

        .maps-link {
          margin-left: auto;
          color: #2563eb;
          display: flex;
          align-items: center;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }

          &:hover {
            color: #1d4ed8;
          }
        }

        &.empty {
          color: #94a3b8;
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }

      .landmark-text {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #475569;
        font-size: 0.75rem;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
          color: #94a3b8;
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px 12px;
      border-top: 1px solid #f1f5f9;

      .footer-status {
        display: flex;
        align-items: center;
        gap: 6px;

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;

          &.active {
            background: #10b981;
          }
        }

        .status-text {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
      }

      .child-btn {
        font-size: 0.8rem;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .text-warn {
      color: #dc2626;
    }
  `],
})
export default class InterventionAreasComponent implements OnInit {
  private readonly areaService = inject(InterventionAreaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly flatAreas = signal<InterventionAreaDto[]>([]);
  readonly loading = signal(false);
  readonly seeding = signal(false);

  readonly tiers = ['Country', 'Region', 'Zone', 'Woreda', 'Kebele', 'Site'];
  readonly selectedTier = signal<string>('ALL');
  searchQuery = '';

  readonly filteredAreas = computed(() => {
    let list = this.flatAreas();
    const tier = this.selectedTier();
    if (tier !== 'ALL') {
      list = list.filter((a) => a.areaType === tier);
    }
    const q = this.searchQuery?.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          (a.landmarkOrAddress && a.landmarkOrAddress.toLowerCase().includes(q)) ||
          (a.parentName && a.parentName.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading.set(true);
    this.areaService.listInterventionAreas(true).subscribe({
      next: (areas: InterventionAreaDto[]) => {
        this.flatAreas.set(areas);
        this.loading.set(false);
      },
      error: (_err: unknown) => {
        this.loading.set(false);
        this.snackBar.open('Failed to load intervention areas', 'Close', { duration: 4000 });
      },
    });
  }

  setTier(tier: string): void {
    this.selectedTier.set(tier);
  }

  countByType(type: string): number {
    return this.flatAreas().filter((a) => a.areaType === type).length;
  }

  countWithGps(): number {
    return this.flatAreas().filter(
      (a) => a.latitude !== null && a.latitude !== undefined && a.longitude !== null && a.longitude !== undefined
    ).length;
  }

  getHierarchyBreadcrumb(area: InterventionAreaDto): string {
    const parts: string[] = [area.name];
    let currentId = area.parentId;
    const all = this.flatAreas();
    let depth = 0;

    while (currentId && depth < 6) {
      const parent = all.find((p) => p.id === currentId);
      if (parent) {
        parts.unshift(parent.name);
        currentId = parent.parentId;
      } else {
        break;
      }
      depth++;
    }

    return parts.join(' > ');
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(InterventionAreaDialogComponent, {
      width: '640px',
      data: {
        allAreas: this.flatAreas(),
        defaultAreaType: 'Region',
      } as InterventionAreaDialogData,
    });

    dialogRef.afterClosed().subscribe((result: CreateInterventionAreaRequest | undefined) => {
      if (result) {
        this.createArea(result);
      }
    });
  }

  openCreateChildDialog(parent: InterventionAreaDto): void {
    let nextTier = 'Zone';
    if (parent.areaType === 'Country') nextTier = 'Region';
    else if (parent.areaType === 'Region') nextTier = 'Zone';
    else if (parent.areaType === 'Zone') nextTier = 'Woreda';
    else if (parent.areaType === 'Woreda') nextTier = 'Kebele';
    else if (parent.areaType === 'Kebele') nextTier = 'Site';

    const dialogRef = this.dialog.open(InterventionAreaDialogComponent, {
      width: '640px',
      data: {
        parentArea: parent,
        allAreas: this.flatAreas(),
        defaultAreaType: nextTier,
      } as InterventionAreaDialogData,
    });

    dialogRef.afterClosed().subscribe((result: CreateInterventionAreaRequest | undefined) => {
      if (result) {
        this.createArea(result);
      }
    });
  }

  createArea(payload: CreateInterventionAreaRequest): void {
    this.areaService.createInterventionArea(payload).subscribe({
      next: () => {
        this.snackBar.open(`Intervention area "${payload.name}" created successfully.`, 'Close', {
          duration: 3500,
        });
        this.loadAreas();
      },
      error: (err: any) => {
        const msg = err?.error?.detail || err?.error?.title || 'Failed to create intervention area.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
    });
  }

  openEditDialog(area: InterventionAreaDto): void {
    const dialogRef = this.dialog.open(InterventionAreaDialogComponent, {
      width: '640px',
      data: {
        area,
        allAreas: this.flatAreas(),
      } as InterventionAreaDialogData,
    });

    dialogRef.afterClosed().subscribe((result: UpdateInterventionAreaRequest | undefined) => {
      if (result) {
        this.updateArea(area.id, {
          ...result,
          interventionAreaId: area.id,
        });
      }
    });
  }

  updateArea(id: string, payload: UpdateInterventionAreaRequest): void {
    this.areaService.updateInterventionArea(id, payload).subscribe({
      next: () => {
        this.snackBar.open(`Intervention area "${payload.name}" updated successfully.`, 'Close', {
          duration: 3500,
        });
        this.loadAreas();
      },
      error: (err: any) => {
        const msg = err?.error?.detail || err?.error?.title || 'Failed to update intervention area.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
    });
  }

  confirmDelete(area: InterventionAreaDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Intervention Area',
        message: `Are you sure you want to delete "${area.name}" (${area.code})? This will check that no children or active project allocations depend on it.`,
        confirmText: 'Delete Area',
        cancelText: 'Cancel',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteArea(area.id, area.name);
      }
    });
  }

  deleteArea(id: string, name: string): void {
    this.areaService.deleteInterventionArea(id).subscribe({
      next: () => {
        this.snackBar.open(`Intervention area "${name}" deleted.`, 'Close', { duration: 3500 });
        this.loadAreas();
      },
      error: (err: any) => {
        const msg = err?.error?.detail || err?.error?.title || 'Failed to delete intervention area.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
    });
  }

  seedSampleHierarchy(): void {
    this.seeding.set(true);
    // Create standard Ethiopian hierarchy: Ethiopia -> Oromia -> East Hararghe -> Fedis & Babile
    const ethCountry: CreateInterventionAreaRequest = {
      name: 'Ethiopia',
      code: 'ETH',
      areaType: 'Country',
      description: 'Federal Democratic Republic of Ethiopia',
      latitude: 9.145,
      longitude: 40.489673,
      gpsSource: 'Manual',
      landmarkOrAddress: 'National Administrative Level',
    };

    this.areaService.createInterventionArea(ethCountry).subscribe({
      next: (cRes: { id: string }) => {
        const oromiaRegion: CreateInterventionAreaRequest = {
          name: 'Oromia Region',
          code: 'ETH-ORO',
          areaType: 'Region',
          parentId: cRes.id,
          description: 'Oromia Regional State',
          latitude: 8.5411,
          longitude: 39.2689,
          gpsSource: 'Manual',
        };

        this.areaService.createInterventionArea(oromiaRegion).subscribe({
          next: (rRes: { id: string }) => {
            const eastHarargheZone: CreateInterventionAreaRequest = {
              name: 'East Hararghe Zone',
              code: 'ETH-ORO-EH',
              areaType: 'Zone',
              parentId: rRes.id,
              description: 'East Hararghe Administrative Zone',
              latitude: 9.3138,
              longitude: 42.1182,
              gpsSource: 'Manual',
            };

            this.areaService.createInterventionArea(eastHarargheZone).subscribe({
              next: (zRes: { id: string }) => {
                const babileWoreda: CreateInterventionAreaRequest = {
                  name: 'Babile Woreda',
                  code: 'ETH-ORO-EH-BAB',
                  areaType: 'Woreda',
                  parentId: zRes.id,
                  description: 'Babile Woreda (District) Agricultural & WASH Intervention Area',
                  latitude: 9.2154,
                  longitude: 42.2891,
                  altitude: 1650,
                  accuracy: 8,
                  gpsSource: 'Device',
                  landmarkOrAddress: 'Near Babile Health Center, Sector 02',
                };

                const fedisWoreda: CreateInterventionAreaRequest = {
                  name: 'Fedis Woreda',
                  code: 'ETH-ORO-EH-FED',
                  areaType: 'Woreda',
                  parentId: zRes.id,
                  description: 'Fedis Woreda (District) Food Security & Nutrition Area',
                  latitude: 9.0667,
                  longitude: 42.0667,
                  altitude: 1720,
                  accuracy: 10,
                  gpsSource: 'Device',
                  landmarkOrAddress: 'Bokoh Town Central Administration Block',
                };

                this.areaService.createInterventionArea(babileWoreda).subscribe({
                  next: (bRes: { id: string }) => {
                    const kebele01: CreateInterventionAreaRequest = {
                      name: 'Babile Kebele 01',
                      code: 'ETH-ORO-EH-BAB-K01',
                      areaType: 'Kebele',
                      parentId: bRes.id,
                      description: 'Urban & Peri-Urban Kebele',
                      latitude: 9.221,
                      longitude: 42.292,
                      gpsSource: 'Manual',
                      landmarkOrAddress: 'Community Center, Babile 01',
                    };
                    this.areaService.createInterventionArea(kebele01).subscribe();
                  },
                });

                this.areaService.createInterventionArea(fedisWoreda).subscribe({
                  next: () => {
                    this.seeding.set(false);
                    this.snackBar.open('Standard Ethiopian administrative hierarchy seeded!', 'Close', {
                      duration: 4000,
                    });
                    this.loadAreas();
                  },
                  error: () => {
                    this.seeding.set(false);
                    this.loadAreas();
                  },
                });
              },
              error: () => {
                this.seeding.set(false);
                this.loadAreas();
              },
            });
          },
          error: () => {
            this.seeding.set(false);
            this.loadAreas();
          },
        });
      },
      error: () => {
        this.seeding.set(false);
        this.snackBar.open('Failed to seed hierarchy', 'Close', { duration: 4000 });
      },
    });
  }
}

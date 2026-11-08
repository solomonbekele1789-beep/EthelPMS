import { Component, inject, OnInit, signal, computed, input, effect } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
  ConfirmDialogComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectActions } from '../../store/project.actions';
import { selectSelectedProject, selectProjectsLoading, selectLogframe } from '../../store/project.selectors';
import { ProjectService } from '../../services/project.service';
import { InterventionAreaService } from '../../services/intervention-area.service';
import { ProjectInterventionAreaDto } from '../../models/intervention-area.model';
import { ProjectTeamMemberDto } from '../../models/project.model';
import LogframeComponent from '../logframe/logframe.component';
import { TeamMemberDialogComponent, TeamMemberDialogData } from '../../components/team-member-dialog/team-member-dialog.component';
import { AllocateInterventionAreaDialogComponent, AllocateInterventionAreaDialogData } from '../../components/allocate-intervention-area-dialog/allocate-intervention-area-dialog.component';

@Component({
  selector: 'ethel-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
    LogframeComponent,
  ],
  template: `
    <app-page-header [title]="project()?.name ?? ('projects.detail.title' | translate)">
      @if (project()) {
        <app-status-badge [status]="project()!.status" [label]="project()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !project()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (project()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'projects.detail.overview' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.code' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.code }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.name' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.name }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.status' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="project()!.status" [label]="project()!.status"></app-status-badge>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.startDate' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.startDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.endDate' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.endDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.budget' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.totalBudget | currency:'USD':'symbol':'1.0-0' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.donor' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.donorName || '-' }}</mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.beneficiaries' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div>Direct: {{ project()!.totalDirectBeneficiaries | number }}</div>
                  <div>Indirect: {{ project()!.totalIndirectBeneficiaries | number }}</div>
                </mat-card-content>
              </mat-card>
            </div>

            @if (project()!.description) {
              <mat-card class="narrative-card">
                <mat-card-header>
                  <mat-card-title>{{ 'projects.fields.description' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.description }}</mat-card-content>
              </mat-card>
            }

            @if (project()!.assumptions) {
              <mat-card class="narrative-card">
                <mat-card-header>
                  <mat-card-title>Assumptions</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.assumptions }}</mat-card-content>
              </mat-card>
            }

            @if (project()!.risks) {
              <mat-card class="narrative-card">
                <mat-card-header>
                  <mat-card-title>Risks</mat-card-title>
                </mat-card-header>
                <mat-card-content>{{ project()!.risks }}</mat-card-content>
              </mat-card>
            }

            <div class="action-buttons">
              @if (project()!.status === 'Draft') {
                <button mat-flat-button color="primary" *appHasPermission="'projects.projects.create'" (click)="onSubmit()">
                  <mat-icon>send</mat-icon>
                  {{ 'projects.actions.submit' | translate }}
                </button>
              }
              @if (project()!.status === 'Submitted') {
                <button mat-flat-button color="primary" *appHasPermission="'projects.projects.approve'" (click)="onApprove()">
                  <mat-icon>check_circle</mat-icon>
                  {{ 'projects.actions.approve' | translate }}
                </button>
                <button mat-stroked-button color="warn" *appHasPermission="'projects.projects.approve'" (click)="onReject()">
                  <mat-icon>cancel</mat-icon>
                  {{ 'projects.actions.reject' | translate }}
                </button>
              }
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Logframe Tab -->
        <mat-tab [label]="('projects.detail.logframe' | translate) + ' (Outcomes, Outputs & Activities)'">
          <div class="tab-content">
            @if (loading() && !logframe()) {
              <app-loading-spinner></app-loading-spinner>
            } @else {
              <ethel-logframe [projectId]="id()" [logframe]="logframe()"></ethel-logframe>
            }
          </div>
        </mat-tab>

        <!-- Team Tab -->
        <mat-tab [label]="'projects.detail.team' | translate">
          <div class="tab-content team-tab-content">
            <div class="team-header-bar">
              <div class="team-title-section">
                <div class="team-title-row">
                  <mat-icon class="team-icon">group</mat-icon>
                  <h3>Project Team Members</h3>
                  <span class="count-pill">{{ teamMembers().length }}</span>
                </div>
                <p class="team-subtitle">Staff and specialists assigned to execute and monitor this project</p>
              </div>

              <button
                mat-flat-button
                color="primary"
                class="add-team-btn"
                (click)="onAddTeamMember()"
              >
                <mat-icon>person_add</mat-icon>
                Assign Team Member
              </button>
            </div>

            @if (loadingTeam()) {
              <div class="loading-team-box">
                <mat-progress-spinner mode="indeterminate" diameter="32"></mat-progress-spinner>
                <span>Loading team members...</span>
              </div>
            } @else if (teamMembers().length === 0) {
              <div class="empty-team-card">
                <div class="empty-icon-wrapper">
                  <mat-icon>group</mat-icon>
                </div>
                <h4>No Team Members Assigned Yet</h4>
                <p class="empty-desc">
                  Assign project managers, MEAL officers, field coordinators, or technical specialists to collaborate on this project.
                </p>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="onAddTeamMember()"
                >
                  <mat-icon>person_add</mat-icon>
                  Assign First Team Member
                </button>
              </div>
            } @else {
              <div class="team-grid">
                @for (member of teamMembers(); track member.id) {
                  <div class="team-card">
                    <div class="team-card-top">
                      <div class="member-avatar">
                        {{ getInitials(member.fullName) }}
                      </div>
                      <div class="member-info">
                        <h4 class="member-name">{{ member.fullName }}</h4>
                        <span class="member-email">{{ member.email }}</span>
                      </div>
                      <button
                        mat-icon-button
                        class="remove-btn"
                        (click)="onRemoveTeamMember(member)"
                        matTooltip="Remove from project"
                      >
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>

                    <div class="team-card-bottom">
                      <span class="role-badge" [ngClass]="getRoleClass(member.role)">
                        <mat-icon class="role-icon">badge</mat-icon>
                        {{ member.role }}
                      </span>
                      <span class="assigned-date">Assigned {{ member.assignedAt | date:'mediumDate' }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </mat-tab>

        <!-- Intervention Areas Tab -->
        <mat-tab [label]="'projects.detail.interventionAreas' | translate">
          <div class="tab-content">
            <div class="ia-tab-header">
              <div class="ia-title-block">
                <h3>Geographic Footprint & Intervention Areas</h3>
                <p class="ia-subtitle">
                  Track locations, field boundaries, GPS geotags, budget splits, and beneficiary targets for this project.
                </p>
              </div>
              <button
                mat-flat-button
                color="primary"
                (click)="openAllocateAreaDialog()"
                *appHasPermission="'projects.interventionareas.manage'"
              >
                <mat-icon>add_location_alt</mat-icon>
                <span>Allocate Intervention Area</span>
              </button>
            </div>

            @if (loadingAreas()) {
              <div class="ia-loading">
                <mat-spinner diameter="32"></mat-spinner>
                <span>Loading allocated intervention areas...</span>
              </div>
            } @else if (interventionAreas().length > 0) {
              <!-- Allocation summary KPI -->
              <div class="ia-summary-bar">
                <div class="summary-metric">
                  <span class="metric-label">Allocated Locations</span>
                  <span class="metric-value">{{ interventionAreas().length }}</span>
                </div>
                <div class="summary-metric">
                  <span class="metric-label">Total Allocated Budget</span>
                  <span class="metric-value">{{ totalAllocatedBudget() | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="summary-metric">
                  <span class="metric-label">Budget Allocation</span>
                  <span class="metric-value">{{ totalAllocatedPercentage() }}%</span>
                </div>
                <div class="summary-metric">
                  <span class="metric-label">Direct Beneficiaries</span>
                  <span class="metric-value">{{ totalDirectBeneficiaries() | number }}</span>
                </div>
              </div>

              <!-- Allocations Grid -->
              <div class="ia-cards-grid">
                @for (area of interventionAreas(); track area.id) {
                  <mat-card class="ia-card">
                    <mat-card-header class="ia-card-header">
                      <div class="ia-header-left">
                        <span class="tier-chip tier-{{ (area.areaType || 'Region').toLowerCase() }}">
                          {{ area.areaType || 'Area' }}
                        </span>
                        @if (area.interventionAreaCode) {
                          <span class="ia-code">{{ area.interventionAreaCode }}</span>
                        }
                      </div>

                      <button
                        mat-icon-button
                        color="warn"
                        (click)="confirmDeallocateArea(area)"
                        matTooltip="Remove Allocation from Project"
                        *appHasPermission="'projects.interventionareas.manage'"
                      >
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </mat-card-header>

                    <mat-card-content class="ia-card-body">
                      <h4 class="ia-area-title">{{ area.interventionAreaName }}</h4>

                      @if (area.parentName) {
                        <div class="ia-parent-row">
                          <mat-icon class="sub-icon">subdirectory_arrow_right</mat-icon>
                          <span>Part of: {{ area.parentName }}</span>
                        </div>
                      }

                      <!-- GPS / Location Details -->
                      @if (area.latitude && area.longitude) {
                        <div class="ia-gps-box">
                          <mat-icon class="gps-pin-icon">place</mat-icon>
                          <span class="gps-text">{{ area.latitude }}, {{ area.longitude }}</span>
                          <a
                            [href]="'https://www.google.com/maps?q=' + area.latitude + ',' + area.longitude"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="maps-btn"
                            matTooltip="Open in Google Maps"
                          >
                            <mat-icon>open_in_new</mat-icon>
                          </a>
                        </div>
                      }

                      @if (area.landmarkOrAddress) {
                        <div class="ia-landmark-row">
                          <mat-icon>storefront</mat-icon>
                          <span>{{ area.landmarkOrAddress }}</span>
                        </div>
                      }

                      <!-- Budget allocation row -->
                      <div class="ia-metric-row">
                        <div class="metric-box">
                          <span class="m-label">Allocated Budget</span>
                          <span class="m-val">{{ area.budgetAllocated | currency:'USD':'symbol':'1.0-0' }}</span>
                          <span class="m-pct">{{ area.budgetPercentage }}% of project</span>
                        </div>

                        <!-- Beneficiaries breakdown -->
                        <div class="metric-box">
                          <span class="m-label">Beneficiary Targets</span>
                          <div class="bene-breakdown">
                            <span>Direct: <strong>{{ (area.directBeneficiariesMale + area.directBeneficiariesFemale) | number }}</strong> ({{ area.directBeneficiariesMale }}M / {{ area.directBeneficiariesFemale }}F)</span>
                            <span>Indirect: <strong>{{ (area.indirectBeneficiariesMale + area.indirectBeneficiariesFemale) | number }}</strong> ({{ area.indirectBeneficiariesMale }}M / {{ area.indirectBeneficiariesFemale }}F)</span>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            } @else {
              <app-empty-state
                icon="add_location_alt"
                title="No intervention areas allocated yet"
                message="Assign pre-configured administrative woredas, kebeles, or intervention sites to establish this project's geographic footprint and target beneficiaries.">
                <button
                  mat-flat-button
                  color="primary"
                  (click)="openAllocateAreaDialog()"
                  *appHasPermission="'projects.interventionareas.manage'"
                >
                  <mat-icon>add_location_alt</mat-icon>
                  <span>Allocate First Area</span>
                </button>
              </app-empty-state>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .narrative-card { margin-bottom: 1rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    /* Team Tab Styling */
    .team-tab-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .team-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--border-color, #e0e0e0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .team-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .team-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .team-title-row h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .count-pill {
      background: #e3f2fd;
      color: #1565c0;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
    }
    .team-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: var(--text-secondary, #666);
    }
    .loading-team-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-secondary, #666);
    }
    .empty-team-card {
      text-align: center;
      padding: 3rem 2rem;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px dashed var(--border-color, #bdbdbd);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .empty-icon-wrapper mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }
    .empty-team-card h4 {
      margin: 0 0 0.5rem;
      font-size: 1.15rem;
      font-weight: 600;
    }
    .empty-desc {
      max-width: 500px;
      color: var(--text-secondary, #666);
      font-size: 0.875rem;
      line-height: 1.4;
      margin-bottom: 1.25rem;
    }
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .team-card {
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid var(--border-color, #e0e0e0);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .team-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border-color: #bbdefb;
    }
    .team-card-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .member-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1976d2;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .member-info {
      flex: 1;
      min-width: 0;
    }
    .member-name {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary, #212121);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .member-email {
      font-size: 0.8rem;
      color: var(--text-secondary, #757575);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    .remove-btn {
      color: #9e9e9e;
      flex-shrink: 0;
    }
    .remove-btn:hover {
      color: #d32f2f;
    }
    .team-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 0.5rem;
      border-top: 1px solid #f0f0f0;
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .role-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .role-manager { background: #e3f2fd; color: #1565c0; }
    .role-meal { background: #f3e5f5; color: #7b1fa2; }
    .role-field { background: #e8f5e9; color: #2e7d32; }
    .role-finance { background: #fff3e0; color: #e65100; }
    .role-default { background: #f5f5f5; color: #616161; }
    .assigned-date {
      font-size: 0.72rem;
      color: var(--text-secondary, #9e9e9e);
    }

    /* Intervention Areas Styles */
    .ia-tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .ia-title-block h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: #0f172a;
    }
    .ia-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.85rem;
    }
    .ia-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: #64748b;
    }
    .ia-summary-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }
    .summary-metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .summary-metric .metric-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
    .summary-metric .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .ia-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .ia-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .ia-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .ia-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px 8px;
    }
    .ia-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tier-chip {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.725rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .tier-chip.tier-country { background: #fef3c7; color: #92400e; }
    .tier-chip.tier-region { background: #dbeafe; color: #1e40af; }
    .tier-chip.tier-zone { background: #e0e7ff; color: #3730a3; }
    .tier-chip.tier-woreda { background: #f3e8ff; color: #6b21a8; }
    .tier-chip.tier-kebele { background: #dcfce7; color: #166534; }
    .tier-chip.tier-site { background: #ffedd5; color: #9a3412; }
    .tier-chip.tier-area { background: #e2e8f0; color: #334155; }
    .ia-code {
      font-family: monospace;
      font-size: 0.75rem;
      color: #64748b;
    }
    .ia-card-body {
      padding: 8px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ia-area-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #0f172a;
    }
    .ia-parent-row {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #64748b;
      font-size: 0.8rem;
    }
    .ia-parent-row .sub-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }
    .ia-gps-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.775rem;
      color: #9a3412;
    }
    .ia-gps-box .gps-pin-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ea580c;
    }
    .ia-gps-box .maps-btn {
      margin-left: auto;
      color: #ea580c;
      display: flex;
      align-items: center;
    }
    .ia-gps-box .maps-btn mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .ia-landmark-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.775rem;
      color: #475569;
    }
    .ia-landmark-row mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      color: #94a3b8;
    }
    .ia-metric-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 10px;
      border: 1px solid #f1f5f9;
    }
    .metric-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-box .m-label {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .metric-box .m-val {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }
    .metric-box .m-pct {
      font-size: 0.725rem;
      color: #2563eb;
      font-weight: 500;
    }
    .bene-breakdown {
      display: flex;
      flex-direction: column;
      font-size: 0.725rem;
      color: #334155;
      gap: 2px;
    }
  `,
})
export default class ProjectDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly areaService = inject(InterventionAreaService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  readonly id = input.required<string>();

  readonly project = this.store.selectSignal(selectSelectedProject);
  readonly loading = this.store.selectSignal(selectProjectsLoading);
  readonly logframe = this.store.selectSignal(selectLogframe);

  readonly activeTab = signal(0);
  readonly teamMembers = signal<ProjectTeamMemberDto[]>([]);
  readonly loadingTeam = signal(false);
  readonly interventionAreas = signal<ProjectInterventionAreaDto[]>([]);
  readonly loadingAreas = signal(false);

  readonly totalAllocatedBudget = computed(() =>
    this.interventionAreas().reduce((s, a) => s + (a.budgetAllocated || 0), 0)
  );

  readonly totalAllocatedPercentage = computed(() =>
    Number(this.interventionAreas().reduce((s, a) => s + (a.budgetPercentage || 0), 0).toFixed(1))
  );

  readonly totalDirectBeneficiaries = computed(() =>
    this.interventionAreas().reduce(
      (s, a) => s + (a.directBeneficiariesMale || 0) + (a.directBeneficiariesFemale || 0),
      0
    )
  );

  constructor() {
    effect(() => {
      const proj = this.project();
      if (proj && proj.interventionAreas && proj.interventionAreas.length > 0) {
        this.interventionAreas.set(proj.interventionAreas);
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ProjectActions.loadProject({ id: this.id() }));
    this.store.dispatch(ProjectActions.loadLogframe({ projectId: this.id() }));
    this.loadTeamMembers();
    this.loadInterventionAreas();
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1 && !this.logframe()) {
      this.store.dispatch(ProjectActions.loadLogframe({ projectId: this.id() }));
    } else if (index === 2) {
      this.loadTeamMembers();
    } else if (index === 3) {
      this.loadInterventionAreas();
    }
  }

  loadTeamMembers(): void {
    this.loadingTeam.set(true);
    this.projectService.getTeamMembers(this.id()).subscribe({
      next: (members) => {
        this.teamMembers.set(members);
        this.loadingTeam.set(false);
      },
      error: () => {
        this.loadingTeam.set(false);
      },
    });
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getRoleClass(role: string): string {
    const r = (role || '').toLowerCase();
    if (r.includes('manager') || r.includes('coordinator')) return 'role-manager';
    if (r.includes('meal') || r.includes('monitor') || r.includes('evaluat')) return 'role-meal';
    if (r.includes('field') || r.includes('facilitat') || r.includes('agronomist') || r.includes('wash')) return 'role-field';
    if (r.includes('finance') || r.includes('procure') || r.includes('logistic')) return 'role-finance';
    return 'role-default';
  }

  onAddTeamMember(): void {
    const existingIds = this.teamMembers().map((m) => m.userId);
    const ref = this.dialog.open(TeamMemberDialogComponent, {
      width: '500px',
      data: {
        projectId: this.id(),
        projectName: this.project()?.name,
        existingUserIds: existingIds,
      } as TeamMemberDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService
          .addTeamMember(this.id(), {
            projectId: this.id(),
            userId: result.userId,
            role: result.role,
          })
          .subscribe({
            next: () => {
              this.notificationService.success('Team member assigned successfully');
              this.loadTeamMembers();
            },
            error: (err) => {
              this.notificationService.error(
                err?.error?.message || 'Failed to assign team member'
              );
            },
          });
      }
    });
  }

  onRemoveTeamMember(member: ProjectTeamMemberDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Team Member',
        message: `Are you sure you want to remove "${member.fullName}" (${member.role}) from this project team?`,
        confirmText: 'Remove',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.removeTeamMember(this.id(), member.id).subscribe({
          next: () => {
            this.notificationService.success(`Removed ${member.fullName} from project team`);
            this.loadTeamMembers();
          },
          error: (err) => {
            this.notificationService.error(
              err?.error?.message || 'Failed to remove team member'
            );
          },
        });
      }
    });
  }

  onSubmit(): void {
    this.store.dispatch(ProjectActions.submitProject({ id: this.id() }));
  }

  onApprove(): void {
    this.store.dispatch(ProjectActions.approveProject({ id: this.id() }));
  }

  onReject(): void {
    this.store.dispatch(
      ProjectActions.rejectProject({
        id: this.id(),
        request: { projectId: this.id(), reason: '' },
      })
    );
  }

  loadInterventionAreas(): void {
    this.loadingAreas.set(true);
    this.areaService.listProjectInterventionAreas(this.id()).subscribe({
      next: (areas) => {
        this.interventionAreas.set(areas);
        this.loadingAreas.set(false);
      },
      error: () => {
        this.loadingAreas.set(false);
      },
    });
  }

  openAllocateAreaDialog(): void {
    const dialogRef = this.dialog.open(AllocateInterventionAreaDialogComponent, {
      width: '680px',
      data: {
        projectId: this.id(),
        projectTitle: this.project()?.name || '',
        totalBudget: this.project()?.totalBudget,
        allocatedAreaIds: this.interventionAreas().map((a) => a.interventionAreaId),
      } as AllocateInterventionAreaDialogData,
    });

    dialogRef.afterClosed().subscribe((allocated) => {
      if (allocated) {
        this.notificationService.success('Intervention area allocated to project successfully.');
        this.loadInterventionAreas();
      }
    });
  }

  confirmDeallocateArea(area: ProjectInterventionAreaDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Remove Intervention Area',
        message: `Are you sure you want to remove "${area.interventionAreaName}" from this project's allocations?`,
        confirmText: 'Remove Allocation',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.areaService.deallocateInterventionArea(this.id(), area.id).subscribe({
          next: () => {
            this.notificationService.success('Intervention area removed from project.');
            this.loadInterventionAreas();
          },
          error: (err) => {
            this.notificationService.error(err.error?.detail || 'Failed to remove intervention area.');
          },
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}

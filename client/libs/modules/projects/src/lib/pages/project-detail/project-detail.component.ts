import { Component, inject, OnInit, signal, computed, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ProjectActions } from '../../store/project.actions';
import { selectSelectedProject, selectProjectsLoading, selectLogframe } from '../../store/project.selectors';
import { ProjectService } from '../../services/project.service';
import { ProjectInterventionAreaDto } from '../../models/intervention-area.model';
import LogframeComponent from '../logframe/logframe.component';

@Component({
  selector: 'ethel-project-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
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
        <mat-tab [label]="'projects.detail.logframe' | translate">
          <div class="tab-content">
            @if (logframe()) {
              <ethel-logframe [logframe]="logframe()"></ethel-logframe>
            } @else if (loading()) {
              <app-loading-spinner></app-loading-spinner>
            } @else {
              <app-empty-state
                icon="account_tree"
                title="No logframe data"
                message="The logframe for this project has not been set up yet.">
              </app-empty-state>
            }
          </div>
        </mat-tab>

        <!-- Team Tab -->
        <mat-tab [label]="'projects.detail.team' | translate">
          <div class="tab-content">
            @if (teamMembers().length > 0) {
              <mat-list>
                @for (member of teamMembers(); track member.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>person</mat-icon>
                    <span matListItemTitle>{{ member.name }}</span>
                    <span matListItemLine>{{ member.role }}</span>
                    <button mat-icon-button matListItemMeta *appHasPermission="'projects.projects.update'" (click)="onRemoveTeamMember(member.id)">
                      <mat-icon>remove_circle_outline</mat-icon>
                    </button>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <app-empty-state
                icon="group"
                title="No team members"
                message="Add team members to this project.">
              </app-empty-state>
            }

            <div class="add-section" *appHasPermission="'projects.projects.update'">
              <button mat-flat-button color="primary" (click)="onAddTeamMember()">
                <mat-icon>person_add</mat-icon>
                {{ 'common.add' | translate }}
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Intervention Areas Tab -->
        <mat-tab [label]="'projects.detail.interventionAreas' | translate">
          <div class="tab-content">
            @if (interventionAreas().length > 0) {
              <mat-list>
                @for (area of interventionAreas(); track area.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>category</mat-icon>
                    <span matListItemTitle>{{ area.interventionAreaName }}</span>
                    <span matListItemLine>
                      Budget: {{ area.budgetAllocated | currency:'USD':'symbol':'1.0-0' }}
                      ({{ area.budgetPercentage }}%) |
                      Beneficiaries M: {{ area.directBeneficiariesMale }} F: {{ area.directBeneficiariesFemale }}
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <app-empty-state
                icon="category"
                title="No intervention areas"
                message="Allocate intervention areas to this project.">
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
    .add-section {
      margin-top: 1.5rem;
    }
  `,
})
export default class ProjectDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  readonly id = input.required<string>();

  readonly project = this.store.selectSignal(selectSelectedProject);
  readonly loading = this.store.selectSignal(selectProjectsLoading);
  readonly logframe = this.store.selectSignal(selectLogframe);

  readonly activeTab = signal(0);
  readonly teamMembers = signal<{ id: string; name: string; role: string }[]>([]);
  readonly interventionAreas = signal<ProjectInterventionAreaDto[]>([]);

  constructor() {
    effect(() => {
      const proj = this.project();
      if (proj) {
        // Team and intervention areas would be loaded from project details or separate endpoints
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ProjectActions.loadProject({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1 && !this.logframe()) {
      this.store.dispatch(ProjectActions.loadLogframe({ projectId: this.id() }));
    }
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

  onAddTeamMember(): void {
    // Opens dialog or navigates to add team member
  }

  onRemoveTeamMember(memberId: string): void {
    this.projectService.removeTeamMember(this.id(), memberId).subscribe(() => {
      this.store.dispatch(ProjectActions.loadProject({ id: this.id() }));
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}

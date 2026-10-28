import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '@ethelpms/shared/ui';
import { PlanActions } from '../../store/plan.actions';
import { selectHierarchy, selectPlanningLoading } from '../../store/plan.selectors';
import { PlanHierarchyDto, PlanLevel } from '../../models/plan.model';

const LEVEL_ICONS: Record<string, string> = {
  Annual: 'calendar_today',
  Quarterly: 'date_range',
  Monthly: 'event',
  Weekly: 'view_week',
  Daily: 'today',
};

@Component({
  selector: 'ethel-plan-hierarchy',
  standalone: true,
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header [title]="'planning.hierarchy.title' | translate">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        {{ 'common.back' | translate }}
      </button>
    </app-page-header>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (hierarchyData().length === 0) {
      <app-empty-state
        icon="account_tree"
        title="No plan hierarchy"
        message="No plans found for this project. Create plans to see the hierarchy.">
      </app-empty-state>
    } @else {
      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="hierarchy-tree">
        <mat-nested-tree-node *matTreeNodeDef="let node">
          <div class="tree-node" (click)="onNodeClick(node)">
            <button mat-icon-button disabled class="no-children-spacer"></button>
            <mat-icon class="level-icon">{{ getLevelIcon(node.level) }}</mat-icon>
            <span class="node-level">{{ node.level }}</span>
            <span class="node-title">{{ node.title }}</span>
            <app-status-badge [status]="node.approvalStatus" [label]="node.approvalStatus"></app-status-badge>
            <span class="node-progress">{{ node.progressPercentage | number:'1.0-1' }}%</span>
            <span class="node-budget">{{ node.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
        </mat-nested-tree-node>

        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChildren">
          <div class="tree-node" (click)="onNodeClick(node)">
            <button mat-icon-button matTreeNodeToggle (click)="$event.stopPropagation()">
              <mat-icon>
                {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
              </mat-icon>
            </button>
            <mat-icon class="level-icon">{{ getLevelIcon(node.level) }}</mat-icon>
            <span class="node-level">{{ node.level }}</span>
            <span class="node-title">{{ node.title }}</span>
            <app-status-badge [status]="node.approvalStatus" [label]="node.approvalStatus"></app-status-badge>
            <span class="node-progress">{{ node.progressPercentage | number:'1.0-1' }}%</span>
            <span class="node-budget">{{ node.plannedBudget | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="nested-children" [class.hidden]="!treeControl.isExpanded(node)">
            <ng-container matTreeNodeOutlet></ng-container>
          </div>
        </mat-nested-tree-node>
      </mat-tree>
    }
  `,
  styles: `
    :host { display: block; }
    .hierarchy-tree {
      margin-top: 1rem;
    }
    .tree-node {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      cursor: pointer;
    }
    .tree-node:hover {
      background: var(--hover-bg, rgba(0, 0, 0, 0.04));
    }
    .no-children-spacer { visibility: hidden; }
    .level-icon {
      color: var(--primary-color, #1565c0);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .node-level {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary, #666);
      min-width: 70px;
    }
    .node-title {
      font-weight: 500;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .node-progress {
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 50px;
      text-align: right;
    }
    .node-budget {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      min-width: 100px;
      text-align: right;
    }
    .nested-children { padding-left: 2rem; }
    .hidden { display: none; }
  `,
})
export default class PlanHierarchyComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly hierarchyData = this.store.selectSignal(selectHierarchy);
  readonly loading = this.store.selectSignal(selectPlanningLoading);

  readonly treeControl = new NestedTreeControl<PlanHierarchyDto>(node => node.children);
  readonly dataSource = new MatTreeNestedDataSource<PlanHierarchyDto>();

  private projectId = '';

  constructor() {
    // Sync store hierarchy to tree data source via effect
    const self = this;
    // Using a simple approach: watch hierarchy changes
  }

  hasChildren = (_: number, node: PlanHierarchyDto): boolean =>
    !!(node.children && node.children.length > 0);

  getLevelIcon(level: string): string {
    return LEVEL_ICONS[level] || 'event_note';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'] || '';
      if (this.projectId) {
        this.store.dispatch(PlanActions.loadHierarchy({ projectId: this.projectId }));
      }
    });

    // Subscribe to hierarchy changes to update the data source
    this.store.select(selectHierarchy).subscribe(hierarchy => {
      this.dataSource.data = hierarchy;
    });
  }

  onNodeClick(node: PlanHierarchyDto): void {
    this.router.navigate(['/planning', node.id]);
  }

  goBack(): void {
    this.router.navigate(['/planning']);
  }
}

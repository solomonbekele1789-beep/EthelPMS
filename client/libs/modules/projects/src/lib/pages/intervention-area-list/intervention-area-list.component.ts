import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, EmptyStateComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { InterventionAreaService } from '../../services/intervention-area.service';
import {
  InterventionAreaDto,
  CreateInterventionAreaRequest,
  UpdateInterventionAreaRequest,
} from '../../models/intervention-area.model';

@Component({
  selector: 'ethel-intervention-area-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="'projects.interventionAreas.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'projects.interventionareas.create'" (click)="onAdd()">
        <mat-icon>add</mat-icon>
        {{ 'common.add' | translate }}
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (areas().length === 0) {
      <app-empty-state
        icon="category"
        title="No intervention areas"
        message="Create intervention areas to categorize your projects.">
      </app-empty-state>
    } @else {
      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="area-tree">
        <mat-nested-tree-node *matTreeNodeDef="let node">
          <div class="tree-node">
            <button mat-icon-button disabled class="no-children-spacer"></button>
            <span class="node-code">{{ node.code }}</span>
            <span class="node-name">{{ node.name }}</span>
            @if (node.description) {
              <span class="node-desc">{{ node.description }}</span>
            }
            <span class="spacer"></span>
            <button mat-icon-button *appHasPermission="'projects.interventionareas.update'" (click)="onEdit(node)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button *appHasPermission="'projects.interventionareas.create'" (click)="onAddChild(node)">
              <mat-icon>add_circle_outline</mat-icon>
            </button>
          </div>
        </mat-nested-tree-node>

        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChildren">
          <div class="tree-node">
            <button mat-icon-button matTreeNodeToggle>
              <mat-icon>
                {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
              </mat-icon>
            </button>
            <span class="node-code">{{ node.code }}</span>
            <span class="node-name">{{ node.name }}</span>
            @if (node.description) {
              <span class="node-desc">{{ node.description }}</span>
            }
            <span class="spacer"></span>
            <button mat-icon-button *appHasPermission="'projects.interventionareas.update'" (click)="onEdit(node)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button *appHasPermission="'projects.interventionareas.create'" (click)="onAddChild(node)">
              <mat-icon>add_circle_outline</mat-icon>
            </button>
          </div>
          <div class="nested-children" [class.hidden]="!treeControl.isExpanded(node)">
            <ng-container matTreeNodeOutlet></ng-container>
          </div>
        </mat-nested-tree-node>
      </mat-tree>
    }

    @if (showForm()) {
      <div class="inline-form">
        <h3>{{ editingId() ? 'Edit' : 'Add' }} Intervention Area</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmitForm()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" />
              @if (form.controls.code.hasError('required')) {
                <mat-error>Code is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="onCancelForm()">
              {{ 'common.cancel' | translate }}
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editingId() ? ('common.save' | translate) : ('common.create' | translate) }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .area-tree {
      margin-top: 1rem;
    }
    .tree-node {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    .no-children-spacer { visibility: hidden; }
    .node-code {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--primary-color, #1565c0);
      min-width: 60px;
    }
    .node-name { font-weight: 500; }
    .node-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary, #666);
    }
    .spacer { flex: 1; }
    .nested-children { padding-left: 2rem; }
    .hidden { display: none; }
    .inline-form {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      max-width: 600px;
    }
    .inline-form h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 500; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  `,
})
export default class InterventionAreaListComponent implements OnInit {
  private readonly interventionAreaService = inject(InterventionAreaService);
  private readonly fb = inject(FormBuilder);

  readonly areas = signal<InterventionAreaDto[]>([]);
  readonly loading = signal(false);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly parentId = signal<string | null>(null);

  readonly treeControl = new NestedTreeControl<InterventionAreaDto>(node => node.children);
  readonly dataSource = new MatTreeNestedDataSource<InterventionAreaDto>();

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
  });

  hasChildren = (_: number, node: InterventionAreaDto): boolean =>
    node.children && node.children.length > 0;

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading.set(true);
    this.interventionAreaService.listInterventionAreas().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.dataSource.data = areas;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onAdd(): void {
    this.editingId.set(null);
    this.parentId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  onAddChild(node: InterventionAreaDto): void {
    this.editingId.set(null);
    this.parentId.set(node.id);
    this.form.reset();
    this.showForm.set(true);
  }

  onEdit(node: InterventionAreaDto): void {
    this.editingId.set(node.id);
    this.parentId.set(null);
    this.form.patchValue({
      code: node.code,
      name: node.name,
      description: node.description ?? '',
    });
    this.showForm.set(true);
  }

  onCancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.parentId.set(null);
    this.form.reset();
  }

  onSubmitForm(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.editingId()) {
      const request: UpdateInterventionAreaRequest = {
        interventionAreaId: this.editingId()!,
        name: value.name,
        code: value.code,
        description: value.description || undefined,
      };
      this.interventionAreaService.updateInterventionArea(this.editingId()!, request).subscribe(() => {
        this.onCancelForm();
        this.loadAreas();
      });
    } else {
      const request: CreateInterventionAreaRequest = {
        name: value.name,
        code: value.code,
        description: value.description || undefined,
        parentId: this.parentId() ?? undefined,
      };
      this.interventionAreaService.createInterventionArea(request).subscribe(() => {
        this.onCancelForm();
        this.loadAreas();
      });
    }
  }
}

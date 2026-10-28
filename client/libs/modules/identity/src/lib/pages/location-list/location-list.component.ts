import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, LoadingSpinnerComponent } from '@ethelpms/shared/ui';
import { LocationService } from '../../services/location.service';
import { LocationTreeNode } from '../../models/location.model';

@Component({
  selector: 'ethel-location-list',
  standalone: true,
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-page-header title="Location Reference Data"></app-page-header>

    <div class="location-container">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ 'common.filter' | translate }}</mat-label>
        <input matInput (input)="onFilter($any($event.target).value)" [placeholder]="'Search locations...'" />
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
          <mat-nested-tree-node *matTreeNodeDef="let node">
            <div class="tree-leaf">
              <span class="level-badge">{{ node.level }}</span>
              <span class="node-name">{{ node.name }}</span>
              @if (node.nameAm) {
                <span class="node-name-am">({{ node.nameAm }})</span>
              }
            </div>
          </mat-nested-tree-node>

          <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
            <div class="tree-node">
              <button mat-icon-button (click)="toggleNode(node)">
                <mat-icon>{{ node.expanded ? 'expand_more' : 'chevron_right' }}</mat-icon>
              </button>
              <span class="level-badge">{{ node.level }}</span>
              <span class="node-name">{{ node.name }}</span>
              @if (node.nameAm) {
                <span class="node-name-am">({{ node.nameAm }})</span>
              }
            </div>
            <div class="tree-children" [class.hidden]="!node.expanded">
              <ng-container matTreeNodeOutlet></ng-container>
            </div>
          </mat-nested-tree-node>
        </mat-tree>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .location-container { display: flex; flex-direction: column; gap: 1rem; }
    .filter-field { max-width: 400px; }
    .tree-node, .tree-leaf {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }
    .tree-leaf { padding-left: 40px; }
    .tree-children { padding-left: 1.5rem; }
    .tree-children.hidden { display: none; }
    .level-badge {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e3f2fd;
      color: #1565c0;
    }
    .node-name { font-weight: 500; }
    .node-name-am { color: var(--text-secondary, #666); font-size: 0.875rem; }
  `,
})
export default class LocationListComponent implements OnInit {
  private readonly locationService = inject(LocationService);

  readonly loading = signal(false);
  readonly filterText = signal('');
  readonly treeData = signal<LocationTreeNode[]>([]);

  readonly treeControl = new NestedTreeControl<LocationTreeNode>(node => node.children);
  readonly dataSource = new MatTreeNestedDataSource<LocationTreeNode>();

  hasChild = (_: number, node: LocationTreeNode): boolean => {
    return node.level !== 'Kebele';
  };

  ngOnInit(): void {
    this.loading.set(true);
    this.locationService.getRegions().subscribe({
      next: (regions) => {
        const nodes: LocationTreeNode[] = regions.map(r => ({
          ...r,
          children: [],
          expanded: false,
        }));
        this.treeData.set(nodes);
        this.dataSource.data = nodes;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleNode(node: LocationTreeNode): void {
    if (node.expanded) {
      node.expanded = false;
      this.treeControl.collapse(node);
      return;
    }

    if (node.children.length > 0) {
      node.expanded = true;
      this.treeControl.expand(node);
      return;
    }

    // Lazy load children based on level
    let loader$;
    if (node.level === 'Region') {
      loader$ = this.locationService.getZones(node.id);
    } else if (node.level === 'Zone') {
      loader$ = this.locationService.getWoredas(node.id);
    } else if (node.level === 'Woreda') {
      loader$ = this.locationService.getKebeles(node.id);
    } else {
      return;
    }

    loader$.subscribe(children => {
      node.children = children.map(c => ({ ...c, children: [], expanded: false }));
      node.expanded = true;
      // Refresh data source
      this.dataSource.data = [...this.treeData()];
      this.treeControl.expand(node);
    });
  }

  onFilter(text: string): void {
    this.filterText.set(text);
    // Simple client-side filter on already loaded nodes
    if (!text) {
      this.dataSource.data = this.treeData();
    } else {
      const lower = text.toLowerCase();
      this.dataSource.data = this.treeData().filter(
        n => n.name.toLowerCase().includes(lower) || (n.nameAm && n.nameAm.includes(text))
      );
    }
  }
}

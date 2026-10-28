import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DocumentsActions } from '../../store/documents.actions';
import { selectFolderTree, selectDocumentsLoading } from '../../store/documents.selectors';
import { DocumentFolderService } from '../../services/document-folder.service';
import { FolderTreeDto, CreateFolderRequest, UpdateFolderRequest, MoveFolderRequest } from '../../models/folder.model';

@Component({
  selector: 'ethel-folder-tree',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'documents.folders.title' | translate">
      <button mat-flat-button color="primary" *appHasPermission="'documents.folders.create'" (click)="onCreate()">
        <mat-icon>create_new_folder</mat-icon>
        {{ 'documents.folders.create' | translate }}
      </button>
    </app-page-header>

    <div class="tree-container">
      @if (showCreateForm()) {
        <mat-card class="inline-form-card">
          <mat-card-header><mat-card-title>{{ 'documents.folders.create' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="createForm" (ngSubmit)="onCreateFolder()" class="edit-form">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'documents.fields.name' | translate }}</mat-label>
                  <input matInput formControlName="name" />
                  @if (createForm.controls.name.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'documents.fields.parentFolderId' | translate }}</mat-label>
                  <input matInput formControlName="parentFolderId" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'documents.fields.projectId' | translate }}</mat-label>
                  <input matInput formControlName="projectId" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'documents.fields.sortOrder' | translate }}</mat-label>
                  <input matInput formControlName="sortOrder" type="number" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'documents.fields.description' | translate }}</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showCreateForm.set(false)">{{ 'common.cancel' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || savingCreate()">
                  @if (savingCreate()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ 'common.create' | translate }}
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (folderTree().length === 0) {
        <app-empty-state
          icon="folder_off"
          title="No folders found"
          message="Create your first folder to organize documents.">
        </app-empty-state>
      } @else {
        <div class="folder-list">
          @for (folder of folderTree(); track folder.id) {
            <ng-container>
              @defer {
                <div class="folder-item" [style.padding-left.rem]="0">
                  <div class="folder-row">
                    <mat-icon>folder</mat-icon>
                    <span class="folder-name">{{ folder.name }}</span>
                    <span class="folder-badge" [matBadge]="''" matBadgeColor="primary" matBadgeSize="small"></span>
                    <span class="spacer"></span>
                    <button mat-icon-button *appHasPermission="'documents.folders.update'"
                            (click)="onEditFolder(folder)" title="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button *appHasPermission="'documents.folders.update'"
                            (click)="onMoveFolder(folder)" title="Move">
                      <mat-icon>drive_file_move</mat-icon>
                    </button>
                  </div>

                  @if (editingFolderId() === folder.id) {
                    <form [formGroup]="editForm" (ngSubmit)="onUpdateFolder()" class="inline-edit-form">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'documents.fields.name' | translate }}</mat-label>
                        <input matInput formControlName="name" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'documents.fields.description' | translate }}</mat-label>
                        <input matInput formControlName="description" />
                      </mat-form-field>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="editingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                        <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || savingEdit()">
                          @if (savingEdit()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                        </button>
                      </div>
                    </form>
                  }

                  @if (movingFolderId() === folder.id) {
                    <form [formGroup]="moveForm" (ngSubmit)="onMoveFolderSubmit()" class="inline-edit-form">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'documents.fields.parentFolderId' | translate }}</mat-label>
                        <input matInput formControlName="parentFolderId" />
                      </mat-form-field>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="movingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                        <button mat-flat-button color="primary" type="submit" [disabled]="savingMove()">
                          @if (savingMove()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                        </button>
                      </div>
                    </form>
                  }
                </div>

                @for (child of folder.children; track child.id) {
                  <div class="folder-item" [style.padding-left.rem]="1.5">
                    <div class="folder-row">
                      <mat-icon>folder_open</mat-icon>
                      <span class="folder-name">{{ child.name }}</span>
                      <span class="spacer"></span>
                      <button mat-icon-button *appHasPermission="'documents.folders.update'"
                              (click)="onEditFolder(child)" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button *appHasPermission="'documents.folders.update'"
                              (click)="onMoveFolder(child)" title="Move">
                        <mat-icon>drive_file_move</mat-icon>
                      </button>
                    </div>

                    @if (editingFolderId() === child.id) {
                      <form [formGroup]="editForm" (ngSubmit)="onUpdateFolder()" class="inline-edit-form">
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'documents.fields.name' | translate }}</mat-label>
                          <input matInput formControlName="name" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'documents.fields.description' | translate }}</mat-label>
                          <input matInput formControlName="description" />
                        </mat-form-field>
                        <div class="form-actions">
                          <button mat-button type="button" (click)="editingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                          <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || savingEdit()">
                            @if (savingEdit()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                          </button>
                        </div>
                      </form>
                    }

                    @if (movingFolderId() === child.id) {
                      <form [formGroup]="moveForm" (ngSubmit)="onMoveFolderSubmit()" class="inline-edit-form">
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'documents.fields.parentFolderId' | translate }}</mat-label>
                          <input matInput formControlName="parentFolderId" />
                        </mat-form-field>
                        <div class="form-actions">
                          <button mat-button type="button" (click)="movingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                          <button mat-flat-button color="primary" type="submit" [disabled]="savingMove()">
                            @if (savingMove()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                          </button>
                        </div>
                      </form>
                    }
                  </div>

                  @for (grandchild of child.children; track grandchild.id) {
                    <div class="folder-item" [style.padding-left.rem]="3">
                      <div class="folder-row">
                        <mat-icon>folder_open</mat-icon>
                        <span class="folder-name">{{ grandchild.name }}</span>
                        <span class="spacer"></span>
                        <button mat-icon-button *appHasPermission="'documents.folders.update'"
                                (click)="onEditFolder(grandchild)" title="Edit">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button *appHasPermission="'documents.folders.update'"
                                (click)="onMoveFolder(grandchild)" title="Move">
                          <mat-icon>drive_file_move</mat-icon>
                        </button>
                      </div>

                      @if (editingFolderId() === grandchild.id) {
                        <form [formGroup]="editForm" (ngSubmit)="onUpdateFolder()" class="inline-edit-form">
                          <mat-form-field appearance="outline">
                            <mat-label>{{ 'documents.fields.name' | translate }}</mat-label>
                            <input matInput formControlName="name" />
                          </mat-form-field>
                          <mat-form-field appearance="outline">
                            <mat-label>{{ 'documents.fields.description' | translate }}</mat-label>
                            <input matInput formControlName="description" />
                          </mat-form-field>
                          <div class="form-actions">
                            <button mat-button type="button" (click)="editingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                            <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || savingEdit()">
                              @if (savingEdit()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                            </button>
                          </div>
                        </form>
                      }

                      @if (movingFolderId() === grandchild.id) {
                        <form [formGroup]="moveForm" (ngSubmit)="onMoveFolderSubmit()" class="inline-edit-form">
                          <mat-form-field appearance="outline">
                            <mat-label>{{ 'documents.fields.parentFolderId' | translate }}</mat-label>
                            <input matInput formControlName="parentFolderId" />
                          </mat-form-field>
                          <div class="form-actions">
                            <button mat-button type="button" (click)="movingFolderId.set(null)">{{ 'common.cancel' | translate }}</button>
                            <button mat-flat-button color="primary" type="submit" [disabled]="savingMove()">
                              @if (savingMove()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ 'common.save' | translate }} }
                            </button>
                          </div>
                        </form>
                      }
                    </div>
                  }
                }
              }
            </ng-container>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .tree-container { display: flex; flex-direction: column; gap: 1rem; }
    .inline-form-card { margin-bottom: 1.5rem; }
    .folder-list { display: flex; flex-direction: column; }
    .folder-item { border-bottom: 1px solid var(--mat-sys-outline-variant, #e0e0e0); }
    .folder-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0;
    }
    .folder-name { font-weight: 500; }
    .spacer { flex: 1; }
    .inline-edit-form {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      flex-wrap: wrap;
      padding: 0.5rem 0 1rem 2rem;
    }
    .edit-form { padding: 1rem 0; }
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
export default class FolderTreeComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly folderService = inject(DocumentFolderService);
  private readonly notification = inject(NotificationService);

  readonly folderTree = this.store.selectSignal(selectFolderTree);
  readonly loading = this.store.selectSignal(selectDocumentsLoading);

  readonly showCreateForm = signal(false);
  readonly savingCreate = signal(false);
  readonly editingFolderId = signal<string | null>(null);
  readonly savingEdit = signal(false);
  readonly movingFolderId = signal<string | null>(null);
  readonly savingMove = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    parentFolderId: [''],
    description: [''],
    projectId: [''],
    sortOrder: [0],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly moveForm = this.fb.nonNullable.group({
    parentFolderId: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(DocumentsActions.loadFolderTree({}));
  }

  onCreate(): void {
    this.showCreateForm.set(true);
    this.createForm.reset({ sortOrder: 0 });
  }

  onCreateFolder(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    const request: CreateFolderRequest = {
      name: value.name,
      parentFolderId: value.parentFolderId || undefined,
      description: value.description || undefined,
      projectId: value.projectId || undefined,
      sortOrder: value.sortOrder || undefined,
    };
    this.savingCreate.set(true);
    this.folderService.createFolder(request).subscribe({
      next: () => {
        this.notification.success('Folder created successfully');
        this.showCreateForm.set(false);
        this.createForm.reset({ sortOrder: 0 });
        this.savingCreate.set(false);
        this.store.dispatch(DocumentsActions.loadFolderTree({}));
      },
      error: () => {
        this.notification.error('Failed to create folder');
        this.savingCreate.set(false);
      },
    });
  }

  onEditFolder(folder: FolderTreeDto): void {
    this.movingFolderId.set(null);
    this.editingFolderId.set(folder.id);
    this.editForm.patchValue({
      name: folder.name,
      description: '',
    });
  }

  onUpdateFolder(): void {
    if (this.editForm.invalid || !this.editingFolderId()) return;
    const value = this.editForm.getRawValue();
    const request: UpdateFolderRequest = {
      folderId: this.editingFolderId()!,
      name: value.name,
      description: value.description || undefined,
    };
    this.savingEdit.set(true);
    this.folderService.updateFolder(this.editingFolderId()!, request).subscribe({
      next: () => {
        this.notification.success('Folder updated successfully');
        this.editingFolderId.set(null);
        this.savingEdit.set(false);
        this.store.dispatch(DocumentsActions.loadFolderTree({}));
      },
      error: () => {
        this.notification.error('Failed to update folder');
        this.savingEdit.set(false);
      },
    });
  }

  onMoveFolder(folder: FolderTreeDto): void {
    this.editingFolderId.set(null);
    this.movingFolderId.set(folder.id);
    this.moveForm.patchValue({
      parentFolderId: folder.parentFolderId ?? '',
    });
  }

  onMoveFolderSubmit(): void {
    if (!this.movingFolderId()) return;
    const value = this.moveForm.getRawValue();
    const request: MoveFolderRequest = {
      folderId: this.movingFolderId()!,
      parentFolderId: value.parentFolderId || undefined,
    };
    this.savingMove.set(true);
    this.folderService.moveFolder(this.movingFolderId()!, request).subscribe({
      next: () => {
        this.notification.success('Folder moved successfully');
        this.movingFolderId.set(null);
        this.savingMove.set(false);
        this.store.dispatch(DocumentsActions.loadFolderTree({}));
      },
      error: () => {
        this.notification.error('Failed to move folder');
        this.savingMove.set(false);
      },
    });
  }
}

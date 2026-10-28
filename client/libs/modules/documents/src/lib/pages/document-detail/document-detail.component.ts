import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DocumentsActions } from '../../store/documents.actions';
import { selectSelectedDocument, selectDocumentsLoading } from '../../store/documents.selectors';
import { DocumentService } from '../../services/document.service';
import {
  DocumentDto,
  DocumentVersionDto,
  DocumentCommentDto,
  DocumentCategory,
  UpdateDocumentMetadataRequest,
  UploadNewVersionRequest,
  AddDocumentCommentRequest,
} from '../../models/document.model';

@Component({
  selector: 'ethel-document-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
    TranslatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="doc()?.displayName ?? doc()?.fileName ?? ('documents.documents.detail' | translate)">
      @if (doc()) {
        <button mat-stroked-button *appHasPermission="'documents.documents.update'" (click)="toggleEditMode()">
          <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
          {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
        </button>
      }
    </app-page-header>

    @if (loading() && !doc()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (doc()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'documents.tabs.overview' | translate">
          <div class="tab-content">
            @if (!editing()) {
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.fileName' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.fileName }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.displayName' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.displayName || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.category' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content><mat-chip>{{ doc()!.category }}</mat-chip></mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.status' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <mat-chip [class.status-draft]="doc()!.status === 'Draft'"
                              [class.status-published]="doc()!.status === 'Published'"
                              [class.status-archived]="doc()!.status === 'Archived'">
                      {{ doc()!.status }}
                    </mat-chip>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.contentType' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.contentType }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.fileSizeBytes' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ formatFileSize(doc()!.fileSizeBytes) }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.currentVersion' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.currentVersion }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'documents.fields.createdAt' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.createdAt | date:'mediumDate' }}</mat-card-content>
                </mat-card>
              </div>
              @if (doc()!.tags) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'documents.fields.tags' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.tags }}</mat-card-content>
                </mat-card>
              }
              @if (doc()!.description) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'documents.fields.description' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ doc()!.description }}</mat-card-content>
                </mat-card>
              }
              @if (doc()!.linkedEntityId) {
                <div class="detail-grid">
                  <mat-card>
                    <mat-card-header><mat-card-title>{{ 'documents.fields.linkedEntityId' | translate }}</mat-card-title></mat-card-header>
                    <mat-card-content>{{ doc()!.linkedEntityId }}</mat-card-content>
                  </mat-card>
                  <mat-card>
                    <mat-card-header><mat-card-title>{{ 'documents.fields.linkedEntityType' | translate }}</mat-card-title></mat-card-header>
                    <mat-card-content>{{ doc()!.linkedEntityType || '-' }}</mat-card-content>
                  </mat-card>
                </div>
              }
            } @else {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateMetadata()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.displayName' | translate }}</mat-label>
                    <input matInput formControlName="displayName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.category' | translate }}</mat-label>
                    <mat-select formControlName="category">
                      @for (cat of categories; track cat) {
                        <mat-option [value]="cat">{{ cat }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.tags' | translate }}</mat-label>
                    <input matInput formControlName="tags" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.linkedEntityId' | translate }}</mat-label>
                    <input matInput formControlName="linkedEntityId" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.linkedEntityType' | translate }}</mat-label>
                    <input matInput formControlName="linkedEntityType" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'documents.fields.description' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-button type="button" (click)="toggleEditMode()">{{ 'common.cancel' | translate }}</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </mat-tab>

        <!-- Versions Tab -->
        <mat-tab [label]="'documents.tabs.versions' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'documents.documents.create'">
              <button mat-stroked-button (click)="toggleVersionForm()">
                <mat-icon>{{ showVersionForm() ? 'close' : 'upload' }}</mat-icon>
                {{ showVersionForm() ? ('common.cancel' | translate) : ('documents.versions.upload' | translate) }}
              </button>
            </div>

            @if (showVersionForm()) {
              <form [formGroup]="versionForm" (ngSubmit)="onUploadVersion()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.storageUrl' | translate }}</mat-label>
                    <input matInput formControlName="storageUrl" />
                    @if (versionForm.controls.storageUrl.hasError('required')) {
                      <mat-error>Storage URL is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.fileSizeBytes' | translate }}</mat-label>
                    <input matInput formControlName="fileSizeBytes" type="number" />
                    @if (versionForm.controls.fileSizeBytes.hasError('required')) {
                      <mat-error>File size is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.contentType' | translate }}</mat-label>
                    <input matInput formControlName="contentType" />
                    @if (versionForm.controls.contentType.hasError('required')) {
                      <mat-error>Content type is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'documents.fields.changeNotes' | translate }}</mat-label>
                    <textarea matInput formControlName="changeNotes" rows="2"></textarea>
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="versionForm.invalid || savingVersion()">
                    @if (savingVersion()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'documents.versions.upload' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            @if (loadingVersions()) {
              <app-loading-spinner></app-loading-spinner>
            } @else if (versions().length === 0) {
              <app-empty-state
                icon="history"
                title="No versions found"
                message="This document has no version history.">
              </app-empty-state>
            } @else {
              <div class="versions-list">
                @for (version of versions(); track version.id) {
                  <mat-card class="version-card">
                    <mat-card-header>
                      <mat-card-title>Version {{ version.versionNumber }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="version-details">
                        <span><strong>Storage:</strong> <a [href]="version.storageUrl" target="_blank">{{ version.storageUrl }}</a></span>
                        <span><strong>Size:</strong> {{ formatFileSize(version.fileSizeBytes) }}</span>
                        <span><strong>Uploaded by:</strong> {{ version.uploadedByName }}</span>
                        <span><strong>Date:</strong> {{ version.createdAt | date:'medium' }}</span>
                        @if (version.changeNotes) {
                          <span><strong>Notes:</strong> {{ version.changeNotes }}</span>
                        }
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <!-- Comments Tab -->
        <mat-tab [label]="'documents.tabs.comments' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'documents.comments.create'">
              <button mat-stroked-button (click)="toggleCommentForm()">
                <mat-icon>{{ showCommentForm() ? 'close' : 'add_comment' }}</mat-icon>
                {{ showCommentForm() ? ('common.cancel' | translate) : ('documents.comments.add' | translate) }}
              </button>
            </div>

            @if (showCommentForm()) {
              <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'documents.fields.content' | translate }}</mat-label>
                    <textarea matInput formControlName="content" rows="3"></textarea>
                    @if (commentForm.controls.content.hasError('required')) {
                      <mat-error>Comment content is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'documents.fields.parentCommentId' | translate }}</mat-label>
                    <input matInput formControlName="parentCommentId" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="commentForm.invalid || savingComment()">
                    @if (savingComment()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            @if (loadingComments()) {
              <app-loading-spinner></app-loading-spinner>
            } @else if (comments().length === 0) {
              <app-empty-state
                icon="comment"
                title="No comments yet"
                message="Be the first to add a comment.">
              </app-empty-state>
            } @else {
              <div class="comments-list">
                @for (comment of topLevelComments(); track comment.id) {
                  <mat-card class="comment-card">
                    <mat-card-header>
                      <mat-card-title>{{ comment.authorName }}</mat-card-title>
                      <mat-card-subtitle>{{ comment.createdAt | date:'medium' }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>{{ comment.content }}</mat-card-content>
                  </mat-card>
                  @for (reply of getReplies(comment.id); track reply.id) {
                    <mat-card class="comment-card reply-card">
                      <mat-card-header>
                        <mat-card-title>{{ reply.authorName }}</mat-card-title>
                        <mat-card-subtitle>{{ reply.createdAt | date:'medium' }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>{{ reply.content }}</mat-card-content>
                    </mat-card>
                  }
                }
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="description"
        title="Document not found"
        message="The requested document could not be found.">
      </app-empty-state>
    }
  `,
  styles: `
    :host { display: block; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tab-content { padding: 1.5rem 0; }
    .narrative-card { margin-bottom: 1rem; }
    .section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .edit-form { margin-bottom: 1.5rem; }
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
      margin-top: 1rem;
    }
    .versions-list, .comments-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .version-card .version-details { display: flex; flex-direction: column; gap: 0.25rem; }
    .version-card .version-details a { color: var(--mat-sys-primary); }
    .comment-card { margin-bottom: 0; }
    .reply-card { margin-left: 2rem; }
    .status-draft { --mdc-chip-elevated-container-color: #e0e0e0; }
    .status-published { --mdc-chip-elevated-container-color: #c8e6c9; }
    .status-archived { --mdc-chip-elevated-container-color: #ffe0b2; }
  `,
})
export default class DocumentDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly doc = this.store.selectSignal(selectSelectedDocument);
  readonly loading = this.store.selectSignal(selectDocumentsLoading);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showVersionForm = signal(false);
  readonly savingVersion = signal(false);
  readonly showCommentForm = signal(false);
  readonly savingComment = signal(false);
  readonly versions = signal<DocumentVersionDto[]>([]);
  readonly loadingVersions = signal(false);
  readonly comments = signal<DocumentCommentDto[]>([]);
  readonly loadingComments = signal(false);

  readonly categories: DocumentCategory[] = ['General', 'Policy', 'Report', 'Contract', 'Template', 'Training', 'Procurement', 'Financial', 'Other'];

  readonly topLevelComments = computed(() =>
    this.comments().filter(c => !c.parentCommentId)
  );

  readonly editForm = this.fb.nonNullable.group({
    displayName: [''],
    description: [''],
    category: ['General'],
    tags: [''],
    linkedEntityId: [''],
    linkedEntityType: [''],
  });

  readonly versionForm = this.fb.nonNullable.group({
    storageUrl: ['', [Validators.required]],
    fileSizeBytes: [0, [Validators.required]],
    contentType: ['', [Validators.required]],
    changeNotes: [''],
  });

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
    parentCommentId: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(DocumentsActions.loadDocument({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1 && this.versions().length === 0) {
      this.loadVersions();
    }
    if (index === 2 && this.comments().length === 0) {
      this.loadComments();
    }
  }

  private loadVersions(): void {
    this.loadingVersions.set(true);
    this.documentService.listVersions(this.id()).subscribe({
      next: (result) => {
        this.versions.set(result);
        this.loadingVersions.set(false);
      },
      error: () => {
        this.loadingVersions.set(false);
      },
    });
  }

  private loadComments(): void {
    this.loadingComments.set(true);
    this.documentService.listComments(this.id()).subscribe({
      next: (result) => {
        this.comments.set(result);
        this.loadingComments.set(false);
      },
      error: () => {
        this.loadingComments.set(false);
      },
    });
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const d = this.doc();
      if (d) {
        this.editForm.patchValue({
          displayName: d.displayName ?? '',
          description: d.description ?? '',
          category: d.category,
          tags: d.tags ?? '',
          linkedEntityId: d.linkedEntityId ?? '',
          linkedEntityType: d.linkedEntityType ?? '',
        });
      }
    }
    this.editing.update(v => !v);
  }

  onUpdateMetadata(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateDocumentMetadataRequest = {
      documentId: this.id(),
      displayName: value.displayName || undefined,
      description: value.description || undefined,
      category: value.category as DocumentCategory,
      tags: value.tags || undefined,
      linkedEntityId: value.linkedEntityId || undefined,
      linkedEntityType: value.linkedEntityType || undefined,
    };
    this.saving.set(true);
    this.documentService.updateMetadata(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Document metadata updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(DocumentsActions.loadDocument({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update document metadata');
        this.saving.set(false);
      },
    });
  }

  toggleVersionForm(): void {
    this.showVersionForm.update(v => !v);
    if (this.showVersionForm()) {
      this.versionForm.reset({ fileSizeBytes: 0 });
    }
  }

  onUploadVersion(): void {
    if (this.versionForm.invalid) return;
    const value = this.versionForm.getRawValue();
    const request: UploadNewVersionRequest = {
      documentId: this.id(),
      storageUrl: value.storageUrl,
      fileSizeBytes: value.fileSizeBytes,
      contentType: value.contentType,
      changeNotes: value.changeNotes || undefined,
    };
    this.savingVersion.set(true);
    this.documentService.uploadNewVersion(this.id(), request).subscribe({
      next: () => {
        this.notification.success('New version uploaded successfully');
        this.showVersionForm.set(false);
        this.versionForm.reset({ fileSizeBytes: 0 });
        this.savingVersion.set(false);
        this.loadVersions();
        this.store.dispatch(DocumentsActions.loadDocument({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to upload new version');
        this.savingVersion.set(false);
      },
    });
  }

  toggleCommentForm(): void {
    this.showCommentForm.update(v => !v);
    if (this.showCommentForm()) {
      this.commentForm.reset();
    }
  }

  onAddComment(): void {
    if (this.commentForm.invalid) return;
    const value = this.commentForm.getRawValue();
    const request: AddDocumentCommentRequest = {
      documentId: this.id(),
      content: value.content,
      parentCommentId: value.parentCommentId || undefined,
    };
    this.savingComment.set(true);
    this.documentService.addComment(this.id(), request).subscribe({
      next: (result) => {
        this.notification.success('Comment added successfully');
        this.comments.update(list => [
          ...list,
          {
            id: result.id,
            documentId: this.id(),
            authorUserId: '',
            authorName: 'You',
            content: value.content,
            parentCommentId: value.parentCommentId || undefined,
            createdAt: new Date().toISOString(),
          },
        ]);
        this.commentForm.reset();
        this.showCommentForm.set(false);
        this.savingComment.set(false);
      },
      error: () => {
        this.notification.error('Failed to add comment');
        this.savingComment.set(false);
      },
    });
  }

  getReplies(parentId: string): DocumentCommentDto[] {
    return this.comments().filter(c => c.parentCommentId === parentId);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

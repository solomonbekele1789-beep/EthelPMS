import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DocumentsActions } from '../../store/documents.actions';
import { selectDocumentsLoading } from '../../store/documents.selectors';
import { DocumentCategory, UploadDocumentRequest } from '../../models/document.model';

@Component({
  selector: 'ethel-document-upload',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'documents.documents.upload' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.fileName' | translate }}</mat-label>
            <input matInput formControlName="fileName" />
            @if (form.controls.fileName.hasError('required')) {
              <mat-error>File name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.contentType' | translate }}</mat-label>
            <input matInput formControlName="contentType" />
            @if (form.controls.contentType.hasError('required')) {
              <mat-error>Content type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.fileSizeBytes' | translate }}</mat-label>
            <input matInput formControlName="fileSizeBytes" type="number" />
            @if (form.controls.fileSizeBytes.hasError('required')) {
              <mat-error>File size is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.storageUrl' | translate }}</mat-label>
            <input matInput formControlName="storageUrl" />
            @if (form.controls.storageUrl.hasError('required')) {
              <mat-error>Storage URL is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.folderId' | translate }}</mat-label>
            <input matInput formControlName="folderId" />
          </mat-form-field>

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
          <button mat-button type="button" (click)="onCancel()">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
            *appHasPermission="'documents.documents.create'">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'documents.documents.upload' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host { display: block; }
    .form-container { max-width: 800px; }
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
      margin-top: 1.5rem;
    }
  `,
})
export default class DocumentUploadComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly actions$ = inject(Actions);

  readonly loading = this.store.selectSignal(selectDocumentsLoading);

  readonly categories: DocumentCategory[] = ['General', 'Policy', 'Report', 'Contract', 'Template', 'Training', 'Procurement', 'Financial', 'Other'];

  readonly form = this.fb.nonNullable.group({
    fileName: ['', [Validators.required]],
    contentType: ['', [Validators.required]],
    fileSizeBytes: [0, [Validators.required]],
    storageUrl: ['', [Validators.required]],
    folderId: [''],
    displayName: [''],
    description: [''],
    category: ['General'],
    tags: [''],
    linkedEntityId: [''],
    linkedEntityType: [''],
  });

  constructor() {
    this.actions$.pipe(
      ofType(DocumentsActions.uploadDocumentSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.router.navigate(['/documents']);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: UploadDocumentRequest = {
      fileName: value.fileName,
      contentType: value.contentType,
      fileSizeBytes: value.fileSizeBytes,
      storageUrl: value.storageUrl,
      folderId: value.folderId || undefined,
      displayName: value.displayName || undefined,
      description: value.description || undefined,
      category: (value.category as DocumentCategory) || undefined,
      tags: value.tags || undefined,
      linkedEntityId: value.linkedEntityId || undefined,
      linkedEntityType: value.linkedEntityType || undefined,
    };
    this.store.dispatch(DocumentsActions.uploadDocument({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/documents']);
  }
}

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent, NotificationService } from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DocumentFolderService } from '../../services/document-folder.service';
import { CreateFolderRequest } from '../../models/folder.model';

@Component({
  selector: 'ethel-folder-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="'documents.folders.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'documents.fields.name' | translate }}</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) {
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
            [disabled]="form.invalid || saving()"
            *appHasPermission="'documents.folders.create'">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | translate }}
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
export default class FolderCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly folderService = inject(DocumentFolderService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    parentFolderId: [''],
    description: [''],
    projectId: [''],
    sortOrder: [0],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CreateFolderRequest = {
      name: value.name,
      parentFolderId: value.parentFolderId || undefined,
      description: value.description || undefined,
      projectId: value.projectId || undefined,
      sortOrder: value.sortOrder || undefined,
    };
    this.saving.set(true);
    this.folderService.createFolder(request).subscribe({
      next: () => {
        this.notification.success('Folder created successfully');
        this.saving.set(false);
        this.router.navigate(['/documents/folders']);
      },
      error: () => {
        this.notification.error('Failed to create folder');
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/documents/folders']);
  }
}

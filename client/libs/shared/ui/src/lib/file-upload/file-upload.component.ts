import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div
      class="upload-zone"
      [class.drag-over]="isDragOver()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
      (click)="fileInput.click()">
      <input #fileInput type="file" hidden
             [accept]="accept"
             [multiple]="multiple"
             (change)="onFileSelected($event)">
      <mat-icon class="upload-icon">cloud_upload</mat-icon>
      <p class="upload-text">Drag & drop files here or click to browse</p>
      @if (accept) {
        <p class="upload-hint">Accepted: {{ accept }}</p>
      }
      @if (maxSize) {
        <p class="upload-hint">Max size: {{ maxSize }}MB</p>
      }
    </div>

    @if (selectedFiles().length > 0) {
      <mat-list class="file-list">
        @for (file of selectedFiles(); track file.name) {
          <mat-list-item>
            <mat-icon matListItemIcon>insert_drive_file</mat-icon>
            <span matListItemTitle>{{ file.name }}</span>
            <span matListItemLine>{{ formatSize(file.size) }}</span>
          </mat-list-item>
        }
      </mat-list>
    }
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed #d1d5db; border-radius: 8px;
      padding: 32px; text-align: center; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: #3b82f6; background: #eff6ff;
    }
    .upload-icon { font-size: 48px; height: 48px; width: 48px; color: #9ca3af; }
    .upload-text { color: #374151; margin: 8px 0 4px; }
    .upload-hint { color: #9ca3af; font-size: 12px; margin: 2px 0; }
    .file-list { margin-top: 8px; }
  `]
})
export class FileUploadComponent {
  @Input() accept = '';
  @Input() maxSize = 10;
  @Input() multiple = false;
  @Output() filesSelected = new EventEmitter<File[]>();

  readonly isDragOver = signal(false);
  readonly selectedFiles = signal<File[]>([]);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private processFiles(files: File[]): void {
    const maxBytes = this.maxSize * 1024 * 1024;
    const valid = files.filter(f => f.size <= maxBytes);
    this.selectedFiles.set(valid);
    this.filesSelected.emit(valid);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

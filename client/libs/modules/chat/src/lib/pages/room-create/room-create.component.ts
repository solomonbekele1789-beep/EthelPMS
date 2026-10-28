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
import { ChatActions } from '../../store/chat.actions';
import { selectChatLoading } from '../../store/chat.selectors';
import { ChatRoomType, CreateChatRoomRequest } from '../../models/chat-room.model';

@Component({
  selector: 'ethel-room-create',
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
    <app-page-header [title]="'chat.rooms.create' | translate"></app-page-header>

    <div class="form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'chat.fields.type' | translate }}</mat-label>
            <mat-select formControlName="type" (selectionChange)="onTypeChange()">
              @for (t of roomTypes; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
            @if (form.controls.type.hasError('required')) {
              <mat-error>Type is required</mat-error>
            }
          </mat-form-field>

          @if (form.controls.type.value !== 'Direct') {
            <mat-form-field appearance="outline">
              <mat-label>{{ 'chat.fields.name' | translate }}</mat-label>
              <input matInput formControlName="name" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
          }

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'chat.fields.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'chat.fields.participantUserIds' | translate }}</mat-label>
            <input matInput formControlName="participantUserIds" placeholder="Enter user IDs separated by commas" />
            <mat-hint>Comma-separated user IDs</mat-hint>
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
            *appHasPermission="'chat.rooms.create'">
            @if (loading()) {
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
export default class RoomCreateComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly actions$ = inject(Actions);

  readonly loading = this.store.selectSignal(selectChatLoading);

  readonly roomTypes: ChatRoomType[] = ['Direct', 'Group', 'Channel'];

  readonly form = this.fb.nonNullable.group({
    type: ['', [Validators.required]],
    name: [''],
    description: [''],
    participantUserIds: [''],
  });

  constructor() {
    this.actions$.pipe(
      ofType(ChatActions.createRoomSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.router.navigate(['/chat']);
    });
  }

  onTypeChange(): void {
    const type = this.form.controls.type.value;
    if (type === 'Direct') {
      this.form.controls.name.clearValidators();
      this.form.controls.name.setValue('');
    } else {
      this.form.controls.name.setValidators([Validators.required]);
    }
    this.form.controls.name.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const participantIds = value.participantUserIds
      ? value.participantUserIds.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0)
      : undefined;
    const request: CreateChatRoomRequest = {
      type: value.type as ChatRoomType,
      name: value.name || undefined,
      description: value.description || undefined,
      participantUserIds: participantIds && participantIds.length > 0 ? participantIds : undefined,
    };
    this.store.dispatch(ChatActions.createRoom({ request }));
  }

  onCancel(): void {
    this.router.navigate(['/chat']);
  }
}

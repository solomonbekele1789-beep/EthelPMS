import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { DonorsActions } from '../../store/donors.actions';
import { selectSelectedDonor, selectDonorsLoading } from '../../store/donors.selectors';
import { DonorService } from '../../services/donor.service';
import { GrantService } from '../../services/grant.service';
import { DonorCommunicationService } from '../../services/donor-communication.service';
import { DonorDto, UpdateDonorRequest, AddDonorContactRequest } from '../../models/donor.model';
import { GrantDto } from '../../models/grant.model';
import { DonorCommunicationDto, RecordCommunicationRequest, CommunicationType } from '../../models/communication.model';

@Component({
  selector: 'ethel-donor-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="donor()?.name ?? ('donors.donors.detail' | translate)">
      @if (donor()) {
        <button mat-stroked-button *appHasPermission="'donors.donors.update'" (click)="toggleEditMode()">
          <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
          {{ editing() ? ('common.cancel' | translate) : ('common.edit' | translate) }}
        </button>
      }
    </app-page-header>

    @if (loading() && !donor()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (donor()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Overview Tab -->
        <mat-tab [label]="'donors.tabs.overview' | translate">
          <div class="tab-content">
            @if (!editing()) {
              <div class="detail-grid">
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.name' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.name }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.acronym' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.acronym || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.country' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.country || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.website' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.website || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.email' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.email || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.phone' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.phone || '-' }}</mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.status' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <mat-chip [highlighted]="donor()!.isActive">
                      {{ donor()!.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>{{ 'donors.fields.grantCount' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.grantCount }}</mat-card-content>
                </mat-card>
              </div>
              @if (donor()!.address) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'donors.fields.address' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.address }}</mat-card-content>
                </mat-card>
              }
              @if (donor()!.notes) {
                <mat-card class="narrative-card">
                  <mat-card-header><mat-card-title>{{ 'donors.fields.notes' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>{{ donor()!.notes }}</mat-card-content>
                </mat-card>
              }
            } @else {
              <form [formGroup]="editForm" (ngSubmit)="onUpdateDonor()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.name' | translate }}</mat-label>
                    <input matInput formControlName="name" />
                    @if (editForm.controls.name.hasError('required')) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.acronym' | translate }}</mat-label>
                    <input matInput formControlName="acronym" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.country' | translate }}</mat-label>
                    <input matInput formControlName="country" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.website' | translate }}</mat-label>
                    <input matInput formControlName="website" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.email' | translate }}</mat-label>
                    <input matInput formControlName="email" type="email" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.phone' | translate }}</mat-label>
                    <input matInput formControlName="phone" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'donors.fields.address' | translate }}</mat-label>
                    <textarea matInput formControlName="address" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'donors.fields.notes' | translate }}</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
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

        <!-- Contacts Tab -->
        <mat-tab [label]="'donors.tabs.contacts' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'donors.donors.update'">
              <button mat-stroked-button (click)="toggleContactForm()">
                <mat-icon>{{ showContactForm() ? 'close' : 'person_add' }}</mat-icon>
                {{ showContactForm() ? ('common.cancel' | translate) : ('donors.contacts.add' | translate) }}
              </button>
            </div>

            @if (showContactForm()) {
              <form [formGroup]="contactForm" (ngSubmit)="onAddContact()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.fullName' | translate }}</mat-label>
                    <input matInput formControlName="fullName" />
                    @if (contactForm.controls.fullName.hasError('required')) {
                      <mat-error>Full name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.email' | translate }}</mat-label>
                    <input matInput formControlName="email" type="email" />
                    @if (contactForm.controls.email.hasError('required')) {
                      <mat-error>Email is required</mat-error>
                    } @else if (contactForm.controls.email.hasError('email')) {
                      <mat-error>Invalid email</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.title' | translate }}</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.phone' | translate }}</mat-label>
                    <input matInput formControlName="phone" />
                  </mat-form-field>
                  <mat-checkbox formControlName="isPrimary">{{ 'donors.fields.isPrimary' | translate }}</mat-checkbox>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="contactForm.invalid || savingContact()">
                    @if (savingContact()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.add' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="contactColumns()"
              [data]="donor()!.contacts"
              [loading]="false"
              emptyTitle="No contacts found"
              emptyMessage="Add a contact for this donor.">
            </app-data-table>
          </div>

          <ng-template #primaryTpl let-row>
            <mat-chip [highlighted]="row.isPrimary">
              {{ row.isPrimary ? 'Primary' : 'Secondary' }}
            </mat-chip>
          </ng-template>
        </mat-tab>

        <!-- Grants Tab -->
        <mat-tab [label]="'donors.tabs.grants' | translate">
          <div class="tab-content">
            <div class="section-header">
              <button mat-flat-button color="primary" *appHasPermission="'donors.grants.create'" (click)="onCreateGrant()">
                <mat-icon>add</mat-icon>
                {{ 'donors.grants.create' | translate }}
              </button>
            </div>

            <app-data-table
              [columns]="grantColumns()"
              [data]="grants()"
              [loading]="loadingGrants()"
              emptyTitle="No grants found"
              emptyMessage="Create a grant for this donor."
              (rowClick)="onGrantRowClick($event)">
            </app-data-table>
          </div>

          <ng-template #grantStatusTpl let-row>
            <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
          </ng-template>

          <ng-template #grantAmountTpl let-row>
            {{ row.totalAmount | currency:row.currencyCode:'symbol':'1.0-0' }}
          </ng-template>

          <ng-template #complianceTpl let-row>
            <mat-chip [class.compliance-green]="row.complianceStatus === 'Green'"
                      [class.compliance-amber]="row.complianceStatus === 'Amber'"
                      [class.compliance-red]="row.complianceStatus === 'Red'">
              {{ row.complianceStatus }}
            </mat-chip>
          </ng-template>
        </mat-tab>

        <!-- Communications Tab -->
        <mat-tab [label]="'donors.tabs.communications' | translate">
          <div class="tab-content">
            <div class="section-header" *appHasPermission="'donors.communications.create'">
              <button mat-stroked-button (click)="toggleCommunicationForm()">
                <mat-icon>{{ showCommunicationForm() ? 'close' : 'chat' }}</mat-icon>
                {{ showCommunicationForm() ? ('common.cancel' | translate) : ('donors.communications.record' | translate) }}
              </button>
            </div>

            @if (showCommunicationForm()) {
              <form [formGroup]="communicationForm" (ngSubmit)="onRecordCommunication()" class="edit-form">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.type' | translate }}</mat-label>
                    <mat-select formControlName="type">
                      @for (t of communicationTypes; track t) {
                        <mat-option [value]="t">{{ t }}</mat-option>
                      }
                    </mat-select>
                    @if (communicationForm.controls.type.hasError('required')) {
                      <mat-error>Type is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.subject' | translate }}</mat-label>
                    <input matInput formControlName="subject" />
                    @if (communicationForm.controls.subject.hasError('required')) {
                      <mat-error>Subject is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.communicationDate' | translate }}</mat-label>
                    <input matInput formControlName="communicationDate" type="date" />
                    @if (communicationForm.controls.communicationDate.hasError('required')) {
                      <mat-error>Date is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.contactedBy' | translate }}</mat-label>
                    <input matInput formControlName="contactedBy" />
                    @if (communicationForm.controls.contactedBy.hasError('required')) {
                      <mat-error>Contacted by is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'donors.fields.content' | translate }}</mat-label>
                    <textarea matInput formControlName="content" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.outcome' | translate }}</mat-label>
                    <input matInput formControlName="outcome" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'donors.fields.grantId' | translate }}</mat-label>
                    <input matInput formControlName="grantId" />
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="communicationForm.invalid || savingCommunication()">
                    @if (savingCommunication()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      {{ 'common.save' | translate }}
                    }
                  </button>
                </div>
              </form>
            }

            <app-data-table
              [columns]="communicationColumns()"
              [data]="communications()"
              [loading]="loadingCommunications()"
              emptyTitle="No communications found"
              emptyMessage="Record a communication with this donor.">
            </app-data-table>
          </div>

          <ng-template #commTypeTpl let-row>
            <mat-chip>{{ row.type }}</mat-chip>
          </ng-template>

          <ng-template #commDateTpl let-row>
            {{ row.communicationDate | date:'mediumDate' }}
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    } @else {
      <app-empty-state
        icon="business"
        title="Donor not found"
        message="The requested donor could not be found.">
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
    .compliance-green { --mdc-chip-elevated-container-color: #c8e6c9; }
    .compliance-amber { --mdc-chip-elevated-container-color: #ffe0b2; }
    .compliance-red { --mdc-chip-elevated-container-color: #ffcdd2; }
  `,
})
export default class DonorDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly donorService = inject(DonorService);
  private readonly grantService = inject(GrantService);
  private readonly communicationService = inject(DonorCommunicationService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly donor = this.store.selectSignal(selectSelectedDonor);
  readonly loading = this.store.selectSignal(selectDonorsLoading);

  readonly activeTab = signal(0);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly showContactForm = signal(false);
  readonly savingContact = signal(false);
  readonly showCommunicationForm = signal(false);
  readonly savingCommunication = signal(false);
  readonly grants = signal<GrantDto[]>([]);
  readonly loadingGrants = signal(false);
  readonly communications = signal<DonorCommunicationDto[]>([]);
  readonly loadingCommunications = signal(false);

  readonly communicationTypes: CommunicationType[] = ['Email', 'Meeting', 'PhoneCall', 'Letter', 'Report', 'Other'];

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    acronym: [''],
    country: [''],
    website: [''],
    email: [''],
    phone: [''],
    address: [''],
    notes: [''],
  });

  readonly contactForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    title: [''],
    phone: [''],
    isPrimary: [false],
  });

  readonly communicationForm = this.fb.nonNullable.group({
    type: ['', [Validators.required]],
    subject: ['', [Validators.required]],
    communicationDate: ['', [Validators.required]],
    contactedBy: ['', [Validators.required]],
    content: [''],
    outcome: [''],
    grantId: [''],
  });

  readonly primaryTpl = viewChild<TemplateRef<unknown>>('primaryTpl');
  readonly grantStatusTpl = viewChild<TemplateRef<unknown>>('grantStatusTpl');
  readonly grantAmountTpl = viewChild<TemplateRef<unknown>>('grantAmountTpl');
  readonly complianceTpl = viewChild<TemplateRef<unknown>>('complianceTpl');
  readonly commTypeTpl = viewChild<TemplateRef<unknown>>('commTypeTpl');
  readonly commDateTpl = viewChild<TemplateRef<unknown>>('commDateTpl');

  readonly contactColumns = computed<TableColumn[]>(() => [
    { key: 'fullName', label: 'Full Name' },
    { key: 'title', label: 'Title' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'isPrimary', label: 'Primary', template: this.primaryTpl() },
  ]);

  readonly grantColumns = computed<TableColumn[]>(() => [
    { key: 'grantNumber', label: 'Grant Number' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', template: this.grantStatusTpl() },
    { key: 'totalAmount', label: 'Amount', template: this.grantAmountTpl() },
    { key: 'complianceStatus', label: 'Compliance', template: this.complianceTpl() },
  ]);

  readonly communicationColumns = computed<TableColumn[]>(() => [
    { key: 'type', label: 'Type', template: this.commTypeTpl() },
    { key: 'subject', label: 'Subject' },
    { key: 'communicationDate', label: 'Date', template: this.commDateTpl() },
    { key: 'contactedBy', label: 'Contacted By' },
    { key: 'outcome', label: 'Outcome' },
  ]);

  ngOnInit(): void {
    this.store.dispatch(DonorsActions.loadDonor({ id: this.id() }));
    this.loadGrants();
  }

  private loadGrants(): void {
    this.loadingGrants.set(true);
    this.grantService.listGrants({ donorId: this.id() }).subscribe({
      next: (result) => {
        this.grants.set(result.items);
        this.loadingGrants.set(false);
      },
      error: () => {
        this.loadingGrants.set(false);
      },
    });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }

  toggleEditMode(): void {
    if (!this.editing()) {
      const d = this.donor();
      if (d) {
        this.editForm.patchValue({
          name: d.name,
          acronym: d.acronym ?? '',
          country: d.country ?? '',
          website: d.website ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          address: d.address ?? '',
          notes: d.notes ?? '',
        });
      }
    }
    this.editing.update(v => !v);
  }

  onUpdateDonor(): void {
    if (this.editForm.invalid) return;
    const value = this.editForm.getRawValue();
    const request: UpdateDonorRequest = {
      id: this.id(),
      name: value.name,
      acronym: value.acronym || undefined,
      country: value.country || undefined,
      website: value.website || undefined,
      email: value.email || undefined,
      phone: value.phone || undefined,
      address: value.address || undefined,
      notes: value.notes || undefined,
    };
    this.saving.set(true);
    this.donorService.updateDonor(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Donor updated successfully');
        this.editing.set(false);
        this.saving.set(false);
        this.store.dispatch(DonorsActions.loadDonor({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to update donor');
        this.saving.set(false);
      },
    });
  }

  toggleContactForm(): void {
    this.showContactForm.update(v => !v);
    if (this.showContactForm()) {
      this.contactForm.reset({ isPrimary: false });
    }
  }

  onAddContact(): void {
    if (this.contactForm.invalid) return;
    const value = this.contactForm.getRawValue();
    const request: AddDonorContactRequest = {
      donorId: this.id(),
      fullName: value.fullName,
      email: value.email,
      title: value.title || undefined,
      phone: value.phone || undefined,
      isPrimary: value.isPrimary,
    };
    this.savingContact.set(true);
    this.donorService.addContact(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Contact added successfully');
        this.showContactForm.set(false);
        this.contactForm.reset({ isPrimary: false });
        this.savingContact.set(false);
        this.store.dispatch(DonorsActions.loadDonor({ id: this.id() }));
      },
      error: () => {
        this.notification.error('Failed to add contact');
        this.savingContact.set(false);
      },
    });
  }

  onCreateGrant(): void {
    this.router.navigate(['/donors/grants/create'], {
      queryParams: { donorId: this.id() },
    });
  }

  onGrantRowClick(row: any): void {
    this.router.navigate(['/donors/grants', row.id]);
  }

  toggleCommunicationForm(): void {
    this.showCommunicationForm.update(v => !v);
    if (this.showCommunicationForm()) {
      this.communicationForm.reset();
    }
  }

  onRecordCommunication(): void {
    if (this.communicationForm.invalid) return;
    const value = this.communicationForm.getRawValue();
    const request: RecordCommunicationRequest = {
      donorId: this.id(),
      type: value.type as CommunicationType,
      subject: value.subject,
      communicationDate: value.communicationDate,
      contactedBy: value.contactedBy,
      content: value.content || undefined,
      outcome: value.outcome || undefined,
      grantId: value.grantId || undefined,
    };
    this.savingCommunication.set(true);
    this.communicationService.recordCommunication(request).subscribe({
      next: (result) => {
        this.notification.success('Communication recorded successfully');
        this.communications.update(list => [
          ...list,
          {
            id: result.id,
            donorId: this.id(),
            grantId: value.grantId || null,
            type: value.type as CommunicationType,
            subject: value.subject,
            content: value.content || null,
            communicationDate: value.communicationDate,
            contactedBy: value.contactedBy,
            outcome: value.outcome || null,
          },
        ]);
        this.communicationForm.reset();
        this.showCommunicationForm.set(false);
        this.savingCommunication.set(false);
      },
      error: () => {
        this.notification.error('Failed to record communication');
        this.savingCommunication.set(false);
      },
    });
  }
}

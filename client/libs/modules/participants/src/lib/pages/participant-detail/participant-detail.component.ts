import { Component, inject, OnInit, signal, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  NotificationService,
} from '@ethelpms/shared/ui';
import { HasPermissionDirective } from '@ethelpms/shared/core';
import { ParticipantsActions } from '../../store/participants.actions';
import { selectSelectedParticipant, selectParticipantsLoading } from '../../store/participants.selectors';
import { ParticipantService } from '../../services/participant.service';
import {
  ParticipantDto,
  UpdateParticipantRequest,
  UpdateAddressRequest,
  EnrollParticipantRequest,
  ExitEnrollmentRequest,
  Gender,
} from '../../models/participant.model';
import { HouseholdMemberDto, AddHouseholdMemberRequest } from '../../models/household.model';
import { ParticipantServiceDto, RecordServiceRequest } from '../../models/service.model';

@Component({
  selector: 'ethel-participant-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatChipsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header [title]="participant()?.fullName ?? ('participants.detail.title' | translate)">
      @if (participant()) {
        <app-status-badge [status]="participant()!.status" [label]="participant()!.status"></app-status-badge>
      }
    </app-page-header>

    @if (loading() && !participant()) {
      <app-loading-spinner></app-loading-spinner>
    } @else if (participant()) {
      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="onTabChange($event)">
        <!-- Profile Tab -->
        <mat-tab [label]="'participants.detail.profile' | translate">
          <div class="tab-content">
            <div class="detail-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.fullName' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.fullName }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.code' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.participantCode }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.gender' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.gender }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.dateOfBirth' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.dateOfBirth ? (participant()!.dateOfBirth | date:'mediumDate') : '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.phone' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.phone || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.email' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.email || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'common.status' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <app-status-badge [status]="participant()!.status" [label]="participant()!.status"></app-status-badge>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'common.created' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.registrationDate | date:'mediumDate' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.vulnerabilityScore' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.vulnerabilityScore ?? '-' }}</mat-card-content>
              </mat-card>
            </div>

            <!-- Address Section -->
            <h3>{{ 'participants.detail.address' | translate }}</h3>
            <div class="detail-grid">
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.region' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.region || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.zone' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.zone || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.woreda' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.woreda || '-' }}</mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>{{ 'participants.fields.kebele' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>{{ participant()!.kebele || '-' }}</mat-card-content>
              </mat-card>
            </div>

            <div class="action-buttons">
              <button mat-stroked-button *appHasPermission="'participants.profiles.update'" (click)="showEditProfile.set(!showEditProfile())">
                <mat-icon>edit</mat-icon>
                {{ 'participants.actions.editProfile' | translate }}
              </button>
              <button mat-stroked-button *appHasPermission="'participants.profiles.update'" (click)="showEditAddress.set(!showEditAddress())">
                <mat-icon>location_on</mat-icon>
                {{ 'participants.actions.editAddress' | translate }}
              </button>
              <button mat-button (click)="goBack()">
                {{ 'common.back' | translate }}
              </button>
            </div>

            <!-- Edit Profile Form -->
            @if (showEditProfile()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'participants.actions.editProfile' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.firstName' | translate }}</mat-label>
                        <input matInput formControlName="firstName" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.lastName' | translate }}</mat-label>
                        <input matInput formControlName="lastName" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.middleName' | translate }}</mat-label>
                        <input matInput formControlName="middleName" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.gender' | translate }}</mat-label>
                        <mat-select formControlName="gender">
                          @for (g of genderOptions; track g) {
                            <mat-option [value]="g">{{ g }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.dateOfBirth' | translate }}</mat-label>
                        <input matInput [matDatepicker]="editDobPicker" formControlName="dateOfBirth" />
                        <mat-datepicker-toggle matIconSuffix [for]="editDobPicker"></mat-datepicker-toggle>
                        <mat-datepicker #editDobPicker></mat-datepicker>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.phone' | translate }}</mat-label>
                        <input matInput formControlName="phone" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.email' | translate }}</mat-label>
                        <input matInput formControlName="email" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.idNumber' | translate }}</mat-label>
                        <input matInput formControlName="idNumber" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showEditProfile.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid">{{ 'common.save' | translate }}</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <!-- Edit Address Form -->
            @if (showEditAddress()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'participants.actions.editAddress' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="addressForm" (ngSubmit)="onUpdateAddress()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.region' | translate }}</mat-label>
                        <input matInput formControlName="region" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.zone' | translate }}</mat-label>
                        <input matInput formControlName="zone" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.woreda' | translate }}</mat-label>
                        <input matInput formControlName="woreda" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.kebele' | translate }}</mat-label>
                        <input matInput formControlName="kebele" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showEditAddress.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit">{{ 'common.save' | translate }}</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Enrollments Tab -->
        <mat-tab [label]="'participants.detail.enrollments' | translate">
          <div class="tab-content">
            @if (participant()!.enrollments.length > 0) {
              <table mat-table [dataSource]="participant()!.enrollments" class="full-width-table">
                <ng-container matColumnDef="projectId">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.projectId' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.projectId }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
                  <td mat-cell *matCellDef="let row">
                    <app-status-badge [status]="row.status" [label]="row.status"></app-status-badge>
                  </td>
                </ng-container>
                <ng-container matColumnDef="enrollmentDate">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.enrollmentDate' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.enrollmentDate | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="exitDate">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.exitDate' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.exitDate ? (row.exitDate | date:'mediumDate') : '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="exitReason">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.exitReason' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.exitReason || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="cohortName">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.cohortName' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.cohortName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.status === 'Enrolled') {
                      <button mat-icon-button color="warn" *appHasPermission="'participants.profiles.update'"
                        (click)="onStartExit(row)">
                        <mat-icon>exit_to_app</mat-icon>
                      </button>
                    }
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="enrollmentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: enrollmentColumns;"></tr>
              </table>
            } @else {
              <app-empty-state icon="assignment" title="No enrollments" message="This participant is not enrolled in any projects."></app-empty-state>
            }

            <!-- Exit Reason Input -->
            @if (exitingEnrollmentId()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'participants.actions.exitEnrollment' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'participants.fields.exitReason' | translate }}</mat-label>
                    <input matInput [(ngModel)]="exitReason" [ngModelOptions]="{standalone: true}" />
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-button (click)="exitingEnrollmentId.set(null)">{{ 'common.cancel' | translate }}</button>
                    <button mat-flat-button color="warn" (click)="onExitEnrollment()">{{ 'participants.actions.confirmExit' | translate }}</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            <div class="add-section" *appHasPermission="'participants.profiles.update'">
              <button mat-flat-button color="primary" (click)="showEnrollForm.set(!showEnrollForm())">
                <mat-icon>add</mat-icon>
                {{ 'participants.actions.enroll' | translate }}
              </button>
            </div>

            @if (showEnrollForm()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'participants.actions.enroll' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="enrollForm" (ngSubmit)="onEnroll()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
                        <input matInput formControlName="projectId" />
                        @if (enrollForm.controls.projectId.hasError('required')) {
                          <mat-error>Project ID is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.cohortName' | translate }}</mat-label>
                        <input matInput formControlName="cohortName" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showEnrollForm.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="enrollForm.invalid">{{ 'common.save' | translate }}</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Services Tab -->
        <mat-tab [label]="'participants.detail.services' | translate">
          <div class="tab-content">
            @if (services().length > 0) {
              <table mat-table [dataSource]="services()" class="full-width-table">
                <ng-container matColumnDef="serviceName">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.serviceName' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.serviceName }}</td>
                </ng-container>
                <ng-container matColumnDef="serviceDate">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.serviceDate' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.serviceDate | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.quantity' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.quantity ?? '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.unit' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.unit || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.description' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.description || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="notes">
                  <th mat-header-cell *matHeaderCellDef>{{ 'participants.fields.notes' | translate }}</th>
                  <td mat-cell *matCellDef="let row">{{ row.notes || '-' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="serviceColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: serviceColumns;"></tr>
              </table>
            } @else {
              <app-empty-state icon="volunteer_activism" title="No services recorded" message="Record services provided to this participant."></app-empty-state>
            }

            <div class="add-section" *appHasPermission="'participants.profiles.update'">
              <button mat-flat-button color="primary" (click)="showServiceForm.set(!showServiceForm())">
                <mat-icon>add</mat-icon>
                {{ 'participants.actions.recordService' | translate }}
              </button>
            </div>

            @if (showServiceForm()) {
              <mat-card class="inline-form-card">
                <mat-card-header><mat-card-title>{{ 'participants.actions.recordService' | translate }}</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="serviceForm" (ngSubmit)="onRecordService()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.serviceName' | translate }}</mat-label>
                        <input matInput formControlName="serviceName" />
                        @if (serviceForm.controls.serviceName.hasError('required')) {
                          <mat-error>Service name is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.projectId' | translate }}</mat-label>
                        <input matInput formControlName="projectId" />
                        @if (serviceForm.controls.projectId.hasError('required')) {
                          <mat-error>Project ID is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.serviceDate' | translate }}</mat-label>
                        <input matInput [matDatepicker]="svcDatePicker" formControlName="serviceDate" />
                        <mat-datepicker-toggle matIconSuffix [for]="svcDatePicker"></mat-datepicker-toggle>
                        <mat-datepicker #svcDatePicker></mat-datepicker>
                        @if (serviceForm.controls.serviceDate.hasError('required')) {
                          <mat-error>Service date is required</mat-error>
                        }
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.description' | translate }}</mat-label>
                        <input matInput formControlName="description" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.quantity' | translate }}</mat-label>
                        <input matInput formControlName="quantity" type="number" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>{{ 'participants.fields.unit' | translate }}</mat-label>
                        <input matInput formControlName="unit" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-button type="button" (click)="showServiceForm.set(false)">{{ 'common.cancel' | translate }}</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="serviceForm.invalid">{{ 'common.save' | translate }}</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Household Tab -->
        <mat-tab [label]="'participants.detail.household' | translate">
          <div class="tab-content">
            @if (!participant()!.householdId) {
              <app-empty-state icon="family_restroom" title="No household" message="This participant is not associated with a household."></app-empty-state>
            } @else {
              @if (householdMembers().length > 0) {
                <mat-list>
                  @for (member of householdMembers(); track member.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>person</mat-icon>
                      <span matListItemTitle>
                        {{ member.participantId }}
                        @if (member.isHeadOfHousehold) {
                          <mat-chip highlighted>{{ 'participants.fields.headOfHousehold' | translate }}</mat-chip>
                        }
                      </span>
                      <span matListItemLine>
                        {{ 'participants.fields.relationship' | translate }}: {{ member.relationshipToHead || '-' }}
                        | {{ 'participants.fields.householdSize' | translate }}: {{ member.householdSize ?? '-' }}
                      </span>
                    </mat-list-item>
                  }
                </mat-list>
              } @else {
                <app-empty-state icon="group" title="No members" message="No household members found."></app-empty-state>
              }

              <div class="add-section" *appHasPermission="'participants.profiles.update'">
                <button mat-flat-button color="primary" (click)="showHouseholdForm.set(!showHouseholdForm())">
                  <mat-icon>person_add</mat-icon>
                  {{ 'participants.actions.addMember' | translate }}
                </button>
              </div>

              @if (showHouseholdForm()) {
                <mat-card class="inline-form-card">
                  <mat-card-header><mat-card-title>{{ 'participants.actions.addMember' | translate }}</mat-card-title></mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="householdForm" (ngSubmit)="onAddHouseholdMember()">
                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'participants.fields.householdCode' | translate }}</mat-label>
                          <input matInput formControlName="householdCode" />
                          @if (householdForm.controls.householdCode.hasError('required')) {
                            <mat-error>Household code is required</mat-error>
                          }
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'participants.fields.relationship' | translate }}</mat-label>
                          <input matInput formControlName="relationshipToHead" />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>{{ 'participants.fields.householdSize' | translate }}</mat-label>
                          <input matInput formControlName="householdSize" type="number" />
                        </mat-form-field>
                        <mat-checkbox formControlName="isHeadOfHousehold">
                          {{ 'participants.fields.headOfHousehold' | translate }}
                        </mat-checkbox>
                      </div>
                      <div class="form-actions">
                        <button mat-button type="button" (click)="showHouseholdForm.set(false)">{{ 'common.cancel' | translate }}</button>
                        <button mat-flat-button color="primary" type="submit" [disabled]="householdForm.invalid">{{ 'common.save' | translate }}</button>
                      </div>
                    </form>
                  </mat-card-content>
                </mat-card>
              }
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    :host { display: block; }
    .tab-content { padding: 1.5rem 0; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    h3 { margin: 1.5rem 0 0.75rem; }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .inline-form-card { margin-top: 1.5rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .full-width { width: 100%; }
    .full-width-table { width: 100%; }
    .add-section { margin-top: 1.5rem; }
  `,
})
export default class ParticipantDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly participantService = inject(ParticipantService);
  private readonly notification = inject(NotificationService);

  readonly id = input.required<string>();

  readonly participant = this.store.selectSignal(selectSelectedParticipant);
  readonly loading = this.store.selectSignal(selectParticipantsLoading);

  readonly activeTab = signal(0);
  readonly genderOptions: Gender[] = ['Male', 'Female', 'Other'];

  // Toggle signals for inline forms
  readonly showEditProfile = signal(false);
  readonly showEditAddress = signal(false);
  readonly showEnrollForm = signal(false);
  readonly showServiceForm = signal(false);
  readonly showHouseholdForm = signal(false);
  readonly exitingEnrollmentId = signal<string | null>(null);
  exitReason = '';

  // Tab data loaded directly
  readonly services = signal<ParticipantServiceDto[]>([]);
  readonly householdMembers = signal<HouseholdMemberDto[]>([]);

  // Table columns
  readonly enrollmentColumns = ['projectId', 'status', 'enrollmentDate', 'exitDate', 'exitReason', 'cohortName', 'actions'];
  readonly serviceColumns = ['serviceName', 'serviceDate', 'quantity', 'unit', 'description', 'notes'];

  // Forms
  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    middleName: [''],
    gender: ['', [Validators.required]],
    dateOfBirth: [''],
    phone: [''],
    email: [''],
    idNumber: [''],
  });

  readonly addressForm = this.fb.nonNullable.group({
    region: [''],
    zone: [''],
    woreda: [''],
    kebele: [''],
  });

  readonly enrollForm = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    cohortName: [''],
  });

  readonly serviceForm = this.fb.nonNullable.group({
    serviceName: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    serviceDate: ['', [Validators.required]],
    description: [''],
    quantity: [null as number | null],
    unit: [''],
  });

  readonly householdForm = this.fb.nonNullable.group({
    householdCode: ['', [Validators.required]],
    isHeadOfHousehold: [false],
    relationshipToHead: [''],
    householdSize: [null as number | null],
  });

  constructor() {
    effect(() => {
      const p = this.participant();
      if (p) {
        this.profileForm.patchValue({
          firstName: p.firstName,
          lastName: p.lastName,
          middleName: p.middleName ?? '',
          gender: p.gender,
          dateOfBirth: p.dateOfBirth ?? '',
          phone: p.phone ?? '',
          email: p.email ?? '',
          idNumber: p.idNumber ?? '',
        });
        this.addressForm.patchValue({
          region: p.region ?? '',
          zone: p.zone ?? '',
          woreda: p.woreda ?? '',
          kebele: p.kebele ?? '',
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ParticipantsActions.loadParticipant({ id: this.id() }));
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 2) {
      this.loadServices();
    } else if (index === 3) {
      this.loadHousehold();
    }
  }

  // --- Profile ---
  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    const value = this.profileForm.getRawValue();
    const request: UpdateParticipantRequest = {
      participantId: this.id(),
      firstName: value.firstName,
      lastName: value.lastName,
      gender: value.gender as Gender,
      middleName: value.middleName || undefined,
      dateOfBirth: value.dateOfBirth || undefined,
      phone: value.phone || undefined,
      email: value.email || undefined,
      idNumber: value.idNumber || undefined,
    };
    this.participantService.updateParticipant(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Profile updated successfully');
        this.showEditProfile.set(false);
        this.store.dispatch(ParticipantsActions.loadParticipant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update profile'),
    });
  }

  onUpdateAddress(): void {
    const value = this.addressForm.getRawValue();
    const request: UpdateAddressRequest = {
      participantId: this.id(),
      region: value.region || undefined,
      zone: value.zone || undefined,
      woreda: value.woreda || undefined,
      kebele: value.kebele || undefined,
    };
    this.participantService.updateAddress(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Address updated successfully');
        this.showEditAddress.set(false);
        this.store.dispatch(ParticipantsActions.loadParticipant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to update address'),
    });
  }

  // --- Enrollments ---
  onEnroll(): void {
    if (this.enrollForm.invalid) return;
    const value = this.enrollForm.getRawValue();
    const request: EnrollParticipantRequest = {
      participantId: this.id(),
      projectId: value.projectId,
      cohortName: value.cohortName || undefined,
    };
    this.participantService.enrollParticipant(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Participant enrolled successfully');
        this.showEnrollForm.set(false);
        this.enrollForm.reset();
        this.store.dispatch(ParticipantsActions.loadParticipant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to enroll participant'),
    });
  }

  onStartExit(row: any): void {
    this.exitingEnrollmentId.set(row.id);
    this.exitReason = '';
  }

  onExitEnrollment(): void {
    const enrollmentId = this.exitingEnrollmentId();
    if (!enrollmentId) return;
    const request: ExitEnrollmentRequest = {
      enrollmentId,
      reason: this.exitReason,
    };
    this.participantService.exitEnrollment(enrollmentId, request).subscribe({
      next: () => {
        this.notification.success('Enrollment exited successfully');
        this.exitingEnrollmentId.set(null);
        this.store.dispatch(ParticipantsActions.loadParticipant({ id: this.id() }));
      },
      error: () => this.notification.error('Failed to exit enrollment'),
    });
  }

  // --- Services ---
  loadServices(): void {
    this.participantService.listServices(this.id()).subscribe({
      next: (data) => this.services.set(data),
      error: () => this.notification.error('Failed to load services'),
    });
  }

  onRecordService(): void {
    if (this.serviceForm.invalid) return;
    const value = this.serviceForm.getRawValue();
    const request: RecordServiceRequest = {
      participantId: this.id(),
      projectId: value.projectId,
      serviceName: value.serviceName,
      serviceDate: value.serviceDate,
      description: value.description || undefined,
      quantity: value.quantity ?? undefined,
      unit: value.unit || undefined,
    };
    this.participantService.recordService(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Service recorded successfully');
        this.showServiceForm.set(false);
        this.serviceForm.reset();
        this.loadServices();
      },
      error: () => this.notification.error('Failed to record service'),
    });
  }

  // --- Household ---
  loadHousehold(): void {
    const p = this.participant();
    if (!p?.householdId) return;
    this.participantService.listHouseholdMembers(p.householdId).subscribe({
      next: (data) => this.householdMembers.set(data),
      error: () => this.notification.error('Failed to load household members'),
    });
  }

  onAddHouseholdMember(): void {
    if (this.householdForm.invalid) return;
    const value = this.householdForm.getRawValue();
    const request: AddHouseholdMemberRequest = {
      householdCode: value.householdCode,
      participantId: this.id(),
      isHeadOfHousehold: value.isHeadOfHousehold,
      relationshipToHead: value.relationshipToHead || undefined,
      householdSize: value.householdSize ?? undefined,
    };
    this.participantService.addHouseholdMember(this.id(), request).subscribe({
      next: () => {
        this.notification.success('Household member added successfully');
        this.showHouseholdForm.set(false);
        this.householdForm.reset();
        this.loadHousehold();
      },
      error: () => this.notification.error('Failed to add household member'),
    });
  }

  goBack(): void {
    this.router.navigate(['/participants']);
  }
}

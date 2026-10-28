import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@ethelpms/shared/core';
import { PartnershipDashboardDto } from '../models/partnership-dashboard.model';

@Injectable({ providedIn: 'root' })
export class PartnershipDashboardService {
  private readonly api = inject(ApiService);

  getDashboard(): Observable<PartnershipDashboardDto> {
    return this.api.get<PartnershipDashboardDto>('/partnerships/dashboard');
  }
}

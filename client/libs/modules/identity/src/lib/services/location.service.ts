import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { LocationDto } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiService);

  getRegions(): Observable<LocationDto[]> {
    return this.api.get<LocationDto[]>('/locations/regions');
  }

  getZones(regionId: string): Observable<LocationDto[]> {
    return this.api.get<LocationDto[]>(`/locations/regions/${regionId}/zones`);
  }

  getWoredas(zoneId: string): Observable<LocationDto[]> {
    return this.api.get<LocationDto[]>(`/locations/zones/${zoneId}/woredas`);
  }

  getKebeles(woredaId: string): Observable<LocationDto[]> {
    return this.api.get<LocationDto[]>(`/locations/woredas/${woredaId}/kebeles`);
  }
}

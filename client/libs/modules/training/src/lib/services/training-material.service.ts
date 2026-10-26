import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@ethelpms/shared/core';

import { AddTrainingMaterialRequest } from '../models/training-material.model';

@Injectable({ providedIn: 'root' })
export class TrainingMaterialService {
  private readonly api = inject(ApiService);

  addMaterial(request: AddTrainingMaterialRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/training-materials', request);
  }
}

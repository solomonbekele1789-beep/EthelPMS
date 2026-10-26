import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService, PagedResult } from '@ethelpms/shared/core';

import {
  TrainerDto,
  CreateTrainerRequest,
} from '../models/trainer.model';

@Injectable({ providedIn: 'root' })
export class TrainerService {
  private readonly api = inject(ApiService);

  listTrainers(params: {
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<TrainerDto>> {
    let httpParams = new HttpParams();

    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.api.get<PagedResult<TrainerDto>>('/trainers', httpParams);
  }

  createTrainer(request: CreateTrainerRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/trainers', request);
  }
}

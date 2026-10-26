import { InjectionToken } from '@angular/core';

export interface CoreConfig {
  apiBaseUrl: string;
}

export const CORE_CONFIG = new InjectionToken<CoreConfig>('CoreConfig');

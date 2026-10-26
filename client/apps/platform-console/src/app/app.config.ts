import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import {
  CORE_CONFIG,
  authInterceptor,
  errorInterceptor,
  authReducer,
  uiReducer,
  AuthActions,
  authEffects,
} from '@ethelpms/shared/core';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync(),
    { provide: CORE_CONFIG, useValue: { apiBaseUrl: environment.apiBaseUrl } },
    provideStore({ auth: authReducer, ui: uiReducer }),
    provideEffects(authEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    provideTranslateService({
      lang: environment.defaultLanguage,
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' })
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (store: Store) => () => {
        store.dispatch(AuthActions.restoreSession());
      },
      deps: [Store],
      multi: true
    }
  ]
};

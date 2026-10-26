import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Actions, ofType } from '@ngrx/effects';
import { firstValueFrom, race } from 'rxjs';

import { routes } from './app.routes';
import {
  authInterceptor,
  tenantInterceptor,
  errorInterceptor,
  CORE_CONFIG,
  authReducer,
  uiReducer,
  AuthActions,
  authEffects,
} from '@ethelpms/shared/core';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, tenantInterceptor, errorInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })
    ),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
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
      useFactory: (store: Store, actions$: Actions) => () => {
        store.dispatch(AuthActions.restoreSession());
        // Wait for restore to complete (success or failure) before app finishes bootstrapping
        return firstValueFrom(
          race(
            actions$.pipe(ofType(AuthActions.restoreSessionSuccess)),
            actions$.pipe(ofType(AuthActions.restoreSessionFailure))
          )
        );
      },
      deps: [Store, Actions],
      multi: true
    }
  ]
};

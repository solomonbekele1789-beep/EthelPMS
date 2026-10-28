import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { selectAuthState } from '../store/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  // Wait until any in-flight session restore completes before checking auth state.
  // Without this filter, take(1) may snapshot isAuthenticated=false while
  // restoreSession is still running (isLoading=true), causing a spurious
  // redirect to /auth/login even for authenticated users.
  return store.select(selectAuthState).pipe(
    filter((state) => !state.isLoading),
    take(1),
    map((state) => {
      if (state.isAuthenticated) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};

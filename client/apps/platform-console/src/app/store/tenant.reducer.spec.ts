import { tenantReducer, initialPlatformTenantState } from './tenant.reducer';
import { TenantActions } from './tenant.actions';

describe('platform tenantReducer', () => {
  it('updates module enabled state on toggleModuleSuccess', () => {
    const start = {
      ...initialPlatformTenantState,
      modules: [
        { moduleName: 'projects', isEnabled: true },
        { moduleName: 'meal', isEnabled: false },
      ],
    };

    const next = tenantReducer(start, TenantActions.toggleModuleSuccess({ moduleName: 'meal', enabled: true }));
    expect(next.modules.find((m) => m.moduleName === 'meal')?.isEnabled).toBe(true);
  });
});

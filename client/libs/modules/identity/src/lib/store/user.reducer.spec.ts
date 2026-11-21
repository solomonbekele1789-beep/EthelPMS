import { userReducer, initialUserState } from './user.reducer';
import { UserActions } from './user.actions';

describe('userReducer', () => {
  it('updates both users list and selectedUser on deactivateUserSuccess and activateUserSuccess', () => {
    const startState = {
      ...initialUserState,
      users: [{ id: 'u1', email: 'a@ngo.org', firstName: 'A', lastName: 'B', isActive: true, roles: [] }],
      selectedUser: { id: 'u1', email: 'a@ngo.org', firstName: 'A', lastName: 'B', isActive: true, roles: [], organizationId: 'o1' } as never,
    };

    const deactivated = userReducer(startState, UserActions.deactivateUserSuccess({ id: 'u1' }));
    expect(deactivated.users[0].isActive).toBe(false);
    expect(deactivated.selectedUser?.isActive).toBe(false);

    const activated = userReducer(deactivated, UserActions.activateUserSuccess({ id: 'u1' }));
    expect(activated.users[0].isActive).toBe(true);
    expect(activated.selectedUser?.isActive).toBe(true);
  });
});

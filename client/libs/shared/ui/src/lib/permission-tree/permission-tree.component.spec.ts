import { PermissionTreeComponent, PermissionTreeItem } from './permission-tree.component';

describe('PermissionTreeComponent', () => {
  const samplePermissions: PermissionTreeItem[] = [
    { id: '1', code: 'identity.users.read', module: 'identity' },
    { id: '2', code: 'identity.users.create', module: 'identity' },
    { id: '3', code: 'projects.read', module: 'projects' },
  ];

  it('groups permissions by module and toggles selection', () => {
    const cmp = new PermissionTreeComponent();
    cmp.permissions = samplePermissions;
    expect(cmp.groupedPermissions().length).toBe(2);

    cmp.togglePermission('1', true);
    expect(cmp.isSelected('1')).toBe(true);
    expect(cmp.isModuleIndeterminate(samplePermissions.slice(0, 2))).toBe(true);

    cmp.toggleModule(samplePermissions.slice(0, 2), true);
    expect(cmp.isModuleAllSelected(samplePermissions.slice(0, 2))).toBe(true);
  });
});

import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\.base)?\.config\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared-core',
              onlyDependOnLibsWithTags: ['scope:shared-core'],
            },
            {
              sourceTag: 'scope:shared-ui',
              onlyDependOnLibsWithTags: ['scope:shared-ui', 'scope:shared-core'],
            },
            {
              sourceTag: 'scope:module',
              onlyDependOnLibsWithTags: ['scope:shared-core', 'scope:shared-ui'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['scope:module', 'scope:shared-core', 'scope:shared-ui'],
            },
          ],
        },
      ],
    },
  },
];

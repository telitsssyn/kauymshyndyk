import * as migration_20260715_111617_initial from './20260715_111617_initial';

export const migrations = [
  {
    up: migration_20260715_111617_initial.up,
    down: migration_20260715_111617_initial.down,
    name: '20260715_111617_initial'
  },
];

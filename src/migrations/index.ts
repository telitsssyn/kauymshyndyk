import * as migration_20260715_111617_initial from './20260715_111617_initial';
import * as migration_20260716_113954_add_map_link from './20260716_113954_add_map_link';

export const migrations = [
  {
    up: migration_20260715_111617_initial.up,
    down: migration_20260715_111617_initial.down,
    name: '20260715_111617_initial',
  },
  {
    up: migration_20260716_113954_add_map_link.up,
    down: migration_20260716_113954_add_map_link.down,
    name: '20260716_113954_add_map_link'
  },
];

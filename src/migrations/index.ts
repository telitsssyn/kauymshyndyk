import * as migration_20260715_111617_initial from './20260715_111617_initial';
import * as migration_20260716_113954_add_map_link from './20260716_113954_add_map_link';
import * as migration_20260716_125135_add_sermons from './20260716_125135_add_sermons';
import * as migration_20260717_110203_sermon_announce from './20260717_110203_sermon_announce';

export const migrations = [
  {
    up: migration_20260715_111617_initial.up,
    down: migration_20260715_111617_initial.down,
    name: '20260715_111617_initial',
  },
  {
    up: migration_20260716_113954_add_map_link.up,
    down: migration_20260716_113954_add_map_link.down,
    name: '20260716_113954_add_map_link',
  },
  {
    up: migration_20260716_125135_add_sermons.up,
    down: migration_20260716_125135_add_sermons.down,
    name: '20260716_125135_add_sermons',
  },
  {
    up: migration_20260717_110203_sermon_announce.up,
    down: migration_20260717_110203_sermon_announce.down,
    name: '20260717_110203_sermon_announce'
  },
];

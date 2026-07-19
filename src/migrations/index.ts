import * as migration_20260715_111617_initial from './20260715_111617_initial';
import * as migration_20260716_113954_add_map_link from './20260716_113954_add_map_link';
import * as migration_20260716_125135_add_sermons from './20260716_125135_add_sermons';
import * as migration_20260717_110203_sermon_announce from './20260717_110203_sermon_announce';
import * as migration_20260717_112242_sermon_description_richtext from './20260717_112242_sermon_description_richtext';
import * as migration_20260719_172155_add_user_roles from './20260719_172155_add_user_roles';
import * as migration_20260719_191051_drop_kaspi_requisites from './20260719_191051_drop_kaspi_requisites';
import * as migration_20260719_191110_donate_halyk_qr from './20260719_191110_donate_halyk_qr';

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
    name: '20260717_110203_sermon_announce',
  },
  {
    up: migration_20260717_112242_sermon_description_richtext.up,
    down: migration_20260717_112242_sermon_description_richtext.down,
    name: '20260717_112242_sermon_description_richtext',
  },
  {
    up: migration_20260719_172155_add_user_roles.up,
    down: migration_20260719_172155_add_user_roles.down,
    name: '20260719_172155_add_user_roles',
  },
  {
    up: migration_20260719_191051_drop_kaspi_requisites.up,
    down: migration_20260719_191051_drop_kaspi_requisites.down,
    name: '20260719_191051_drop_kaspi_requisites',
  },
  {
    up: migration_20260719_191110_donate_halyk_qr.up,
    down: migration_20260719_191110_donate_halyk_qr.down,
    name: '20260719_191110_donate_halyk_qr'
  },
];

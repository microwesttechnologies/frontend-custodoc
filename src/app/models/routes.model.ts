import { ModulesKeys, Permissions } from './permissions.model';

export interface Routes extends Permissions {
  id_route: number;
  order: number;
  name: string;
  code: ModulesKeys;
  path: string;
  icon: string;
}

export interface RoutesAndPermissionsForm {
  id_route: number;
  name: string;
  code: ModulesKeys;
  permissions: Permissions;
}

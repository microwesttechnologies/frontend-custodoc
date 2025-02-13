import { Permissions } from "./permissions.model";

export interface Rol {
  id_rol: number;
  name: string;
  id_company?: number;
  created_at?: string;
  updated_at?: string;
  isDefault?: boolean;
}

export interface ModulesPermissions extends Permissions {
  code: string;
  name: string;
}

export interface RolPermissions {
  id_rol: number;
  name: string;
  created_at: string;
  isDefault: boolean;
  modules: ModulesPermissions[];
  showModules?: boolean;
}

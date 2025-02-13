export type ModulesKeys =
  | 'COMPANY'
  | 'USER'
  | 'CUSTOMER'
  | 'DOCUMENT'
  | 'RANKING'
  | 'ROLES'
  | 'TRASH';

export interface Permissions {
  ACCESS?: number;
  CREATE?: number;
  UPDATE?: number;
  DELETE?: number;
  EXPORT?: number;
}

export type PermissionsKeys = keyof Permissions;

import { TypesDocument } from './types-document.model';
import { Rol } from './rol.model';

export interface User {
  iss?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  jti?: string;
  sub?: string;
  prv?: string;

  identification?: string;
  name: string;
  phone: string;
  email: string;
  id_rol: number | Rol;
  state: number;
  id_company: any;
  id_document: TypesDocument | string;
  name_company?: string;
  name_type_document?: string;
  name_rol?: string;
  type_company?: string;
  disabled?: boolean;
}

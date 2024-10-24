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
  id_role: number;
  state: number;
  id_company: number;
  id_document: string;
}

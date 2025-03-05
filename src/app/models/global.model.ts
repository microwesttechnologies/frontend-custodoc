export interface GenericResponse<T = undefined> {
  message?: string;
  status: boolean;
  token?: string;
  code?: string;
  record?: T;
}

export interface DetailCompany {
  documents: Detail;
  customers: Detail;
  company?: Detail;
  users: Detail;
}

export interface Detail {
  label: string;
  amount: number;
  icon: string;
}

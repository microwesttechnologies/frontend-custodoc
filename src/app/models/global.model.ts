export interface GenericResponse {
  message?: string;
  status: boolean;
  token?: string;
  code?: string;
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

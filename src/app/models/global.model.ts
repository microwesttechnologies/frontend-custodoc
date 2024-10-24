export interface GenericResponse {
  status: boolean;
  message?: string;
  token?: string;
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

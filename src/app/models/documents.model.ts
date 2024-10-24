export interface Document {
  id_history: number;
  identification: string;
  name: string;
  path: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  name_customer?: string;
}

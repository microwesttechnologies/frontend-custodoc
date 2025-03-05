export interface Document {
  id_history: number;
  identification: string;
  name: string;
  path: string;
  description: string;
  id_folder: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  name_customer?: string;
  user_identification?: string;
  isFavorite: number;
  selected?: boolean;
  id_area?: number;
}

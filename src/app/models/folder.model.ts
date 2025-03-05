export interface Folder {
  id_folder?: number;
  name?: string;
  parent?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  isFavorite?: number;
  selected?: boolean;
  id_area?: number;
}

export interface LevelFolders {
  id_folder: number | null;
  id_area?: number;
  name: string;
}

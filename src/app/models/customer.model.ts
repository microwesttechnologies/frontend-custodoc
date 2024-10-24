import { Company } from './company.model';
import { TypesDocument } from './types-document.model';

export interface Customer {
  identification?: string;
  name: string;
  phone: string;
  email: string;
  id_company: Company | number;
  id_document: TypesDocument | string;
  name_company?: string;
  name_type_document?: string;
}

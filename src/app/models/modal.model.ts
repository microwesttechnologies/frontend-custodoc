export interface ListFields {
  type?: 'autocomplete' | 'select' | 'textarea';
  keyAutoComplete?: string;
  placeholder?: string;
  required?: boolean;
  dataFilter?: any[];
  label?: string;
  data?: any[];
  key: string;
  value?: any;
}

export interface ListFields {
  [key: string]: {
    type?: 'autocomplete' | 'select' | 'textarea' | 'password';
    keyAutoComplete?: string;
    placeholder?: string;
    required?: boolean;
    dataFilter?: any[];
    label?: string;
    data?: any[];
    value?: any;
  };
}

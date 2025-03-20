import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HttpHeaders, HttpParams } from '@angular/common/http';

export function isTokenExpired(token: any): boolean {
  try {
    const expirationDate = token.exp * 1000; // `exp` is in seconds, so convert to milliseconds
    const currentTime = new Date().getTime();

    return expirationDate < currentTime;
  } catch (error) {
    // En caso de error al decodificar el token (token malformado, etc.)
    console.error('Error decoding token:', error);
    return true; // Consideramos el token inválido si no puede ser decodificado
  }
}

// Validador personalizado para verificar si el valor es un objeto
export function isObjectValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;

  // Verificar si el valor es de tipo objeto y no es null
  if (typeof value === 'object' && value !== null) {
    return null; // El valor es un objeto, pasa la validación
  }

  return { notObject: true }; // Si no es un objeto, retorna un error
}

export const headerAuthorization = (
  params?: HttpParams,
  customHeaders?: Object
) => ({
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
  }),
  params,
  ...customHeaders,
});

export const validateFormField = (
  form: FormGroup,
  field: string,
  type: 'valid' | 'invalid' = 'invalid'
): boolean => !!(form.get(field)?.[type] && form.get(field)?.touched);

export const createArrayByNumber = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

export const validateLimitText = (event: HTMLElement): boolean =>
  event?.scrollWidth > event?.clientWidth;

export const arrayFilter = <T>(
  list: Array<T>,
  value: string,
  fields: string[]
): Array<T> => {
  if (!value) return list;

  const lowerCaseValue = value.trim().toLowerCase();

  return list.filter((item: any) =>
    fields.some((field) =>
      item[field]?.toString().toLowerCase().includes(lowerCaseValue)
    )
  );
};

export const passwordMatchValidator =
  (password: string, confirmPassword: string): ValidatorFn =>
  (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(password);
    const confirmPasswordControl = formGroup.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null; // Salir si los controles no existen
    }

    if (
      confirmPasswordControl.errors &&
      !confirmPasswordControl.errors['passwordMismatch']
    ) {
      return null; // Salir si ya tiene otros errores
    }

    // Validar que las contraseñas coincidan
    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl.setErrors(null); // Limpiar error si coincide
      return null;
    }
  };

// Función para convertir archivos a Base64
export const fileToBase64 = (
  file: File
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (title: string, blob: Blob, ext: string) => {
  let date = new Date();
  let timestamp =
    date.getFullYear() +
    '_' +
    (date.getMonth() + 1) +
    '_' +
    date.getDate() +
    '_' +
    date.getHours() +
    '_' +
    date.getMinutes();

  const link = document.createElement('a');
  // ↓ Agrega la url del archivo al link
  link.href = window.URL.createObjectURL(blob);
  // ↓ Asigna el nombre del archivo
  link.download = `${title}_${timestamp}.${ext}`;
  // ↓ Ejecuta la descarga
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const redirect = (route: string, newPage?: boolean) => {
  const protocol = window.location.protocol;
  const domain = window.location.hostname;
  const port = window.location.port;

  if (newPage) window.open(`${protocol}//${domain}:${port}/${route}`);
  else window.location.href = `${protocol}//${domain}:${port}/${route}`;
};

export const scrollToElement = (idElement: string, animation = true) => {
  const element = document.getElementById(idElement) as HTMLDivElement;
  if (element) {
    element.scrollIntoView({
      behavior: animation ? "smooth" : "instant",
      block: "center",
    });
  }
};

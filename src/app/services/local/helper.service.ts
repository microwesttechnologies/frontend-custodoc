import { AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

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

export const headerAuthorization = () => ({
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
  }),
});

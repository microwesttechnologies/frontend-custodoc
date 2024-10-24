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

export const headerAuthorization = () => ({
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
  }),
});

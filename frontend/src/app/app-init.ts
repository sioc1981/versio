import { AuthenticationService } from './auth/authentication.service';

export function initializer(authenticationService: AuthenticationService): () => Promise<any> {
  return (): Promise<any> => authenticationService.init();
}

import { Injectable } from '@angular/core';

import { KeycloakService, KeycloakOptions } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

const IS_LOGGED_IN_KEY = 'is-logged-in';
const AUTH_TOKEN = 'auth-token';
const AUTH_REFRESH_TOKEN = 'auth-refresh-token';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(private keycloakService: KeycloakService) { }

    canAuthenticate(): boolean {
        return environment.hasAuthentication;
    }

    getUsername(): Promise<string> {
        if (environment.hasAuthentication) {
            return this.keycloakService.loadUserProfile(false).then( _ =>
                this.keycloakService.getUsername()
            );
        } else {
            return new Promise<string>((resolve, reject) => {
                resolve('');
            });
        }
    }

    init(): any {

        console.log('auth init');
        let res: any = environment.hasAuthentication;
        if (res) {
            const token: string = localStorage.getItem(AUTH_TOKEN);
            const refreshToken: string = localStorage.getItem(AUTH_REFRESH_TOKEN) || '';
            const options = {
                enableBearerInterceptor: false,
                loadUserProfileAtStartUp: false,
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                promiseType: 'native',
                checkLoginIframe: true
            } as KeycloakOptions;
            if (token && refreshToken) {
                options.initOptions = {
                    token: token,
                    refreshToken: refreshToken
                };
            }
            res = this.keycloakService.init(options).then(init => {
                this.checkAndRelog();
                return init;
            });
        }
        return res;
    }

    checkAndRelog() {
        if (environment.hasAuthentication) {
            const wasLoggedIn: boolean = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
            this.isLoggedIn().then(loggedIn => {
                localStorage.setItem(IS_LOGGED_IN_KEY, '' + loggedIn);
                if (loggedIn) {
                    this.keycloakService.getToken().then(_ => {
                        localStorage.setItem(AUTH_TOKEN, this.keycloakService.getKeycloakInstance().token);
                        localStorage.setItem(AUTH_REFRESH_TOKEN, this.keycloakService.getKeycloakInstance().refreshToken);
                    }
                    );
                }
                if (wasLoggedIn && !loggedIn) {
                    this.keycloakService.loadUserProfile(true);
                }
            });
        }
    }

    isLoggedIn(): Promise<boolean> {
        if (environment.hasAuthentication) {
            return this.keycloakService.isLoggedIn();
        } else {
            return Promise.resolve(true);
        }
    }

    isAdmin(): boolean {
        if (environment.hasAuthentication) {
            return this.keycloakService.isUserInRole('admin');
        } else {
            return true;
        }
    }

    login(option?: any): void {
        if (environment.hasAuthentication) {
            this.keycloakService.login(option);
        }
    }

    logout(): void {
        if (environment.hasAuthentication) {
            localStorage.removeItem(AUTH_TOKEN);
            localStorage.removeItem(AUTH_REFRESH_TOKEN);
            this.keycloakService.logout();
        }
    }

}

/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';


/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {@link KeycloakOptions} bearerExcludedUrls property.
 */
@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  private excludedUrlsRegex: RegExp[];

  /**
   * KeycloakBearerInterceptor constructor.
   *
   * @param keycloak - Injected KeycloakService instance.
   */
  constructor(private keycloak: KeycloakService) {}

  private loadExcludedUrlsRegex() {
    const excludedUrls: string[] = this.keycloak.bearerExcludedUrls;
    this.excludedUrlsRegex = excludedUrls.map(urlPattern => new RegExp(urlPattern, 'i')) || [];
  }

  /**
   * Intercept implementation that checks if the request url matches the excludedUrls.
   * If not, adds the Authorization header to the request.
   *
   * @param req the request
   * @param next the next handler
   */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If keycloak service is not initialized yet, or the interceptor should not be execute
    if (!this.keycloak || !environment.hasAuthentication) {
      return next.handle(req);
    }

    if (!this.excludedUrlsRegex) {
      this.loadExcludedUrlsRegex();
    }

    const urlRequest = req.url;
    const shallPass: boolean = !!this.excludedUrlsRegex.find(regex => regex.test(urlRequest));
    if (shallPass) {
      return next.handle(req);
    }

    return from(this.keycloak.isLoggedIn()).pipe(
      mergeMap((loggedIn: boolean) => loggedIn
        ? this.handleRequestWithTokenHeader(req, next)
        : next.handle(req))
    );
  }

  /**
   * Adds the token of the current user to the Authorization header
   *
   * @param req the request
   * @param next the next handler
   */
  private handleRequestWithTokenHeader(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    return this.keycloak.addTokenToHeader(req.headers).pipe(
      mergeMap(headersWithBearer => {
        const kcReq = req.clone({ headers: headersWithBearer });
        return next.handle(kcReq);
      })
    );
  }
}

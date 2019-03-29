import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Release } from './Release';
import { RELEASE_CONSTANT } from './release.constants';

@Injectable({
    providedIn: 'root'
})
export class ReleaseService {


    constructor(private http: HttpClient) { }

    getReleases(): Observable<Release[]> {
        return this.http.get<Release[]>(RELEASE_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Release[]>('getReleases', []))
            );
    }

    getSummary(): Observable<number> {
        return RELEASE_CONSTANT.summary.count$;
    }

    /** GET Release by id. Will 404 if id not found */
    getRelease(id: number): Observable<Release> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${id}`;
        return this.http.get<Release>(url).pipe(
            catchError(this.handleError<Release>(`getRelease id=${id}`))
        );
    }

    /** POST: add a new release to the server */
    addRelease(hero: Release): Observable<Release> {
        return this.http.post<Release>(RELEASE_CONSTANT.backendUrl, hero, RELEASE_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<Release>('addRelease'))
        );
    }


    /** PUT: update the release on the server */
    updateRelease(release: Release): Observable<any> {
        return this.http.put(RELEASE_CONSTANT.backendUrl, release, RELEASE_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<any>('updateRelease'))
        );
    }

    /**
       * Handle Http operation that failed.
       * Let the app continue.
       * @param operation - name of the operation that failed
       * @param result - optional value to return as the observable result
       */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead
            // TODO: better job of transforming error for user consumption
            // this.log(`${operation} failed: ${error.message}`);
            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}

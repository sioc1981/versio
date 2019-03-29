import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Version } from './Version';
import { VERSION_CONSTANT } from './version.constants';

@Injectable({
    providedIn: 'root'
})
export class VersionService {


    constructor(private http: HttpClient) { }

    getVersions(): Observable<Version[]> {
        return this.http.get<Version[]>(VERSION_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Version[]>('getVersions', []))
            );
    }

    getSummary(): Observable<number> {
        return VERSION_CONSTANT.summary.count$;
    }

    /** GET Version by id. Will 404 if id not found */
    getVersion(id: number): Observable<Version> {
        const url = `${VERSION_CONSTANT.backendUrl}/${id}`;
        return this.http.get<Version>(url).pipe(
            catchError(this.handleError<Version>(`getVersion id=${id}`))
        );
    }

    /** POST: add a new version to the server */
    addVersion(hero: Version): Observable<Version> {
        return this.http.post<Version>(VERSION_CONSTANT.backendUrl, hero, VERSION_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<Version>('addVersion'))
        );
    }


    /** PUT: update the version on the server */
    updateVersion(version: Version): Observable<any> {
        return this.http.put(VERSION_CONSTANT.backendUrl, version, VERSION_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<any>('updateVersion'))
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

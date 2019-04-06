import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Release } from './Release';

import { SseService } from '../../server-event/sse.service';
import { Summary } from '../../server-event/Summary';
import { APP_CONSTANT } from '../../app.constants';
import { ReleaseFull } from './ReleaseFull';

export const RELEASE_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/release',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-bundle',
    summary: new Summary(),
    title: 'Releases',
    url: '/releases'
};

@Injectable({
    providedIn: 'root'
})
export class ReleaseService {


    constructor(private http: HttpClient, private sseService: SseService) {
        sseService.registerSummary(RELEASE_CONSTANT.summary, 'release');
     }

    getReleases(): Observable<Release[]> {
        return this.http.get<Release[]>(RELEASE_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Release[]>('getReleases', []))
            );
    }

    getFullReleases(): Observable<ReleaseFull[]> {
        return this.http.get<ReleaseFull[]>(RELEASE_CONSTANT.backendUrl + '/full')
            .pipe(
                catchError(this.handleError<ReleaseFull[]>('getReleases', []))
            );
    }

    getSummary(): Observable<number> {
        return RELEASE_CONSTANT.summary.count$;
    }

    /** GET Release by id. Will 404 if id not found */
    getRelease(id: number): Observable<ReleaseFull> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${id}`;
        return this.http.get<ReleaseFull>(url).pipe(
            catchError(this.logAndError(`getRelease id=${id}`))
        );
    }

    /** POST: add a new release to the server */
    addRelease(hero: ReleaseFull): Observable<ReleaseFull> {
        return this.http.post<ReleaseFull>(RELEASE_CONSTANT.backendUrl, hero, RELEASE_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('addRelease'))
        );
    }


    /** PUT: update the release on the server */
    updateRelease(release: ReleaseFull): Observable<any> {
        return this.http.put(RELEASE_CONSTANT.backendUrl, release, RELEASE_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('updateRelease'))
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
    /**
       * Handle Http operation that failed.
       * Let the app continue.
       * @param operation - name of the operation that failed
       * @param result - optional value to return as the observable result
       */
    private logAndError(operation = 'operation') {
        return (error: any): Observable<never> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead
            // TODO: better job of transforming error for user consumption
            // this.log(`${operation} failed: ${error.message}`);
            // Let the app keep running by returning an empty result.
            return throwError(error);
        };
    }
}

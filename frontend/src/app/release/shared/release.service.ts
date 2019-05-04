import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SseService } from '../../server-event/sse.service';
import { Release, ReleaseSummary, ReleaseFull, ReleaseComparison } from './release.model';
import { RELEASE_CONSTANT } from './release.constant';

@Injectable({
    providedIn: 'root'
})
export class ReleaseService {


    constructor(private http: HttpClient, sseService: SseService) {
        RELEASE_CONSTANT.summary.sseCallback = this.sseCallback;
        sseService.registerSummary(RELEASE_CONSTANT.summary, 'release');
     }

    private sseCallback(data: any): void {
        if (data['count'] !== undefined) {
            const count = Number(data['count']);
            RELEASE_CONSTANT.summary.count$.emit(count);
        } else if (data['summary'] !== undefined) {
            Object.entries(data['summary']).forEach( entry => {
                const i: number = +entry[0];
                RELEASE_CONSTANT.releaseSummaries[i] = entry[1] as ReleaseSummary;
            });
            RELEASE_CONSTANT.releaseSummariesNotifier$.emit(true);
        }
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
    getRelease(id: number): Observable<Release> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${id}`;
        return this.http.get<Release>(url).pipe(
            catchError(this.logAndError(`getRelease id=${id}`))
        );
    }

    getReleaseFull(id: number): Observable<ReleaseFull> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${id}/full`;
        return this.http.get<ReleaseFull>(url).pipe(
            catchError(this.logAndError(`getReleaseFull id=${id}`))
        );
    }

    searchReleaseFull(versionNumber: string): Observable<ReleaseFull> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${versionNumber}/full`;
        return this.http.get<ReleaseFull>(url).pipe(
            catchError(this.logAndError(`searchReleaseFull versionNumber=${versionNumber}`))
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

    compare(fromVersion: string, toVersion: string): Observable<ReleaseComparison> {
        const url = `${RELEASE_CONSTANT.backendUrl}/${fromVersion}/compare/${toVersion}`;
        return this.http.get<ReleaseComparison>(url).pipe(
            catchError(this.logAndError(`compare fromVersion=${fromVersion} toVersion=${toVersion}`))
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

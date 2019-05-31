import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SseService } from '../../../server-event/sse.service';
import { APPLICATION_CONSTANT } from './application.constant';
import { Application } from './application.model';


@Injectable({
    providedIn: 'root'
})
export class ApplicationService {

    constructor(private http: HttpClient, private sseService: SseService) {
        APPLICATION_CONSTANT.summary.sseCallback = this.sseCallback;
        this.sseService.registerSummary(APPLICATION_CONSTANT.summary, 'application');
    }

    private sseCallback(data: any): void {
        if (data['count'] !== undefined) {
            const count = +data['count'];
            APPLICATION_CONSTANT.summary.count$.emit(count);
        }
    }

    getApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(APPLICATION_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Application[]>('getApplications', []))
            );
    }

    /** GET Application by id. Will 404 if id not found */
    getApplication(reference: string): Observable<Application> {
        const url = `${APPLICATION_CONSTANT.backendUrl}/${reference}`;
        return this.http.get<Application>(url).pipe(
            catchError(this.logAndError(`getApplication id=${reference}`))
        );
    }

    /** POST: add a new application to the server */
    addApplication(hero: Application): Observable<Application> {
        return this.http.post<Application>(APPLICATION_CONSTANT.backendUrl, hero, APPLICATION_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('addApplication'))
        );
    }


    /** PUT: update the application on the server */
    updateApplication(application: Application): Observable<any> {
        return this.http.put(APPLICATION_CONSTANT.backendUrl, application, APPLICATION_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('updatePatch'))
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

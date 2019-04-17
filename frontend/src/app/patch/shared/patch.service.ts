import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Patch } from './Patch';

import { SseService } from '../../server-event/sse.service';
import { APP_CONSTANT } from '../../app.constants';
import { Summary } from 'src/app/shared/Summary';

export const PATCH_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/patch',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'fa fa-plus-square',
    summary: new Summary(),
    title: 'Patchs',
    url: '/patchs'
};

@Injectable({
    providedIn: 'root'
})
export class PatchService {


    constructor(private http: HttpClient, private sseService: SseService) {
        PATCH_CONSTANT.summary.sseCallback = this.sseCallback;
        sseService.registerSummary(PATCH_CONSTANT.summary, 'patch');
    }

    private sseCallback(data: any): void {
        console.log('patch sse callback: ' + data);
        if (data['count'] !== undefined) {
            const count = Number(data['count']);
            PATCH_CONSTANT.summary.count$.emit(count);

        }
    }

    getPatchs(): Observable<Patch[]> {
        return this.http.get<Patch[]>(PATCH_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Patch[]>('getPatchs', []))
            );
    }

    getSummary(): Observable<number> {
        return PATCH_CONSTANT.summary.count$;
    }

    /** GET Patch by id. Will 404 if id not found */
    getPatch(id: number): Observable<Patch> {
        const url = `${PATCH_CONSTANT.backendUrl}/${id}`;
        return this.http.get<Patch>(url).pipe(
            catchError(this.logAndError(`getPatch id=${id}`))
        );
    }

    /** POST: add a new patch to the server */
    addPatch(hero: Patch): Observable<Patch> {
        return this.http.post<Patch>(PATCH_CONSTANT.backendUrl, hero, PATCH_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('addPatch'))
        );
    }


    /** PUT: update the patch on the server */
    updatePatch(patch: Patch): Observable<any> {
        return this.http.put(PATCH_CONSTANT.backendUrl, patch, PATCH_CONSTANT.httpOptions).pipe(
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

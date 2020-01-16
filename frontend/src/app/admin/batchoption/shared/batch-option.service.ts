import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BatchOption } from './batch-option.model';
import { BATCH_OPTION_CONSTANT } from './batch-option.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BatchOptionService {

  constructor(private http: HttpClient) {
  }

  getBatchOptions(): Observable<BatchOption[]> {
      return this.http.get<BatchOption[]>(BATCH_OPTION_CONSTANT.backendUrl)
          .pipe(
              catchError(this.handleError<BatchOption[]>('getBatchOptions', []))
          );
  }


  /** POST: add a new release to the server */
  addBatchOption(release: BatchOption): Observable<BatchOption> {
    return this.http.post<BatchOption>(BATCH_OPTION_CONSTANT.backendUrl, release, BATCH_OPTION_CONSTANT.httpOptions).pipe(
      catchError(this.logAndError('addRelease'))
    );
  }


  /** PUT: update the release on the server */
  updateBatchOption(release: BatchOption): Observable<any> {
    return this.http.put(BATCH_OPTION_CONSTANT.backendUrl, release, BATCH_OPTION_CONSTANT.httpOptions).pipe(
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

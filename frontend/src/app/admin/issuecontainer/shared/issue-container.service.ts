import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IssueContainer } from './issue-container.model';
import { ISSUE_CONTAINER_CONSTANT } from './issue-container.constant';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IssueContainerService {

  constructor(private http: HttpClient) { }

      /** PUT: update the issue on the server */
    updateIssueContainer(issueContainer: IssueContainer): Observable<any> {
        return this.http.put(ISSUE_CONTAINER_CONSTANT.backendUrl, issueContainer, ISSUE_CONTAINER_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('updatePatch'))
        );
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

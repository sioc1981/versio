import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SseService } from '../../server-event/sse.service';
import { ISSUE_CONSTANT } from './issue.constant';
import { Issue } from './issue.model';
import { IssueContainer } from 'src/app/admin/issuecontainer/shared/issue-container.model';


@Injectable({
    providedIn: 'root'
})
export class IssueService {

    constructor(private http: HttpClient, private sseService: SseService) {
        ISSUE_CONSTANT.summary.sseCallback = this.sseCallback;
        this.sseService.registerSummary(ISSUE_CONSTANT.summary, 'issue');
    }

    private sseCallback(data: any): void {
        if (data['count'] !== undefined) {
            const count = +data['count'];
            ISSUE_CONSTANT.summary.count$.emit(count);
        } else if (data['container'] !== undefined) {
            Object.entries(data['container']).forEach( entry => {
                const container_id = entry[0];
                const constainer = entry[1] as IssueContainer;
                ISSUE_CONSTANT.constainer_urls[container_id] = constainer.url;
            });
        }
    }

    getIssues(): Observable<Issue[]> {
        return this.http.get<Issue[]>(ISSUE_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Issue[]>('getIssues', []))
            );
    }

    /** GET Issue by id. Will 404 if id not found */
    getIssue(reference: string): Observable<Issue> {
        const url = `${ISSUE_CONSTANT.backendUrl}/${reference}`;
        return this.http.get<Issue>(url).pipe(
            catchError(this.logAndError(`getIssue id=${reference}`))
        );
    }

    /** POST: add a new issue to the server */
    addIssue(hero: Issue): Observable<Issue> {
        return this.http.post<Issue>(ISSUE_CONSTANT.backendUrl, hero, ISSUE_CONSTANT.httpOptions).pipe(
            catchError(this.logAndError('addIssue'))
        );
    }


    /** PUT: update the issue on the server */
    updateIssue(issue: Issue): Observable<any> {
        return this.http.put(ISSUE_CONSTANT.backendUrl, issue, ISSUE_CONSTANT.httpOptions).pipe(
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Issue } from './Issue';
import { SseService } from '../../server-event/sse.service';
import { ISSUE_CONSTANT } from './issue.constant';


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
            const count = Number(data['count']);
            ISSUE_CONSTANT.summary.count$.emit(count);
        }
    }

    getIssues(): Observable<Issue[]> {
        return this.http.get<Issue[]>(ISSUE_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<Issue[]>('getIssues', []))
            );
    }

    /** GET Issue by id. Will 404 if id not found */
    getIssue(id: number): Observable<Issue> {
        const url = `${ISSUE_CONSTANT.backendUrl}/${id}`;
        return this.http.get<Issue>(url).pipe(
            catchError(this.handleError<Issue>(`getIssue id=${id}`))
        );
    }

    /** POST: add a new issue to the server */
    addIssue(hero: Issue): Observable<Issue> {
        return this.http.post<Issue>(ISSUE_CONSTANT.backendUrl, hero, ISSUE_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<Issue>('addIssue'))
        );
    }


    /** PUT: update the issue on the server */
    updateIssue(issue: Issue): Observable<any> {
        return this.http.put(ISSUE_CONSTANT.backendUrl, issue, ISSUE_CONSTANT.httpOptions).pipe(
            catchError(this.handleError<any>('updatePatch'))
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

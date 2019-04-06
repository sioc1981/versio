import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Issue } from './Issue';
import { SseService } from '../../server-event/sse.service';
import { Summary } from '../../server-event/Summary';
import { APP_CONSTANT } from '../../app.constants';
export const ISSUE_CONSTANT = {
    backendUrl: APP_CONSTANT.backendUrlBase + '/issue',
    httpOptions: APP_CONSTANT.httpOptions,
    iconStyleClass: 'pficon pficon-security',
    summary: new Summary(),
    title: 'Issues',
    url: '/issues'
};

@Injectable({
    providedIn: 'root'
})
export class IssueService implements OnInit, OnDestroy {

    private sseStream: Subscription;

    constructor(private http: HttpClient, private sseService: SseService) {
        sseService.registerSummary(ISSUE_CONSTANT.summary, 'issue');
    }

    ngOnInit() {
        this.sseStream = this.sseService.observeMessages()
            .subscribe(message => {
                console.log(message);
                if (message.startsWith('issue=')) {
                    const count = Number(message.substr('issue='.length));
                    console.log(count);
                    ISSUE_CONSTANT.summary.count$.emit(count);
                }
            });
    }

    ngOnDestroy() {
        if (this.sseStream) {
            this.sseStream.unsubscribe();
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

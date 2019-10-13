import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationUser } from './application-user.model';
import { APPLICATION_USER_CONSTANT } from './application-user.constant';
import { HttpClient } from '@angular/common/http';
import { SseService } from 'src/app/server-event/sse.service';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ApplicationUserService {

  constructor(private http: HttpClient, sseService: SseService) {
    APPLICATION_USER_CONSTANT.summary.sseCallback = this.sseCallback;
    sseService.registerSummary(APPLICATION_USER_CONSTANT.summary, 'applicationUser');
  }

  private sseCallback(data: any): void {
    if (data['count'] !== undefined) {
      const count = Number(data['count']);
      APPLICATION_USER_CONSTANT.summary.count$.emit(count);
    } else if (data['summary'] !== undefined) {
      Object.entries(data['summary']).forEach(entry => {
        const i: number = +entry[0];
        APPLICATION_USER_CONSTANT.applicationUserSummaries[i] = entry[1] as ApplicationUser;
      });
      APPLICATION_USER_CONSTANT.applicationUserSummariesNotifier$.emit(true);
    }
  }

    getApplicationUsers(): Observable<ApplicationUser[]> {
        return this.http.get<ApplicationUser[]>(APPLICATION_USER_CONSTANT.backendUrl)
            .pipe(
                catchError(this.handleError<ApplicationUser[]>('getApplicationUsers', []))
            );
    }


  /** POST: add a new release to the server */
  addApplicationUser(release: ApplicationUser): Observable<ApplicationUser> {
    return this.http.post<ApplicationUser>(APPLICATION_USER_CONSTANT.backendUrl, release, APPLICATION_USER_CONSTANT.httpOptions).pipe(
      catchError(this.logAndError('addRelease'))
    );
  }


  /** PUT: update the release on the server */
  updateApplicationUsers(release: ApplicationUser): Observable<any> {
    return this.http.put(APPLICATION_USER_CONSTANT.backendUrl, release, APPLICATION_USER_CONSTANT.httpOptions).pipe(
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

import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { APP_CONSTANT } from '../app.constants';
import { Summary } from '../shared/Summary';
import { IssueResultItem } from '../release-compare/issue-result-item';
import { ReleaseComparison } from '../release/shared/ReleaseComparison';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';

@Injectable({
    providedIn: 'root'
})
export class SseService {

    private o: Observable<any>;

    private innerZone: NgZone;

    private es: EventSource;

    private subscribers: Subscriber<string>[] = [];

    constructor(private zone: NgZone) {
        this.innerZone = this.zone;
        this.o = new Observable<string>(obs => {
            this.subscribers.push(obs);
            return () => {
                const index = this.subscribers.indexOf(obs, 0);
                if (index > -1) {
                    this.subscribers.splice(index, 1);
                }
            };
        });
        this.es = new EventSource(APP_CONSTANT.backendUrlBase + '/subscribe');
        this.es.onmessage = (evt) => {
            const data: any = JSON.parse(evt.data);
            this.subscribers.forEach(obs => obs.next(data));
        };
    }

    close(): void {
        console.log('close sseService ');
        this.es.close();
    }

    observeMessages(): Observable<any> {
        return this.o;
    }

    registerSummary(summary: Summary, filter: string): Summary {
        this.o.subscribe(message => {
            this.innerZone.run(() => {
                if (summary.sseCallback !== undefined && message[filter] !== undefined) {
                    summary.sseCallback(message[filter]);
                }
            });
        });
        return summary;
    }


    getIssueItems(releaseComparison: ReleaseComparison): Observable<IssueResultItem> {
        return Observable.create(observer => {
            const eventSource = new EventSource(ISSUE_CONSTANT.backendUrl + '/search/releasecomparison?q='
                + encodeURI( JSON.stringify(this.convertIntoIssueParam(releaseComparison))));
            eventSource.onmessage = score => this.zone.run(() => observer.next(JSON.parse(score.data)));
            eventSource.onerror = error => this.zone.run(() => observer.error(error));
            return () => eventSource.close();
        });
    }

    private convertIntoIssueParam(releaseComparison: ReleaseComparison): any {
        const res = {
            sourceReleases: [],
            destReleases: []
        };
        releaseComparison.sourceReleases.forEach(r => {
            res.sourceReleases.push(r.version.versionNumber);
        });
        releaseComparison.destReleases.forEach(r => {
            res.destReleases.push(r.version.versionNumber);
        });
        return res;
    }
}

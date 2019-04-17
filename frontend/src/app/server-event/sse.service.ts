import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { APP_CONSTANT } from '../app.constants';
import { Summary } from '../shared/Summary';

//declare var EventSource;

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
            console.log('sse received: ', evt.data);
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

}

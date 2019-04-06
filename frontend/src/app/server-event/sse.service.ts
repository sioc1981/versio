import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { Summary } from './Summary';
import { APP_CONSTANT } from '../app.constants';

declare var EventSource;

@Injectable({
    providedIn: 'root'
})
export class SseService {

    private o: Observable<string>;

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
            this.subscribers.forEach(obs => obs.next(evt.data));
        };
    }

    observeMessages(): Observable<string> {
        return this.o;
    }
    registerSummary(summary: Summary, filter: string): Summary {
        this.o.subscribe(message => {
            this.innerZone.run(() => {
                if (message.startsWith(filter)) {
                    const count = Number(message.substr(filter.length + 1));
                    console.log(filter + ': ' + count);
                    summary.count$.emit(count);
                }
            });
        });
        return summary;
    }

}

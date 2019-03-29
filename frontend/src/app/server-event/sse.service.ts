import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Summary } from './Summary';

declare var EventSource;

@Injectable({
    providedIn: 'root'
})
export class SseService {

    private static o = new Observable<string>(obs => {
        const es = new EventSource('http://localhost:8080/backend/api/subscribe');
        es.onmessage = (evt) => {
            obs.next(evt.data);
        };
        return () => es.close();
    });

    private static innerZone: NgZone;

    static buildSummary(filter: string): Summary {
        const summary = new Summary();
        SseService.o.subscribe(message => {
            SseService.innerZone.run(() => {
                if (message.startsWith(filter)) {
                    const count = Number(message.substr(filter.length + 1));
                    console.log(count);
                    summary.count$.emit(count);
                }
            });
        });
        return summary;
    }

    constructor(private zone: NgZone) {
        SseService.innerZone = this.zone;
    }

    observeMessages(): Observable<string> {
        return SseService.o;
    }

}

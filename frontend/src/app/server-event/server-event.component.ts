import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { NotificationService, Notification, NotificationType } from 'patternfly-ng';
import { SseService } from './sse.service';
import { Subscription } from 'rxjs';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-server-event',
    templateUrl: './server-event.component.html',
    styleUrls: ['./server-event.component.css']
})
export class ServerEventComponent implements OnInit, OnDestroy {
    private sseStream: Subscription;
    notifications: Notification[];

    constructor(private notificationService: NotificationService, private sseService: SseService) { }

    ngOnInit() {
        this.notifications = this.notificationService.getNotifications();
        this.sseStream = this.sseService.observeMessages()
                        .subscribe(message => {
                            this.notificationService.message(NotificationType.INFO, '', message, false, null, null);
                        });
    }

    ngOnDestroy() {
        if (this.sseStream) {
            this.sseStream.unsubscribe();
        }
    }
}

import { Component, OnDestroy, HostListener } from '@angular/core';
import { IssueService } from './issue/shared/issue.service';
import { PatchService } from './patch/shared/patch.service';
import { ReleaseService } from './release/shared/release.service';
import { SseService } from './server-event/sse.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    title = 'frontend';

    constructor(private issueService: IssueService, private patchService: PatchService, private releaseService: ReleaseService,
        private sseService: SseService) { }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event: any) {
        this.sseService.close();
    }

}

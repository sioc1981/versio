import { Component, OnDestroy, HostListener, OnInit } from '@angular/core';
import { IssueService } from './issue/shared/issue.service';
import { PatchService } from './patch/shared/patch.service';
import { ReleaseService } from './release/shared/release.service';
import { SseService } from './server-event/sse.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'frontend';

    constructor(private issueService: IssueService, private patchService: PatchService, private releaseService: ReleaseService,
        private sseService: SseService, private localeService: BsLocaleService) { }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event: any) {
        this.sseService.close();
    }

    ngOnInit(): void {
        this.localeService.use('fr');
    }
}

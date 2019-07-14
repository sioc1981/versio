import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    WizardEvent, EmptyStateConfig, Action, ActionConfig, CopyService
} from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';
import { IssueService } from './shared/issue.service';
import { IssueExtended } from './shared/issue.model';

enum ReleaseDetailTab {
    OVERVIEW,
    RELEASE_NOTE,
    PATCHES,
    ALL_ISSUES
}

@Component({
    selector: 'app-issue-detail',
    templateUrl: './issue-detail.component.html',
    styleUrls: ['./issue-detail.component.less']
})
export class IssueDetailComponent implements OnInit, OnDestroy {
    @ViewChild('updateIssue') updateIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    ReleaseDetailTabEnum = ReleaseDetailTab;

    issueReference: string;

    loading = true;
    loadingFailed = false;

    errorConfig: EmptyStateConfig;

    globalActionConfig: ActionConfig;
    actionConfig: ActionConfig;

    issueExtended: IssueExtended;

    private subscriptions: Subscription[] = [];
    constructor(private issueService: IssueService, private route: ActivatedRoute, private modalService: BsModalService,
        private auth: AuthenticationService, private loc: Location, private copyService: CopyService) { }

    ngOnInit() {
        this.errorConfig = {
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Error'
        } as EmptyStateConfig;

        this.actionConfig = {
            primaryActions: [{
                id: 'copyURL',
                title: 'Copy URL',
                tooltip: 'Copy URL with current filters'
            }]
        } as ActionConfig;

        this.globalActionConfig = {
                    primaryActions: [{
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            }]
        } as ActionConfig;

        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.globalActionConfig.primaryActions.push({
                        id: 'editIssue',
                        title: 'Edit Issue',
                        tooltip: 'Edit issue'
                    });
            }
        });

        this.route.paramMap.subscribe(params => {
            this.issueReference = params.get('ref');
            if (params.has('ref')) {
                this.reloadData();
            }
        });
    }

    /**
    * Clean up subscriptions
    */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }


    reloadData(): void {
        this.loading = true;
        this.subscriptions.push(this.issueService.searchIssueFull(this.issueReference)
            .subscribe(issueExtended => {
                    this.issueExtended = issueExtended;
                },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    handleAction(action: Action, item?: any): void {
        if (action.id === 'copyURL') {
            this.copyURL();
        } else {
            console.log('handleAction: unknown action: ' + action.id);
        }
    }

    copyURL() {
        const angularRoute = this.loc.path();
        const fullUrl = window.location.href;
        const domainAndApp = fullUrl.replace(angularRoute, '');
        let urlToCopy = domainAndApp;
        this.route.snapshot.url.forEach(us => {
            urlToCopy = urlToCopy.concat('/', us.path);
        });
        this.copyService.copy(urlToCopy);
    }


    onWizardClose(releaseFullChanged: any) {
        if (releaseFullChanged) {
            this.reloadData();
        }
        this.modalRef.hide();
    }
}

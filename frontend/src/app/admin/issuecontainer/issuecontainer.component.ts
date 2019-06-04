import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionConfig, Action } from 'patternfly-ng';
import { IssueContainerService } from './shared/issue-container.service';
import { IssueContainer } from './shared/issue-container.model';
import { ISSUE_CONSTANT } from 'src/app/issue/shared/issue.constant';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-issuecontainer',
    templateUrl: './issuecontainer.component.html',
    styleUrls: ['./issuecontainer.component.less']
})
export class IssueContainerComponent implements OnInit, OnDestroy {
    issueContainerActionConfig: ActionConfig;

    items = [
        {
            id: 'MANTIS',
            name: 'Mantis',
            url: ISSUE_CONSTANT.constainer_urls.MANTIS
        }, {
            id: 'JIRA',
            name: 'Jira',
            url: ISSUE_CONSTANT.constainer_urls.JIRA
        }
    ];

    private subscriptions: Subscription[] = [];

    constructor(private issueContainerService: IssueContainerService) { }

    ngOnInit() {

        this.issueContainerActionConfig = {
            primaryActions: [{
                id: 'save',
                title: 'Save',
                tooltip: 'Save Issue Container'
            }]
        } as ActionConfig;

    }

    /**
  * Clean up subscriptions
  */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    handleAction(action: Action, item?: IssueContainer): void {
        if (action.id === 'save') {
            this.subscriptions.push(this.issueContainerService.updateIssueContainer(item)
                .subscribe(_ => {
                    item.updated = true;
                }, _ => {
                    item.updated = false;
                }));
        } else {
            console.log('handleAction: unknown action: ' + action.id);
        }
    }

}

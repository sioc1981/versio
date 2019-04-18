import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Issue } from './shared/Issue';
import { IssueService } from './shared/issue.service';
import { WizardEvent } from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-issue',
    templateUrl: './issue.component.html',
    styleUrls: ['./issue.component.less']
})
export class IssueComponent implements OnInit, OnDestroy {
     @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    issues: Issue[];

        private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getIssues();
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getIssues(): void {
        this.subscriptions.push(this.issueService.getIssues()
            .subscribe(newIssues => this.issues = newIssues));
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

}

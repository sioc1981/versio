import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Issue } from './shared/Issue';
import { IssueService } from './shared/issue.service';
import { WizardEvent } from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-issue',
    templateUrl: './issue.component.html',
    styleUrls: ['./issue.component.less']
})
export class IssueComponent implements OnInit {
     @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    issues: Issue[];

    constructor(private issueService: IssueService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getIssues();
    }

    getIssues(): void {
        this.issueService.getIssues()
            .subscribe(newIssues => this.issues = newIssues);
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        console.log('openModal');
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        console.log('openModal: ' + this.modalRef );
    }

}

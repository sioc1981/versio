import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
    TemplateRef,
    EventEmitter,
    Output
} from '@angular/core';

import { ReleaseComponent } from './release.component';
import { WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep, WizardStepComponent,
    ListConfig, ListEvent } from 'patternfly-ng';
import { ReleaseService } from './shared/release.service';
import { Subscription } from 'rxjs';
import { now } from 'd3';
import { ReleaseFull } from './shared/release.model';
import { Issue } from '../issue/shared/issue.model';
import { IssueService } from '../issue/shared/issue.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-release-create',
    templateUrl: './release-create.component.html',
    styleUrls: ['./release-create.component.css']
})
export class ReleaseCreateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @ViewChild('createIssue') createIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    @Output() close = new EventEmitter<ReleaseFull>();

    data: any = {
        release: { version: {}, buildDate: new Date() },
        issues: []
    };
    deployComplete = false;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;

    // Wizard Step 2
    step2Config: WizardStepConfig;
    issues: Issue[];
    selectIssue: Issue;
    issuesListConfig: ListConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    wizardExample: ReleaseComponent;

    private subscriptions: Subscription[] = [];

    constructor(private releaseService: ReleaseService, private issueService: IssueService, private modalService: BsModalService) { }

    ngOnInit(): void {
        this.getIssues();
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Select version'
        } as WizardStepConfig;

        // Step 2
        this.step2Config = {
            id: 'step2',
            priority: 1,
            title: 'select issues'
        } as WizardStepConfig;

        // Step 3
        this.step3Config = {
            id: 'step3',
            priority: 1,
            title: 'create'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
            //   title: 'Wizard Title',
            //   sidebarStyleClass: 'example-wizard-sidebar',
            //   stepStyleClass: 'example-wizard-step'
        } as WizardConfig;

        this.setNavAway(false);

        this.issuesListConfig = {
            dblClick: false,
            multiSelect: false,
            selectItems: false,
            selectionMatchProp: 'reference',
            showCheckbox: true,
            showRadioButton: false,
            useExpandItems: false
        } as ListConfig;

        this.setNavAway(false);
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    // Methods
    getIssues(): void {
        this.subscriptions.push(this.issueService.getIssues()
            .subscribe(newIssues => this.issues = newIssues.sort((i1, i2) => i2.reference.localeCompare(i1.reference))));
    }


    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'step3') {
            this.closeWizard(this.data as ReleaseFull);
        }
    }

    closeWizard(releaseFull?: ReleaseFull) {
        this.close.emit(releaseFull);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.subscriptions.push(this.releaseService.addRelease(this.data as ReleaseFull)
            .subscribe(_ => {
                this.deployComplete = true;
                this.deploySuccess = true;
            }, _ => {
                this.deployComplete = true;
                this.deploySuccess = false;
            }));
    }

    stepChanged($event: WizardEvent) {
        const flatSteps = flattenWizardSteps(this.wizard);
        const currentStep = flatSteps.filter(step => step.config.id === $event.step.config.id);
        if (currentStep && currentStep.length > 0) {
            currentStep[0].config.nextEnabled = true;
        }
        if ($event.step.config.id === 'step1') {
            this.updateName();
        } else if ($event.step.config.id === 'step2') {
            this.updateIssues();
        } else if ($event.step.config.id === 'step3') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateName(): void {
        this.step1Config.nextEnabled = (this.data.release !== undefined && this.data.release.version !== undefined
            && this.data.release.version.versionNumber !== undefined
            && this.data.release.version.versionNumber.length > 0);
        this.setNavAway(this.step1Config.nextEnabled);
    }

    updateIssues(): void {
        this.step2Config.nextEnabled = (this.data.issues !== undefined && this.data.issues.length > 0);
        this.setNavAway(this.step2Config.nextEnabled);
    }

    // Private

    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;
        this.step2Config.allowClickNav = allow;
        this.step3Config.allowClickNav = allow;
    }

    handleIssuesSelectionChange($event: ListEvent): void {
        this.data.issues = $event.selectedItems;
        this.updateIssues();
    }

    onSelectIssue(event: TypeaheadMatch): void {
        this.addIssue(event.item);
        this.selectIssue = null;
    }

    onCreateIssueClose(issue: Issue) {
        this.addIssue(issue);
        this.modalRef.hide();
    }

    private addIssue(issue: Issue) {
        if (issue && this.data.issues.filter(i => i.reference === issue.reference).length === 0) {
            issue.selected = true;
            this.data.issues.push(issue);
            this.updateIssues();
        }
    }

    openCreateIssue() {
        this.modalRef = this.modalService.show(this.createIssueTemplate, { class: 'modal-lg' });
    }

}

function flattenWizardSteps(wizard: WizardComponent): WizardStep[] {
    const flatWizard: WizardStep[] = [];
    wizard.steps.forEach((step: WizardStepComponent) => {
        if (step.hasSubsteps) {
            step.steps.forEach(substep => {
                flatWizard.push(substep);
            });
        } else {
            flatWizard.push(step);
        }
    });
    return flatWizard;
}

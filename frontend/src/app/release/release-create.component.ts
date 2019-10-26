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

import {
    WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep, WizardStepComponent,
    ListConfig, ListEvent
} from 'patternfly-ng';
import { ReleaseService } from './shared/release.service';
import { IssueService } from '../issue/shared/issue.service';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { Release, ReleaseFull } from './shared/release.model';
import { Issue } from '../issue/shared/issue.model';
import { PlatformHistory } from '../shared/platform.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { APPLICATION_USER_CONSTANT } from '../admin/applicationuser/shared/application-user.constant';
import { ApplicationUser } from '../admin/applicationuser/shared/application-user.model';
import { MdEditorOption } from 'ngx-markdown-editor';

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
    step1aConfig: WizardStepConfig;
    step1bConfig: WizardStepConfig;

    // Wizard Step 2
    step2Config: WizardStepConfig;
    step2aConfig: WizardStepConfig;
    step2bConfig: WizardStepConfig;
    step2cConfig: WizardStepConfig;
    step2dConfig: WizardStepConfig;
    step2eConfig: WizardStepConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard Step Final
    stepFinalConfig: WizardStepConfig;
    stepFinalReviewConfig: WizardStepConfig;
    stepFinalDeployConfig: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;

    commentOptions: MdEditorOption = {};


    issues: Issue[] = [];
    issuesListConfig: ListConfig;
    selectIssue: Issue;
    selectedIssues: Issue[] = [];

    applicationUsers: ApplicationUser[] = [];

    private subscriptions: Subscription[] = [];

    constructor(private releaseService: ReleaseService, private issueService: IssueService, private modalService: BsModalService) { }

    ngOnInit(): void {
        this.getIssues();
        this.applicationUsers = Array.from(APPLICATION_USER_CONSTANT.applicationUserSummaries)
            .filter(au => au !== undefined)
            .sort((aua, aub) => aub.name.localeCompare(aua.name));

        this.data.release.buildDate = new Date();
        this.data.release.qualification = new PlatformHistory();
        this.data.release.keyUser = new PlatformHistory();
        this.data.release.pilot = new PlatformHistory();
        this.data.release.production = new PlatformHistory();

        this.commentOptions = {
            enablePreviewContentClick: false,
            resizable: false,
            showPreviewPanel: false
        };

        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Information'
        } as WizardStepConfig;
        this.step1aConfig = {
            id: 'step1a',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 0,
            title: 'Identification'
        } as WizardStepConfig;
        this.step1bConfig = {
            id: 'step1b',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 1,
            title: 'Release Note'
        } as WizardStepConfig;

        // Step 2
        this.step2Config = {
            id: 'step2',
            priority: 0,
            title: 'Dates'
        } as WizardStepConfig;
        this.step2aConfig = {
            id: 'step2a',
            expandReviewDetails: true,
            nextEnabled: true,
            priority: 0,
            title: 'Build'
        } as WizardStepConfig;
        this.step2bConfig = {
            id: 'step2b',
            expandReviewDetails: true,
            nextEnabled: true,
            priority: 1,
            title: 'Qualification'
        } as WizardStepConfig;
        this.step2cConfig = {
            id: 'step2c',
            expandReviewDetails: true,
            nextEnabled: true,
            priority: 1,
            title: 'Key User'
        } as WizardStepConfig;
        this.step2dConfig = {
            id: 'step2d',
            expandReviewDetails: true,
            nextEnabled: true,
            priority: 1,
            title: 'Pilot'
        } as WizardStepConfig;
        this.step2eConfig = {
            id: 'step2e',
            expandReviewDetails: true,
            nextEnabled: true,
            priority: 1,
            title: 'Production'
        } as WizardStepConfig;

        // Step 3
        this.step3Config = {
            id: 'step3',
            expandReviewDetails: true,
            priority: 0,
            title: 'Comment'
        } as WizardStepConfig;

        // Step Final
        this.stepFinalConfig = {
            id: 'stepFinal',
            priority: 2,
            title: 'Review'
        } as WizardStepConfig;
        this.stepFinalReviewConfig = {
            id: 'stepFinalReview',
            nextEnabled: false,
            priority: 0,
            title: 'Summary'
        } as WizardStepConfig;
        this.stepFinalDeployConfig = {
            id: 'stepFinalDeploy',
            nextEnabled: false,
            priority: 1,
            title: 'Deploy'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
            //   title: 'Wizard Title',
            //   sidebarStyleClass: 'example-wizard-sidebar',
            //   stepStyleClass: 'example-wizard-step'
        } as WizardConfig;

        this.issuesListConfig = {
            dblClick: false,
            multiSelect: true,
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
        if ($event.step.config.id === 'stepFinalDeploy') {
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
        if ($event.step.config.id === 'step1a') {
            this.updateName();
        } else if ($event.step.config.id === 'step1b') {
            this.updateIssues();
        } else if ($event.step.config.id === 'stepFinalReview') {
            this.wizardConfig.nextTitle = 'Deploy';
        } else if ($event.step.config.id === 'stepFinalDeploy') {
            this.wizardConfig.nextTitle = 'Close';
        } else {
            this.wizardConfig.nextTitle = 'Next >';
        }
    }

    updateName(): void {
        this.step1aConfig.nextEnabled = (this.data.release !== undefined && this.data.release.version !== undefined
            && this.data.release.version.versionNumber !== undefined
            && this.data.release.version.versionNumber.length > 0);
        this.setNavAway(this.step1aConfig.nextEnabled);
    }

    updateIssues(): void {
        this.step1bConfig.nextEnabled = (this.data.issues !== undefined && this.data.issues.length > 0);
        this.setNavAway(this.step1bConfig.nextEnabled);
    }

    // Private

    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;
        this.step1aConfig.allowClickNav = allow;
        this.step1bConfig.allowClickNav = allow;

        this.step2Config.allowClickNav = allow;
        this.step2aConfig.allowClickNav = allow;
        this.step2bConfig.allowClickNav = allow;
        this.step2cConfig.allowClickNav = allow;
        this.step2dConfig.allowClickNav = allow;
        this.step2eConfig.allowClickNav = allow;

        this.step3Config.allowClickNav = allow;

        this.stepFinalConfig.allowClickNav = allow;
        this.stepFinalReviewConfig.allowClickNav = allow;
        this.stepFinalDeployConfig.allowClickNav = allow;
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

        if (issue) {
            const exisingIssues = this.selectedIssues.filter(i => i.reference === issue.reference);
            if (exisingIssues.length === 0) {
                this.selectedIssues.push(issue);
            } else {
                exisingIssues.forEach(i => i.selected = true);
            }
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

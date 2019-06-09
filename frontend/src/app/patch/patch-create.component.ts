import {
    Component,
    Host,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
    TemplateRef,
    EventEmitter,
    Output
} from '@angular/core';

import {
    WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep,
    WizardStepComponent, ListConfig, ListEvent
} from 'patternfly-ng';
import { PatchService } from './shared/patch.service';
import { ReleaseService } from '../release/shared/release.service';
import { IssueService } from '../issue/shared/issue.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { Subscription } from 'rxjs';
import { Release } from '../release/shared/release.model';
import { Issue } from '../issue/shared/issue.model';
import { Patch } from './shared/patch.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PlatformHistory } from '../shared/platform.model';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch-create',
    templateUrl: './patch-create.component.html',
    styleUrls: ['./patch-create.component.css']
})
export class PatchCreateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @ViewChild('createIssue') createIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    @Output() close = new EventEmitter<Patch>();

    data: any = {
        issues: []
    };
    deployComplete = true;
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
    step3aConfig: WizardStepConfig;
    step3bConfig: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    maxStepId = 'step1';

    releases: Release[];
    releaseVersion: String;

    issues: Issue[] = [];
    issuesListConfig: ListConfig;
    selectIssue: Issue;
    selectedIssues: Issue[] = [];

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private patchService: PatchService, private releaseService: ReleaseService,
        private modalService: BsModalService) {
    }

    ngOnInit(): void {
        this.getVersions();
        this.getIssues();

        this.data.buildDate = new Date();
        this.data.qualification = new PlatformHistory();
        this.data.keyUser = new PlatformHistory();
        this.data.pilot = new PlatformHistory();
        this.data.production = new PlatformHistory();

        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Information'
        } as WizardStepConfig;
        this.step1aConfig = {
            id: 'step1a',
            expandReviewDetails: true,
            nextEnabled: true,
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
            nextEnabled: false,
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
            priority: 2,
            title: 'Review'
        } as WizardStepConfig;
        this.step3aConfig = {
            id: 'step3a',
            nextEnabled: false,
            priority: 0,
            title: 'Summary'
        } as WizardStepConfig;
        this.step3bConfig = {
            id: 'step3b',
            nextEnabled: false,
            priority: 1,
            title: 'Deploy'
        } as WizardStepConfig;

        this.maxStepId = this.step1Config.id;

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
        this.updateVersion();
        this.updateIssues();
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getVersions(): void {
        this.subscriptions.push(this.releaseService.getReleases()
            .subscribe(newReleases => this.releases = newReleases));
    }

    getIssues(): void {
        this.subscriptions.push(this.issueService.getIssues()
            .subscribe(newIssues => this.issues = newIssues.sort((i1, i2) => i2.reference.localeCompare(i1.reference))));
    }


    // Methods
    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'step3') {
            this.closeWizard(this.data as Patch);
        }
    }

    closeWizard(patch?: Patch) {
        this.close.emit(patch);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.data.buildDate = new Date();
        this.subscriptions.push(this.patchService.addPatch(this.data as Patch)
            .subscribe(_ => {
                this.deployComplete = true;
                this.deploySuccess = true;
            }, _ => {
                this.deployComplete = true;
                this.deploySuccess = false;
            }));
    }

    stepChanged($event: WizardEvent) {
        this.maxStepId = this.maxStepId < $event.step.config.id ? $event.step.config.id : this.maxStepId;
        console.log('maxStepId: ', this.maxStepId);
        const flatSteps = flattenWizardSteps(this.wizard);
        const currentStep = flatSteps.filter(step => step.config.id === $event.step.config.id);
        if (currentStep && currentStep.length > 0) {
            currentStep[0].config.nextEnabled = true;
        }
        if ($event.step.config.id === 'step1a') {
            this.updateVersion();
        } else if ($event.step.config.id === 'step1b') {
            this.updateIssues();
        } else if ($event.step.config.id === 'step3a') {
            this.wizardConfig.nextTitle = 'Deploy';
        } else if ($event.step.config.id === 'step3b') {
            this.wizardConfig.nextTitle = 'Close';
        } else {
            this.wizardConfig.nextTitle = 'Next >';
        }
    }

    updateVersion(): void {
        this.step1aConfig.nextEnabled = (this.data.release !== undefined && this.data.sequenceNumber !== undefined
            && this.data.sequenceNumber.trim().length > 0);
        this.step1aConfig.allowClickNav = this.step1aConfig.nextEnabled;
        this.setNavAway(this.step1aConfig.nextEnabled);
    }

    updateIssues(): void {
        console.log('issues: ', this.data.issues);
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
        this.step3aConfig.allowClickNav = allow;
        this.step3bConfig.allowClickNav = allow;
    }

    handleIssuesSelectionChange($event: ListEvent): void {
        this.data.issues = $event.selectedItems;
        this.updateIssues();
    }

    onVersionChange(newValue: string): void {
        if (!newValue || newValue.trim().length === 0) {
            this.data.release = undefined;
            this.updateVersion();
        }
    }

    onSelectVersion(event: TypeaheadMatch): void {
        this.data.release = event.item;
        this.updateVersion();
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
        if (issue && this.selectedIssues.filter(i => i.reference === issue.reference).length === 0) {
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

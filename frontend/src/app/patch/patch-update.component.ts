import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
} from '@angular/core';

import {
    WizardStepComponent, WizardStep, WizardComponent, WizardEvent, WizardStepConfig, WizardConfig,
    ListConfig, ListEvent
} from 'patternfly-ng';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { PatchService } from './shared/patch.service';
import { ReleaseService } from '../release/shared/release.service';
import { IssueService } from '../issue/shared/issue.service';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { Release } from '../release/shared/release.model';
import { Issue } from '../issue/shared/issue.model';
import { Patch } from './shared/patch.model';
import { PlatformHistory } from '../shared/platform.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch-update',
    templateUrl: './patch-update.component.html',
    styleUrls: ['./patch-update.component.css']
})
export class PatchUpdateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @ViewChild('createIssue') createIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;
    @Input() patch: Patch;
    @Output() close = new EventEmitter<Patch>();

    data: any = {};
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

    releases: Release[];
    releaseListConfig: ListConfig;
    releaseVersion: String;

    issues: Issue[];
    issuesListConfig: ListConfig;
    selectIssue: Issue;

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private patchService: PatchService, private releaseService: ReleaseService,
        private modalService: BsModalService) { }

    ngOnInit(): void {
        this.data = cloneDeep(this.patch);
        this.data.buildDate = new Date(this.patch.buildDate);
        this.data.packageDate = this.initDate(this.patch.packageDate);
        this.data.qualification = this.initPlatformHistory(this.data.qualification);
        this.data.keyUser = this.initPlatformHistory(this.data.keyUser);
        this.data.pilot = this.initPlatformHistory(this.data.pilot);
        this.data.production = this.initPlatformHistory(this.data.production);
        this.data.issues.forEach(i => i.selected = true);
        this.releaseVersion = this.data.release.version.versionNumber;
        this.getVersions();
        this.getIssues();

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
            title: 'Release'
        } as WizardStepConfig;
        this.step1bConfig = {
            id: 'step1b',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 1,
            title: 'Issues'
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

        // Wizard
        this.wizardConfig = {
            title: 'Edit patch : ' + this.patch.release.version.versionNumber + ' / ' + this.patch.sequenceNumber,
            sidebarStyleClass: 'example-wizard-sidebar',
            stepStyleClass: 'example-wizard-step'
        } as WizardConfig;

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
        this.updateVersion();
        this.updateIssues();

    }

    /**
       * Clean up subscriptions
       */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    initDate(date: Date): Date {
        return date ? new Date(date) : date;
    }

    initPlatformHistory(platformHistory: PlatformHistory): PlatformHistory {
        if (platformHistory) {
            platformHistory.deployDate = this.initDate(platformHistory.deployDate);
            platformHistory.validationDate = this.initDate(platformHistory.validationDate);
            platformHistory.undeployDate = this.initDate(platformHistory.undeployDate);
        } else {
            platformHistory = new PlatformHistory();
        }
        return platformHistory;
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
        if ($event.step.config.id === 'step3b') {
            this.closeWizard(this.data as Patch);
        }
    }

    closeWizard(patch?: Patch) {
        this.close.emit(patch);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.subscriptions.push(this.patchService.updatePatch(this.data as Patch)
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
            this.updateVersion();
        } else if ($event.step.config.id === 'step3a') {
            this.wizardConfig.nextTitle = 'Deploy';
        } else if ($event.step.config.id === 'step3b') {
            this.wizardConfig.nextTitle = 'Close';
        } else {
            this.wizardConfig.nextTitle = 'Next >';
        }
    }


    updateVersion(): void {
        this.step1aConfig.nextEnabled = (this.data.release !== undefined);
        this.setNavAway(this.step1Config.nextEnabled);
    }

    updateIssues(): void {
        this.step1bConfig.nextEnabled = (this.data.issues !== undefined && this.data.issues.length > 0);
        this.setNavAway(this.step2Config.nextEnabled);
    }

    // Private

    private setNavAway(allow: boolean) {
        this.step1aConfig.allowNavAway = allow;

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

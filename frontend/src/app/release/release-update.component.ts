import {
    Component,
    Host,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';

import { ReleaseComponent } from './release.component';
import {
    WizardStepComponent, WizardStep, WizardComponent, WizardEvent, WizardStepConfig, WizardConfig,
    ListConfig, ListEvent
} from 'patternfly-ng';
import { Release } from './shared/Release';
import { ReleaseService } from './shared/release.service';
import { IssueService } from '../issue/shared/issue.service';
import { Issue } from '../issue/shared/Issue';
import { cloneDeep } from 'lodash';
import { ReleaseFull } from './shared/ReleaseFull';
import { PlatformHistory } from '../shared/PlatformHistory';


@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-release-update',
    templateUrl: './release-update.component.html',
    styleUrls: ['./release-update.component.css']
})
export class ReleaseUpdateComponent implements OnInit {
    @ViewChild('wizard') wizard: WizardComponent;

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
    releaseComponent: ReleaseComponent;

    releases: Release[];
    releaseListConfig: ListConfig;
    releaseVersion: String;

    issues: Issue[];

    issuesListConfig: ListConfig;

    release: ReleaseFull;

    constructor(private issueService: IssueService, private releaseService: ReleaseService,
        @Host() releaseComponent: ReleaseComponent) {
        this.releaseComponent = releaseComponent;
    }

    ngOnInit(): void {
        this.release = this.releaseComponent.selectedRelease;
        this.data = cloneDeep(this.release);
        this.data.release.buildDate = new Date(this.release.release.buildDate);
        this.data.release.packageDate = this.initDate(this.release.release.packageDate);
        this.data.release.qualification = this.initPlatformHistory(this.data.release.qualification);
        this.data.release.keyUser = this.initPlatformHistory(this.data.release.keyUser);
        this.data.release.pilot = this.initPlatformHistory(this.data.release.pilot);
        this.data.release.production = this.initPlatformHistory(this.data.release.production);
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
            nextEnabled: false,
            priority: 0,
            title: 'Build'
        } as WizardStepConfig;
        this.step2bConfig = {
            id: 'step2b',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 1,
            title: 'Qualification'
        } as WizardStepConfig;
        this.step2cConfig = {
            id: 'step2c',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 1,
            title: 'Key User'
        } as WizardStepConfig;
        this.step2dConfig = {
            id: 'step2d',
            expandReviewDetails: true,
            nextEnabled: false,
            priority: 1,
            title: 'Pilot'
        } as WizardStepConfig;
        this.step2eConfig = {
            id: 'step2e',
            expandReviewDetails: true,
            nextEnabled: false,
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
            title: 'Wizard Title',
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

    initDate(date: Date): Date {
        return date ? new Date(date) : date;
    }

    initPlatformHistory(platformHistory: PlatformHistory): PlatformHistory {
        if (platformHistory) {
            platformHistory.deployDate = this.initDate(platformHistory.deployDate);
            platformHistory.validationDate = this.initDate(platformHistory.validationDate);
        } else {
            platformHistory = new PlatformHistory();
        }
        return platformHistory;
    }

    getVersions(): void {
        this.releaseService.getReleases()
            .subscribe(newReleases => this.releases = newReleases);
    }

    getIssues(): void {
        this.issueService.getIssues()
            .subscribe(newIssues => this.issues = this.preSelect(newIssues));
    }


    preSelect(issues: Issue[]): Issue[] {
        const dataIssueIds: string[] = this.data.issues.map(i => i.reference);
        issues.forEach(issue => {
            if (dataIssueIds.indexOf(issue.reference) !== -1) {
                issue.selected = true;
            }
        });
        return issues;
    }

    // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'step3b') {
            this.releaseComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.releaseService.updateRelease(this.data as ReleaseFull)
            .subscribe(_ => {
                this.releaseComponent.getReleases();
                this.deployComplete = true;
                this.deploySuccess = true;
            }, _ => {
                this.deployComplete = true;
                this.deploySuccess = false;
            });
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
        this.setNavAway(this.step1aConfig.nextEnabled);
    }

    updateIssues(): void {
        this.step1bConfig.nextEnabled = (this.data.issues !== undefined && this.data.issues.length > 0);
        this.setNavAway(this.step2Config.nextEnabled);
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

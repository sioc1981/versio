import {
    Component,
    Host,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';

import { PatchComponent } from './patch.component';
import {
    WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep,
    WizardStepComponent, ListConfig, ListEvent
} from 'patternfly-ng';
import { Patch } from './shared/Patch';
import { PatchService } from './shared/patch.service';
import { ReleaseService } from '../release/shared/release.service';
import { Release } from '../release/shared/Release';
import { Issue } from '../issue/shared/Issue';
import { IssueService } from '../issue/shared/issue.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { Subscription } from 'rxjs';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch-create',
    templateUrl: './patch-create.component.html',
    styleUrls: ['./patch-create.component.css']
})
export class PatchCreateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;

    data: any = {};
    deployComplete = true;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;
    releases: Release[];
    releaseVersion: String;

    // Wizard Step 2
    step2Config: WizardStepConfig;
    issues: Issue[];

    issuesListConfig: ListConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    patchComponent: PatchComponent;

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private patchService: PatchService, private releaseService: ReleaseService,
        @Host() patchComponent: PatchComponent) {
        this.patchComponent = patchComponent;
    }

    ngOnInit(): void {
        this.getVersions();
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
            .subscribe(newIssues => this.issues = newIssues));
    }


    // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'step3') {
            this.patchComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.data.buildDate = new Date();
        this.subscriptions.push(this.patchService.addPatch(this.data as Patch)
            .subscribe(_ => {
                this.patchComponent.getPatchs();
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
            this.updateVersion();
        } else if ($event.step.config.id === 'step2') {
            this.updateIssues();
        } else if ($event.step.config.id === 'step3') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateVersion(): void {
        this.step1Config.nextEnabled = (this.data.release !== undefined);
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
        console.log(JSON.stringify($event.selectedItems));
        this.data.issues = $event.selectedItems;
        this.updateIssues();
    }

    onSelect(event: TypeaheadMatch): void {
        this.data.release = event.item;
        this.updateVersion();
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

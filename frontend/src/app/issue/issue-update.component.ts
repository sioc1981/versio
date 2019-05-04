import { Component, OnInit, OnDestroy, ViewChild, Host } from '@angular/core';
import { WizardComponent, WizardStepConfig, WizardConfig, WizardStepComponent, WizardStep, WizardEvent } from 'patternfly-ng';
import { IssueComponent } from './issue.component';
import { IssueService } from './shared/issue.service';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Issue } from './shared/issue.model';

@Component({
    selector: 'app-issue-update',
    templateUrl: './issue-update.component.html',
    styleUrls: ['./issue-update.component.less']
})
export class IssueUpdateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;

    data: any = {};
    deployComplete = true;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    issueComponent: IssueComponent;


    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, @Host() issueComponent: IssueComponent) {
        this.issueComponent = issueComponent;
    }

    ngOnInit(): void {
        this.data = cloneDeep(this.issueComponent.selectedIssue);
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Edit issue'
        } as WizardStepConfig;

        // Step 3
        this.step3Config = {
            id: 'step3',
            priority: 1,
            title: 'Update'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
            title: 'Edit issue ' + this.issueComponent.selectedIssue.reference,
            //   sidebarStyleClass: 'example-wizard-sidebar',
            //   stepStyleClass: 'example-wizard-step'
        } as WizardConfig;

        this.setNavAway(false);
    }

    /**
        * Clean up subscriptions
        */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'step3') {
            this.issueComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;

        this.subscriptions.push(this.issueService.updateIssue(this.data as Issue)
            .subscribe(_ => {
                this.issueComponent.getIssues();
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
        } else if ($event.step.config.id === 'step3') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateName(): void {
        this.step1Config.nextEnabled = (this.data.reference !== undefined && this.data.reference.length > 0)
            && (this.data.description !== undefined && this.data.description.length > 0);
        this.setNavAway(this.step1Config.nextEnabled);
    }

    // Private

    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;

        this.step3Config.allowClickNav = allow;
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

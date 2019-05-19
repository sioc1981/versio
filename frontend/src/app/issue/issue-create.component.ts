import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
    EventEmitter,
    Output
} from '@angular/core';

import { WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep, WizardStepComponent } from 'patternfly-ng';
import { IssueService } from './shared/issue.service';
import { Subscription } from 'rxjs';
import { Issue } from './shared/issue.model';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-issue-create',
    templateUrl: './issue-create.component.html',
    styleUrls: ['./issue-create.component.less']
})
export class IssueCreateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @Output() close = new EventEmitter<Issue>();

    data: any = {};
    deployComplete = true;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService) {
    }

    ngOnInit(): void {
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Add new issue'
        } as WizardStepConfig;

        // Step 3
        this.step3Config = {
            id: 'step3',
            priority: 1,
            title: 'create'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
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
            this.closeWizard(this.deploySuccess ? this.data as Issue : undefined);
        }
    }

    closeWizard(issue?: Issue) {
        this.close.emit(issue);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;

        this.subscriptions.push(this.issueService.addIssue(this.data as Issue)
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
        } else if ($event.step.config.id === 'step3') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateName(): void {
        this.step1Config.nextEnabled = (this.data.reference !== undefined && this.data.reference.length > 0)
            && (this.data.description !== undefined && this.data.description.length > 0)
            && (this.data.container !== undefined && this.data.container.length > 0);
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

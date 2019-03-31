import {
  Component,
  Host,
  OnInit,
  ViewChild,
  Input,
  ViewEncapsulation
} from '@angular/core';

import { VersionComponent } from './version.component';
import { WizardComponent, WizardStepConfig, WizardConfig, WizardEvent, WizardStep, WizardStepComponent } from 'patternfly-ng';
import { Version } from './shared/Version';
import { VersionService } from './shared/version.service';

@Component({
    encapsulation: ViewEncapsulation.None,
  selector: 'app-version-create',
  templateUrl: './version-create.component.html',
  styleUrls: ['./version-create.component.css']
})
export class VersionCreateComponent implements OnInit {
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
  wizardExample: VersionComponent;

  constructor(private versionService: VersionService, @Host() wizardExample: VersionComponent) {
    this.wizardExample = wizardExample;
  }

  ngOnInit(): void {
      console.log('VersionCreateComponent on init');
    // Step 1
    this.step1Config = {
      id: 'step1',
      priority: 0,
      title: 'Add new version'
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
  }

  // Methods

  nextClicked($event: WizardEvent): void {
    if ($event.step.config.id === 'step3') {
      this.wizardExample.closeModal($event);
    }
  }

  startDeploy(): void {
    this.deployComplete = false;
    this.wizardConfig.done = true;

    // // Simulate a delay
    // setTimeout(() => {
    //   this.deployComplete = true;
    // }, 2500);
    console.log('Saving ' + JSON.stringify(this.data) );
    this.versionService.addVersion(this.data as Version)
    .subscribe( _ => {
        console.log('success');
      this.wizardExample.getVersions();
      this.deployComplete = true;
      this.deploySuccess = true;
    }, _ => {
        console.log('failed');
      this.deployComplete = true;
      this.deploySuccess = false;
    } );
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
    this.step1Config.nextEnabled = (this.data.versionNumber !== undefined && this.data.versionNumber.length > 0);
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

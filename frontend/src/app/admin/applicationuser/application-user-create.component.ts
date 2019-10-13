import { Component, OnInit, OnDestroy, ViewChild, Host, Output, EventEmitter } from '@angular/core';
import {
    WizardComponent, WizardStepConfig, ListConfig, PaginationConfig, WizardEvent, PaginationEvent, ListEvent,
    WizardStep, WizardStepComponent, WizardConfig
} from 'patternfly-ng';
import { FileItem, MineTypeEnum, InputFileOptions, DropTargetOptions, HttpClientUploadService } from '@wkoza/ngx-upload';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { ApplicationUser } from './shared/application-user.model';
import { ApplicationUserService } from './shared/application-user.service';
import { APP_CONSTANT } from 'src/app/app.constants';

@Component({
    selector: 'app-application-user-create',
    templateUrl: './application-user-create.component.html',
    styleUrls: ['./application-user-create.component.less']
})
export class ApplicationUserCreateComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @Output() close = new EventEmitter<ApplicationUser>();

    countries = APP_CONSTANT.countries;

    data: any = { country: this.countries[0] };
    deployComplete = true;
    deploySuccess = false;


    itemFile: FileItem;
    fileReader = new FileReader();

    errorMessage: string = null;
    errorLine = '0';

    private currentAcceptMimeType = [
        MineTypeEnum.Image_Gif,
        MineTypeEnum.Image_Jpeg,
        MineTypeEnum.Image_Png,
        MineTypeEnum.Image_SvgXml];

    optionsInput: InputFileOptions = {
        accept: this.currentAcceptMimeType,
        multiple: false
    };

    dndOptions: DropTargetOptions = {
        accept: this.currentAcceptMimeType,
        color: 'dropZoneColor',
        colorDrag: 'dropZoneColorDrag',
        colorDrop: 'dropZoneColorDrop',
        multiple: false
    };

    // Wizard Step 1
    step1Config: WizardStepConfig;

    // Wizard Step final
    stepFinalConfig: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;

    private subscriptions: Subscription[] = [];

    constructor(private applicationUserService: ApplicationUserService, public uploader: HttpClientUploadService) {
    }

    ngOnInit(): void {
        this.data = { country: this.countries[0] };
        this.itemFile = null;
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Add new application user'
        } as WizardStepConfig;

        // Step final
        this.stepFinalConfig = {
            id: 'stepFinal',
            priority: 1,
            title: 'create'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
        } as WizardConfig;

        this.setNavAway(false);

        this.fileReader.onload = (e) => {
            this.data['logo'] = this.fileReader.result;
             console.log('file canceled: ' + this.fileReader.result);
             console.log('file canceled: ' + e.target!['result']);
            this.updateName();
        };

        this.uploader.onCancel$.subscribe(
            (data: FileItem) => {
                console.log('file canceled: ' + data.file.name);

            });

        this.uploader.onDropError$.subscribe(
            (err) => {
                console.log('error during drop action: ', err);
            });

        this.uploader.onProgress$.subscribe(
            (data: any) => {
                console.log('upload file in progress: ', data.progress);

            });

        this.uploader.onSuccess$.subscribe(
            (data: any) => {
                console.log(`upload file successful:  ${data.item} ${data.body} ${data.status} ${data.headers}`);
            }
        );

        this.uploader.onAddToQueue$.subscribe(
            (data: any) => {
                console.log(`reset of our form`, data);
                this.itemFile = data;
                this.errorMessage = null;
                if (!this.currentAcceptMimeType.some((type: string) => type === data.file.type)) {
                    this.removeCurrentFileItem();
                    return;
                }
                this.data.logoMediaType = data.file.type;
                this.data.logoUpdateDate = new Date();
                this.updateName();
                this.fileReader.readAsDataURL(data.file);
            }
        );
    }

    /**
        * Clean up subscriptions
        */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'stepFinal') {
            this.closeWizard(this.deploySuccess ? this.data as ApplicationUser : undefined);
        }
    }

    closeWizard(issue?: ApplicationUser) {
        this.removeCurrentFileItem();
        this.close.emit(issue);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;

        this.subscriptions.push(this.applicationUserService.addApplicationUser(this.data as ApplicationUser)
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
        } else if ($event.step.config.id === 'stepFinal') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateName(): void {
        this.step1Config.nextEnabled = (this.data.name !== undefined && this.data.name.length > 0)
            && (this.data.country !== undefined && this.data.country.length > 0)
            && (this.data.logo !== undefined && this.data.logo.length > 0)
            && (this.data.logoMediaType !== undefined && this.data.logoMediaType.length > 0);
        this.setNavAway(this.step1Config.nextEnabled);
    }

    removeCurrentFileItem() {
        this.uploader.removeFromQueue(this.itemFile);
        this.uploader.onDropError$.next({ item: this.itemFile.file, errorAccept: true, errorMultiple: false });
        this.itemFile = null;
        delete this.data['logoMediaType'];
        delete this.data['logo'];
    }

    // Private
    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;
        this.stepFinalConfig.allowClickNav = allow;
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

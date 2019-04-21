import { Component, OnInit, OnDestroy, ViewChild, Host } from '@angular/core';
import { WizardComponent, WizardStepConfig, WizardConfig, WizardStepComponent, WizardStep, WizardEvent } from 'patternfly-ng';
import { IssueComponent } from './issue.component';
import { IssueService } from './shared/issue.service';
import { Subscription } from 'rxjs';
import { Issue } from './shared/Issue';
import { cloneDeep } from 'lodash';
import { FileItem, HttpClientUploadService, DropTargetOptions, InputFileOptions, MineTypeEnum } from '@wkoza/ngx-upload';

@Component({
    selector: 'app-issue-import',
    templateUrl: './issue-import.component.html',
    styleUrls: ['./issue-import.component.less']
})
export class IssueImportComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;

    data: any = {};

    issuesList: any[] = [];

    fileFormat: string;

    deployComplete = true;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;
    // Wizard Step 1
    step2Config: WizardStepConfig;

    // Wizard Step 3
    step3Config: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    issueComponent: IssueComponent;

    private fileReader = new FileReader();

    private cvsMimeType = [MineTypeEnum.Text_Csv];
    private jsonMimeType = [MineTypeEnum.Application_Json];
    private currentAcceptMimeType: MineTypeEnum[] = [];

    optionsInput: InputFileOptions = {
        multiple: false
    };

    dndOptions: DropTargetOptions = {
        color: 'dropZoneColor',
        colorDrag: 'dropZoneColorDrag',
        colorDrop: 'dropZoneColorDrop',
        multiple: false
    };

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, @Host() issueComponent: IssueComponent,
        public uploader: HttpClientUploadService) {
        this.issueComponent = issueComponent;
    }

    ngOnInit(): void {
        this.fileReader.onload = (e) => this.parseFile();
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Select data format'
        } as WizardStepConfig;

        // Step 2
        this.step2Config = {
            id: 'step2',
            priority: 0,
            title: 'Select File',
            nextEnabled: false
        } as WizardStepConfig;

        // Step 3
        this.step3Config = {
            id: 'step3',
            priority: 1,
            title: 'Update'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
            title: 'Importissue',
        } as WizardConfig;

        this.setNavAway(false);

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
                if (!this.currentAcceptMimeType.some((type: string) => type === data.file.type)
                    && !data.file.name.toLocaleUpperCase().endsWith('.' + this.fileFormat)) {
                    this.uploader.removeFromQueue(data);
                    this.uploader.onDropError$.next({ item: data.file, errorAccept: true, errorMultiple: false });
                    return;
                }

                this.fileReader.readAsText(data.file);
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
        if ($event.step.config.id === 'step3') {
            this.issueComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;

        // this.subscriptions.push(this.issueService.updateIssue(this.data as Issue)
        //     .subscribe(_ => {
        //         this.issueComponent.getIssues();
        //         this.deployComplete = true;
        //         this.deploySuccess = true;
        //     }, _ => {
        //         this.deployComplete = true;
        //         this.deploySuccess = false;
        //     }));
    }

    stepChanged($event: WizardEvent) {
        const flatSteps = flattenWizardSteps(this.wizard);
        const currentStep = flatSteps.filter(step => step.config.id === $event.step.config.id);
        if (currentStep && currentStep.length > 0) {
            currentStep[0].config.nextEnabled = true;
        }
        if ($event.step.config.id === 'step1') {
            this.updateFormatFile();
        } else if ($event.step.config.id === 'step3') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    updateFormatFile(): void {
        this.step1Config.nextEnabled = ['JSON', 'CSV'].indexOf(this.fileFormat) !== -1;
        if (this.step1Config.nextEnabled) {
            this.currentAcceptMimeType = this.fileFormat === 'CVS' ? this.cvsMimeType : this.jsonMimeType;
            this.dndOptions.accept = this.currentAcceptMimeType;
            this.optionsInput.accept = this.currentAcceptMimeType;
        }
    }

    // Private

    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;
        this.step2Config.allowClickNav = allow;
        this.step3Config.allowClickNav = allow;
    }

    upload(item: FileItem) {
        // item.upload({
        //     method: 'POST',
        //     url: 'ngx_upload_mock'
        // });
    }

    parseFile() {
        console.log('fileFormat: ', this.fileFormat)
        if (this.fileFormat === 'CSV') {
            this.parseCSV(this.fileReader.result);
        }
    }

    parseCSV(value: string | ArrayBuffer) {
        const lines = value.toString().split(/\r\n|\n/);
        lines.forEach(l => console.log(l));
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

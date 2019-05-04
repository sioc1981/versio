import { Component, OnInit, OnDestroy, ViewChild, Host } from '@angular/core';
import {
    WizardComponent, WizardStepConfig, WizardConfig, WizardStepComponent, WizardStep, WizardEvent, ListConfig,
    PaginationConfig, PaginationEvent, ListEvent
} from 'patternfly-ng';
import { IssueComponent } from './issue.component';
import { IssueService } from './shared/issue.service';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash';
import { FileItem, HttpClientUploadService, DropTargetOptions, InputFileOptions, MineTypeEnum } from '@wkoza/ngx-upload';
import { Issue } from './shared/issue.model';

@Component({
    selector: 'app-issue-import',
    templateUrl: './issue-import.component.html',
    styleUrls: ['./issue-import.component.less']
})
export class IssueImportComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;

    data: any = {};

    issuesList: Issue[] = [];
    issuesToDisplay: Issue[] = [];
    selectIssues: Issue[] = [];

    itemFile: FileItem;

    errorMessage: string = null;
    errorLine = '0';

    fileFormat: string;

    deployComplete = true;
    deploySuccess = false;

    // Wizard Step 1
    step1Config: WizardStepConfig;
    // Wizard Step 2
    step2Config: WizardStepConfig;
    // Wizard Step 3
    step3Config: WizardStepConfig;
    listConfig: ListConfig;
    paginationConfig: PaginationConfig;

    // Wizard Step 3
    stepFinaleConfig: WizardStepConfig;

    // Wizard
    wizardConfig: WizardConfig;
    issueComponent: IssueComponent;

    fileReader = new FileReader();

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

        this.data = {};
        this.itemFile = null;
        this.issuesList = [];
        this.errorMessage = null;

        this.fileReader.onload = (e) => this.parseFile();
        // Step 1
        this.step1Config = {
            id: 'step1',
            priority: 0,
            title: 'Select data format',
            nextEnabled: false
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
            priority: 0,
            title: 'Check in',
            nextEnabled: true
        } as WizardStepConfig;

        // Step Finale
        this.stepFinaleConfig = {
            id: 'stepFinale',
            priority: 1,
            title: 'Import'
        } as WizardStepConfig;

        // Wizard
        this.wizardConfig = {
            title: 'Importissue'
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
                this.itemFile = data;
                this.issuesList = [];
                this.errorMessage = null;
                if (!this.currentAcceptMimeType.some((type: string) => type === data.file.type)
                    && !data.file.name.toLocaleUpperCase().endsWith('.' + this.fileFormat)) {
                    this.removeCurrentFileItem();
                    return;
                }
                this.fileReader.readAsText(data.file);
            }
        );

        this.listConfig = {
            selectItems: false,
            showCheckbox: true
        } as ListConfig;

        this.paginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: 0
        } as PaginationConfig;
    }

    /**
        * Clean up subscriptions
        */
    ngOnDestroy(): void {
        this.uploader.removeAllFromQueue();
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'stepFinale') {
            if (this.deploySuccess) {
                this.issueComponent.getIssues();
            }
            this.issueComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.deploySuccess = false;

        this.selectIssues.forEach((i, index) => {
            this.subscriptions.push(this.issueService.addIssue(i)
                .subscribe(_ => {
                    this.deploySuccess = true;
                    this.issuesList[index].deploy = 'SUCCESS';
                }, _ => {
                    this.issuesList[index].deploy = 'FAILURE';
                }));
        }
        );
    }

    stepChanged($event: WizardEvent) {
        const flatSteps = flattenWizardSteps(this.wizard);
        const currentStep = flatSteps.filter(step => step.config.id === $event.step.config.id);
        if ($event.step.config.id === 'step1') {
            this.updateFormatFile();
        } else if ($event.step.config.id === 'stepFinale') {
            this.wizardConfig.nextTitle = 'Close';
        }
    }

    private setNavAway(allow: boolean) {
        this.step1Config.allowClickNav = allow;
        this.step2Config.allowClickNav = allow;
        this.step3Config.allowClickNav = allow;
        this.stepFinaleConfig.allowClickNav = allow;
    }

    removeCurrentFileItem() {
        this.uploader.removeFromQueue(this.itemFile);
        this.uploader.onDropError$.next({ item: this.itemFile.file, errorAccept: true, errorMultiple: false });
        this.itemFile = null;
    }

    updateFormatFile(): void {
        this.step1Config.nextEnabled = ['JSON', 'CSV'].indexOf(this.fileFormat) !== -1;
        this.removeCurrentFileItem();
        if (this.step1Config.nextEnabled) {
            this.currentAcceptMimeType = this.fileFormat === 'CSV' ? this.cvsMimeType : this.jsonMimeType;
            this.dndOptions.accept = this.currentAcceptMimeType;
            this.optionsInput.accept = this.currentAcceptMimeType;
        }
    }

    // Private

    parseFile() {
        if (this.fileFormat === 'CSV') {
            this.parseCSV(this.fileReader.result);
        } else {
            this.parseJSON(this.fileReader.result);
        }
    }

    parseCSV(value: string | ArrayBuffer) {
        const lines = value.toString().split(/\r\n|\n/);
        let i = 1;
        const isOk = lines.every(l => {
            if (l.length === 0) {
                i++;
                return true;
            }
            const data = l.split(';');
            let res = data.length >= 4;
            if (res) {
                const issue = new Issue();
                const container = data.shift();
                res = ['JIRA', 'MANTIS'].includes(container);
                if (res) {
                    issue.container = container;
                    issue.reference = data.shift();
                    issue.globalReference = data.shift();
                    // join by semicolon if description contains them
                    issue.description = data.join(';');
                    issue.selected = true;
                    this.issuesList.push(issue);
                } else {
                    this.errorLine = '' + i;
                    this.errorMessage = 'Wrong container at Line: ' + i;
                }
            } else {
                this.errorLine = '' + i;
                this.errorMessage = 'Wrong number of columns (' + data.length + ') at Line: ' + i;
            }
            if (res) {
                i++;
            }
            return res;
        });
        if (isOk) {
            this.step2Config.nextEnabled = true;
            this.issuesToDisplay = this.issuesList;
            this.selectIssues = this.issuesList;
            this.paginationConfig.pageNumber = 1;
            this.paginationConfig.totalItems = this.issuesList.length;
        }
    }

    parseJSON(value: string | ArrayBuffer) {
        const data = value.toString();
        try {
            const issues: Issue[] = JSON.parse(data);
            if (!Array.isArray(issues)) {
                this.errorLine = '1';
                this.errorMessage = 'Error at Line: 1';
            } else {
                this.step2Config.nextEnabled = true;
                this.issuesToDisplay = this.issuesList;
                this.selectIssues = this.issuesList;
                this.paginationConfig.pageNumber = 1;
                this.paginationConfig.totalItems = this.issuesList.length;
            }
        } catch (e) {
            this.parseJSONException(e);
        }
    }

    parseJSONException(e: any) {
        console.log(e);
    }

    handlePageSize($event: PaginationEvent) {
        this.updateItems();
    }

    handlePageNumber($event: PaginationEvent) {
        this.updateItems();
    }

    handleSelectionChange($event: ListEvent): void {
        this.selectIssues = this.issuesList.filter(i => i.selected);
        this.step3Config.nextEnabled = this.selectIssues.length > 0;
    }

    updateItems() {
        this.issuesToDisplay = this.issuesList.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
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

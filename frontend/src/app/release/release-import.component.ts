import { Component, OnInit, OnDestroy, ViewChild, Host } from '@angular/core';
import {
    WizardComponent, WizardStepConfig, ListConfig, PaginationConfig, WizardEvent, PaginationEvent, ListEvent,
    WizardStep, WizardStepComponent, WizardConfig
} from 'patternfly-ng';
import { ReleaseFull } from './shared/ReleaseFull';
import { FileItem, MineTypeEnum, InputFileOptions, DropTargetOptions, HttpClientUploadService } from '@wkoza/ngx-upload';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { ReleaseService } from './shared/release.service';
import { ReleaseComponent } from './release.component';
import { IssueService } from '../issue/shared/issue.service';
import { Release } from './shared/Release';
import { Version } from '../version/shared/Version';
import { PlatformHistory } from '../shared/PlatformHistory';
import { Issue } from '../issue/shared/Issue';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';

@Component({
    selector: 'app-release-import',
    templateUrl: './release-import.component.html',
    styleUrls: ['./release-import.component.less']
})
export class ReleaseImportComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;

    data: any = {};

    releasesList: ReleaseFull[] = [];
    releasesToDisplay: ReleaseFull[] = [];
    selectReleases: ReleaseFull[] = [];

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;

    itemFile: FileItem;

    errorMessage: string = null;
    errorLine = '0';
    lineToParse: string[] = null;
    currentLine = 0;

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
    releaseComponent: ReleaseComponent;

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

    constructor(private releaseService: ReleaseService, private issueService: IssueService, @Host() releaseComponent: ReleaseComponent,
        public uploader: HttpClientUploadService) {
        this.releaseComponent = releaseComponent;
    }

    ngOnInit(): void {

        this.data = {};
        this.itemFile = null;
        this.releasesList = [];
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
            title: 'Import releases'
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
                this.releasesList = [];
                this.errorMessage = null;
                if (!this.currentAcceptMimeType.some((type: string) => type === data.file.type)
                    && !data.file.name.toLocaleUpperCase().endsWith('.' + this.fileFormat)) {
                    this.removeCurrentFileItem(true);
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
                this.releaseComponent.getReleases();
            }
            this.releaseComponent.closeModal($event);
        }
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.deploySuccess = false;

        this.selectReleases.forEach((i, index) => {
            this.subscriptions.push(this.releaseService.addRelease(i)
                .subscribe(_ => {
                    this.deploySuccess = true;
                    this.releasesList[index].deploy = 'SUCCESS';
                }, _ => {
                    this.releasesList[index].deploy = 'FAILURE';
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

    removeCurrentFileItem(onError: boolean = false) {
        if (this.itemFile) {
            this.uploader.removeFromQueue(this.itemFile);
            if (onError) {
                this.uploader.onDropError$.next({ item: this.itemFile.file, errorAccept: true, errorMultiple: false });
            }
        } this.itemFile = null;
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

    upload(item: FileItem) {
        // item.upload({
        //     method: 'POST',
        //     url: 'ngx_upload_mock'
        // });
    }

    parseFile() {
        if (this.fileFormat === 'CSV') {
            this.parseCSV(this.fileReader.result);
        } else {
            this.parseJSON(this.fileReader.result);
        }
    }

    parseCSV(text: string | ArrayBuffer) {
        const stringText = text.toString();
        this.currentLine = 0;
        if (stringText.length === 0) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Empty File';
            return;
        }
        this.lineToParse = text.toString().split(/\r\n|\n/);
        this.parseNextCSVLine();
    }

    parseNextCSVLine() {
        let l = '';
        while (l.length === 0 && this.lineToParse.length > 0) {
            l = this.lineToParse.shift();
            this.currentLine++;
        }

        if (l.length === 0 && this.lineToParse.length === 0) {
            this.step2Config.nextEnabled = true;
            this.releasesToDisplay = this.releasesList;
            this.selectReleases = this.releasesList;
            this.paginationConfig.pageNumber = 1;
            this.paginationConfig.totalItems = this.releasesList.length;
            return;
        }

        const data = l.split(';');
        let res = data.length === 8;
        if (res) {
            const release = new ReleaseFull();
            res = data.every((value, index) => {
                let added = false;
                switch (index) {
                    case 0:
                        added = this.addVersionNumber(value.trim(), release);
                        break;
                    case 1:
                        added = this.addBuildDate(value.trim(), release);
                        break;
                    case 2:
                        added = this.addPackageDate(value.trim(), release);
                        break;
                    case 3:
                        added = this.addPlatformHistory(value.trim(), release, 'QUALIFICATION');
                        break;
                    case 4:
                        added = this.addPlatformHistory(value.trim(), release, 'KEYUSER');
                        break;
                    case 5:
                        added = this.addPlatformHistory(value.trim(), release, 'PILOT');
                        break;
                    case 6:
                        added = this.addPlatformHistory(value.trim(), release, 'PRODUCTION');
                        break;
                    case 7:
                        added = this.addIssues(value.trim(), release);
                        break;
                }
                return added;
            });
        } else {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong number of columns (' + data.length + ') at Line: ' + this.currentLine;
        }


    }

    addVersionNumber(versionNumber: string, release: ReleaseFull): boolean {
        const res = versionNumber.length > 0;
        if (res) {
            release.release = new Release();
            release.release.version = new Version();
            release.release.version.versionNumber = versionNumber;
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong Version number at Line: ' + this.currentLine;
        }

        return res;
    }

    addBuildDate(value: string, release: ReleaseFull): boolean {
        const buildDate = Date.parse(value);
        const res = !isNaN(buildDate);
        if (res) {
            release.release.buildDate = new Date(buildDate);
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong Build date at Line: ' + this.currentLine;
        }

        return res;
    }

    addPackageDate(value: string, release: ReleaseFull): boolean {
        if (value.length === 0) {
            return true;
        }
        const buildDate = Date.parse(value);
        const res = !isNaN(buildDate);
        if (res) {
            release.release.packageDate = new Date(buildDate);
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong package date at Line: ' + this.currentLine;
        }

        return res;
    }

    addPlatformHistory(value: string, release: ReleaseFull, targetPlatform: string): boolean {
        if (value.length === 0) {
            return true;
        }
        const parts = value.split(',');
        let res = parts.length < 3;
        if (res) {
            const platformHistory = new PlatformHistory();
            const deployDate = Date.parse(parts[0]);
            res = !isNaN(deployDate);
            if (res) {
                platformHistory.deployDate = new Date(deployDate);
            }

            if (res && parts.length === 2) {
                const validationDate = Date.parse(parts[1]);
                res = !isNaN(validationDate);
                if (res) {
                    platformHistory.validationDate = new Date(validationDate);
                }
            }

            if (res) {
                switch (targetPlatform) {
                    case 'QUALIFICATION':
                        release.release.qualification = platformHistory;
                        break;
                    case 'KEYUSER':
                        release.release.keyUser = platformHistory;
                        break;
                    case 'PILOT':
                        release.release.pilot = platformHistory;
                        break;
                    case 'PRODUCTION':
                        release.release.production = platformHistory;
                        break;
                    default:
                        res = false;
                }
            }

        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong ' + targetPlatform + ' dates at Line: ' + this.currentLine;
        }
        return res;
    }

    addIssues(value: string, release: ReleaseFull): boolean {
        const parts = value.split(',');
        const observables: Observable<Issue>[] = [];
        parts.forEach(ref =>
            observables.push(this.issueService.getIssue(ref))
        );
        const allResult = forkJoin(observables);
        allResult.subscribe(
            issues => {
                release.issues = issues;
                release.selected = true;
                this.releasesList.push(release);
                this.parseNextCSVLine();
            },
            error => {
                console.log(error);
                this.errorLine = '' + this.currentLine;
                this.errorMessage = 'Error for issue ' + error.url.substring(error.url.lastIndexOf('/') + 1)
                    + ' at Line: ' + this.currentLine + '. Please check all issue references.';
            }
        );
        return true;
    }
    parseJSON(value: string | ArrayBuffer) {
        // not implemented yet
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
        this.selectReleases = this.releasesList.filter(i => i.selected);
        this.step3Config.nextEnabled = this.selectReleases.length > 0;
    }

    updateItems() {
        this.releasesToDisplay = this.releasesList.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
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

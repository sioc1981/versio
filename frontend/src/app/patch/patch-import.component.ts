import { Component, OnInit, OnDestroy, ViewChild, Host, Output, EventEmitter } from '@angular/core';
import { WizardComponent, WizardStepConfig, ListConfig, PaginationConfig, WizardConfig, WizardEvent,
    PaginationEvent, ListEvent, WizardStep, WizardStepComponent } from 'patternfly-ng';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { FileItem, MineTypeEnum, InputFileOptions, DropTargetOptions, HttpClientUploadService } from '@wkoza/ngx-upload';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { PatchService } from './shared/patch.service';
import { IssueService } from '../issue/shared/issue.service';
import { ReleaseService } from '../release/shared/release.service';
import { Patch } from './shared/patch.model';
import { Release } from '../release/shared/release.model';
import { Issue } from '../issue/shared/issue.model';
import { PlatformHistory } from '../shared/platform.model';

@Component({
  selector: 'app-patch-import',
  templateUrl: './patch-import.component.html',
  styleUrls: ['./patch-import.component.less']
})
export class PatchImportComponent implements OnInit, OnDestroy {
    @ViewChild('wizard') wizard: WizardComponent;
    @Output() close = new EventEmitter<boolean>();

    data: any = {};

    patchesList: Patch[] = [];
    patchesToDisplay: Patch[] = [];
    selectPatches: Patch[] = [];

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;

    itemFile: FileItem;

    errorMessage: string = null;
    errorLine = '0';
    lineToParse: string[] = null;
    currentLine = 0;

    releases: Release[];

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

    constructor(private patchService: PatchService, private issueService: IssueService, private releaseService: ReleaseService,
        public uploader: HttpClientUploadService) { }

    ngOnInit(): void {
        this.getVersions();
        this.data = {};
        this.itemFile = null;
        this.patchesList = [];
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
            title: 'Import patches'
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
                this.patchesList = [];
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

     getVersions(): void {
        this.subscriptions.push(this.releaseService.getReleases()
            .subscribe(newReleases => this.releases = newReleases));
    }

   // Methods

    nextClicked($event: WizardEvent): void {
        if ($event.step.config.id === 'stepFinale') {
            this.closeWizard();
        }
    }

    closeWizard() {
        this.close.emit(this.deploySuccess);
    }

    startDeploy(): void {
        this.deployComplete = false;
        this.wizardConfig.done = true;
        this.deploySuccess = false;

        this.selectPatches.forEach((i, index) => {
            this.subscriptions.push(this.patchService.addPatch(i)
                .subscribe(_ => {
                    this.deploySuccess = true;
                    this.patchesList[index].deploy = 'SUCCESS';
                }, _ => {
                    this.patchesList[index].deploy = 'FAILURE';
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
            this.patchesToDisplay = this.patchesList;
            this.selectPatches = this.patchesList;
            this.paginationConfig.pageNumber = 1;
            this.paginationConfig.totalItems = this.patchesList.length;
            return;
        }

        const data = l.split(';');
        let res = data.length === 9;
        if (res) {
            const patch = new Patch();
            res = data.every((value, index) => {
                let added = false;
                switch (index) {
                    case 0:
                        added = this.retrieveVersion(value.trim(), patch);
                        break;
                    case 1:
                        added = this.addSequenceNumber(value.trim(), patch);
                        break;
                    case 2:
                        added = this.addBuildDate(value.trim(), patch);
                        break;
                    case 3:
                        added = this.addPackageDate(value.trim(), patch);
                        break;
                    case 4:
                        added = this.addPlatformHistory(value.trim(), patch, 'QUALIFICATION');
                        break;
                    case 5:
                        added = this.addPlatformHistory(value.trim(), patch, 'KEYUSER');
                        break;
                    case 6:
                        added = this.addPlatformHistory(value.trim(), patch, 'PILOT');
                        break;
                    case 7:
                        added = this.addPlatformHistory(value.trim(), patch, 'PRODUCTION');
                        break;
                    case 8:
                        added = this.addIssues(value.trim(), patch);
                        break;
                }
                return added;
            });
        } else {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong number of columns (' + data.length + ') at Line: ' + this.currentLine;
        }

    }

    retrieveVersion(versionNumber: string, patch: Patch): boolean {
        let res = versionNumber.length > 0;
        if (res) {
            const release = this.releases.find(r => r.version.versionNumber === versionNumber);
            res = release !== undefined;
            if (res) {
                patch.release = release;
            }
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong sequence number at Line: ' + this.currentLine;
        }

        return res;

    }

    addSequenceNumber(sequenceNumber: string, patch: Patch): boolean {
        const res = sequenceNumber.length > 0;
        if (res) {
            patch.sequenceNumber = sequenceNumber;
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong sequence number at Line: ' + this.currentLine;
        }

        return res;
    }

    addBuildDate(value: string, patch: Patch): boolean {
        const buildDate = Date.parse(value);
        const res = !isNaN(buildDate);
        if (res) {
            patch.buildDate = new Date(buildDate);
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong Build date at Line: ' + this.currentLine;
        }

        return res;
    }

    addPackageDate(value: string, patch: Patch): boolean {
        if (value.length === 0) {
            return true;
        }
        const buildDate = Date.parse(value);
        const res = !isNaN(buildDate);
        if (res) {
            patch.packageDate = new Date(buildDate);
        }

        if (!res) {
            this.errorLine = '' + this.currentLine;
            this.errorMessage = 'Wrong package date at Line: ' + this.currentLine;
        }

        return res;
    }

    addPlatformHistory(value: string, patch: Patch, targetPlatform: string): boolean {
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
                        patch.qualification = platformHistory;
                        break;
                    case 'KEYUSER':
                        patch.keyUser = platformHistory;
                        break;
                    case 'PILOT':
                        patch.pilot = platformHistory;
                        break;
                    case 'PRODUCTION':
                        patch.production = platformHistory;
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

    addIssues(value: string, patch: Patch): boolean {
        const parts = value.split(',');
        const observables: Observable<Issue>[] = [];
        parts.forEach(ref =>
            observables.push(this.issueService.getIssue(ref))
        );
        const allResult = forkJoin(observables);
        allResult.subscribe(
            issues => {
                patch.issues = issues;
                patch.selected = true;
                this.patchesList.push(patch);
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
        this.selectPatches = this.patchesList.filter(i => i.selected);
        this.step3Config.nextEnabled = this.selectPatches.length > 0;
    }

    updateItems() {
        this.patchesToDisplay = this.patchesList.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
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

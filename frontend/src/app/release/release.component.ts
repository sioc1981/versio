import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ReleaseService } from './shared/release.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent,
    SortEvent,
    SortField
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { Subscription } from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { ReleaseFull } from './shared/release.model';
import { AuthenticationService } from '../auth/authentication.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-release',
    templateUrl: './release.component.html',
    styleUrls: ['./release.component.less']
})
export class ReleaseComponent implements OnInit, OnDestroy {
    @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    @ViewChild('createRelease') createReleaseTemplate: TemplateRef<any>;
    @ViewChild('importRelease') importReleaseTemplate: TemplateRef<any>;
    @ViewChild('updateRelease') updateReleaseTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    actionConfig: ActionConfig;
    releaseActionConfig: ActionConfig;
    isAscendingSort = false;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;
    currentSortField: SortField;

    releases: ReleaseFull[] = [];
    filteredReleases: ReleaseFull[] = [];
    items: ReleaseFull[] = [];

    selectedRelease: ReleaseFull;
    paginationConfig: PaginationConfig;

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;
    patchIconStyleClass = PATCH_CONSTANT.iconStyleClass;

    private subscriptions: Subscription[] = [];

    constructor(private releaseService: ReleaseService, private modalService: BsModalService,
        private auth: AuthenticationService) { }

    ngOnInit() {
        this.reloadData();
        this.filterConfig = {
            fields: [{
                id: 'version',
                title: 'Version',
                placeholder: 'Filter by Version...',
                type: FilterType.TEXT
            }, {
                id: 'issue',
                title: 'Issue',
                placeholder: 'Filter by issue...',
                type: FilterType.TEXT
            }, {
                id: 'onlyDeployed',
                title: 'Only deployed',
                placeholder: 'Only deployed on any platform',
                type: FilterType.SELECT,
                queries: [{
                    id: 'onlyDeployed',
                    value: 'True'
                }]
            }, {
                id: 'deployedOn',
                title: 'Deployed on',
                placeholder: 'Deployed on...',
                type: FilterType.SELECT,
                queries: [{
                    id: 'qualification',
                    value: 'Qualification platform'
                }, {
                    id: 'keyUser',
                    value: 'KeyUser platform'
                }, {
                    id: 'pilot',
                    value: 'Pilot platform'
                }, {
                    id: 'production',
                    value: 'Production platform'
                }]
            }, {
                id: 'missingOn',
                title: 'Missing on',
                placeholder: 'Missing on...',
                type: FilterType.SELECT,
                queries: [{
                    id: 'qualification',
                    value: 'Qualification platform'
                }, {
                    id: 'keyUser',
                    value: 'KeyUser platform'
                }, {
                    id: 'pilot',
                    value: 'Pilot platform'
                }, {
                    id: 'production',
                    value: 'Production platform'
                }]
            }],
            resultsCount: this.filteredReleases.length,
            appliedFilters: []
        } as FilterConfig;

        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.actionConfig = {
                    primaryActions: [{
                        id: 'addRelease',
                        title: 'Add new release',
                        tooltip: 'Add a new release'
                    }, {
                        id: 'importRelease',
                        title: 'Import releases',
                        tooltip: 'Import releases'
                    }]
                } as ActionConfig;

                this.releaseActionConfig = {
                    primaryActions: [{
                        id: 'editRelease',
                        title: 'Edit release',
                        tooltip: 'Edit release'
                    }]
                } as ActionConfig;
            }
        });

        this.sortConfig = {
            fields: [{
                id: 'version',
                title: 'Version',
                sortType: 'alpha'
            }, {
                id: 'buildDate',
                title: 'Build Date',
                sortType: 'alpha'
            }, {
                id: 'qualificationDate',
                title: 'Qualification Deploy Date',
                sortType: 'alpha'
            }, {
                id: 'keyUserDate',
                title: 'KeyUser Deploy Date',
                sortType: 'alpha'
            }, {
                id: 'pilotDate',
                title: 'Pilot Deploy Date',
                sortType: 'alpha'
            }, {
                id: 'productionDate',
                title: 'Production Deploy Date',
                sortType: 'alpha'
            }],
            isAscending: this.isAscendingSort
        } as SortConfig;


        this.currentSortField = this.sortConfig.fields[0];

        this.toolbarConfig = {
            filterConfig: this.filterConfig,
            actionConfig: this.actionConfig,
            sortConfig: this.sortConfig
        } as ToolbarConfig;

        this.paginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredReleases.length
        } as PaginationConfig;

    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    reloadData(): void {
        this.subscriptions.push(this.releaseService.getFullReleases()
            .subscribe(newReleases => {
                this.releases = newReleases;
                this.releases = this.releases.sort((item1: any, item2: any) => this.compare(item1, item2));
                this.applyFilters();
            }));
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    applyFilters(): void {
        this.filteredReleases = [];
        if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
            this.releases.forEach((item) => {
                if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
                    this.filteredReleases.push(item);
                }
            });
        } else {
            this.filteredReleases = this.releases;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredReleases.length;
        this.paginationConfig.pageNumber = 1;
        this.paginationConfig.totalItems = this.filteredReleases.length;
        this.updateItems();
    }
    filterChanged($event: FilterEvent): void {
        this.applyFilters();
    }

    matchesFilter(item: any, filter: Filter): boolean {
        let match = true;
        switch (filter.field.id) {
            case 'version':
                match = item.release.version.versionNumber.indexOf(filter.value) !== -1;
                break;
            case 'issue':
                let issueMatch = false;
                item.issues.forEach(issue => {
                    issueMatch = issueMatch || issue.reference.indexOf(filter.value) !== -1
                        || issue.description.indexOf(filter.value) !== -1;
                });
                match = issueMatch;
                break;
            case 'onlyDeployed':
                match = !item.release.undeployed;
                break;
            case 'deployedOn':
                match = item.release[filter.query.id] && item.release[filter.query.id].deployDate
                    && !item.release[filter.query.id].undeployDate;
                break;
            case 'missingOn':
                match = !item.release[filter.query.id] || !item.release[filter.query.id].deployDate;
                break;
        }
        return match;
    }

    matchesFilters(item: any, filters: Filter[]): boolean {
        if (filters.length === 0) {
            return true;
        }
        let matches = true;
        let allMatches = new Map<string, boolean>();
        filters.forEach((filter) => {
            if (allMatches.has(filter.field.id)) {
                allMatches = allMatches.set(filter.field.id, allMatches.get(filter.field.id) || this.matchesFilter(item, filter));
            } else {
                allMatches = allMatches.set(filter.field.id, this.matchesFilter(item, filter));
            }
        });
        allMatches.forEach(value => {
            matches = matches && value;
        });
        return matches;
    }

    handleAction(action: Action, item?: any): void {
        if (action.id === 'addRelease') {
            this.openModal(this.createReleaseTemplate);
        } else if (action.id === 'editRelease') {
            this.selectedRelease = item;
            this.openModal(this.updateReleaseTemplate);
        } else if (action.id === 'importRelease') {
            this.openModal(this.importReleaseTemplate);
        } else {
            console.log('handleAction: unknown action: ' + action.id);
        }
    }

    handlePageSize($event: PaginationEvent) {
        this.updateItems();
    }

    handlePageNumber($event: PaginationEvent) {
        this.updateItems();
    }

    compare(item1: any, item2: any): number {
        let compValue = 0;
        if (this.currentSortField.id === 'version') {
            compValue = this.compareVersion(item1, item2);
        } else if (this.currentSortField.id === 'buildDate') {
            compValue = this.compareBuildDate(item1, item2);
        } else if (this.currentSortField.id === 'qualificationDate') {
            compValue = this.compareDeployDate(item1, item2, 'qualification');
        } else if (this.currentSortField.id === 'keyUserDate') {
            compValue = this.compareDeployDate(item1, item2, 'keyUser');
        } else if (this.currentSortField.id === 'pilotDate') {
            compValue = this.compareDeployDate(item1, item2, 'pilot');
        } else if (this.currentSortField.id === 'productionDate') {
            compValue = this.compareDeployDate(item1, item2, 'production');
        }

        if (compValue === 0) {
            compValue = this.compareVersion(item1, item2);
        }
        if (!this.isAscendingSort) {
            compValue = compValue * -1;
        }
        return compValue;
    }

    compareVersion(item1: any, item2: any): number {
        let compValue = 0;
        const sourceRelease1 = item1.release.version.versionNumber;
        const sourceRelease2 = item2.release.version.versionNumber;
        compValue = sourceRelease1.localeCompare(sourceRelease2);
        return compValue;
    }

    compareBuildDate(item1: any, item2: any): number {
        let compValue = 0;
        const sourceRelease1 = item1.release.buildDate;
        const sourceRelease2 = item2.release.buildDate;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }

    compareDeployDate(item1: any, item2: any, platform: string): number {
        let compValue = 0;
        const sourceRelease1 = item1.release[platform] ? item1.release[platform].deployDate : 0;
        const sourceRelease2 = item2.release[platform] ? item2.release[platform].deployDate : 0;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }


    // Handle sort changes
    handleSortChanged($event: SortEvent): void {
        this.currentSortField = $event.field;
        this.isAscendingSort = $event.isAscending;
        this.releases.sort((item1: any, item2: any) => this.compare(item1, item2));
        this.applyFilters();
    }

    updateItems() {
        this.items = this.filteredReleases.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }

    onWizardClose(releaseFullChanged: ReleaseFull) {
        if (releaseFullChanged) {
            this.reloadData();
        }
        this.modalRef.hide();
    }

    onImportWizardClose(importSuccessfull: boolean) {
        if (importSuccessfull) {
            this.reloadData();
        }
        this.modalRef.hide();
    }

}

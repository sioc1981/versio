import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    WizardEvent, EmptyStateConfig, Action, ActionConfig, CopyService, FilterConfig, SortConfig, ToolbarConfig, SortField,
    FilterType, FilterEvent, FilterField, Filter, PaginationConfig, PaginationEvent, SortEvent
} from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';
import { IssueService } from './shared/issue.service';
import { IssueExtended } from './shared/issue.model';
import { Patch } from '../patch/shared/patch.model';
import { Release } from '../release/shared/release.model';

enum ReleaseDetailTab {
    OVERVIEW,
    RELEASE_NOTE,
    PATCHES,
    ALL_ISSUES
}

@Component({
    selector: 'app-issue-detail',
    templateUrl: './issue-detail.component.html',
    styleUrls: ['./issue-detail.component.less']
})
export class IssueDetailComponent implements OnInit, OnDestroy {
    @ViewChild('updateIssue') updateIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    ReleaseDetailTabEnum = ReleaseDetailTab;

    issueReference: string;
    
    parcels: (Patch | Release)[] = [];
    filteredParcels: (Patch | Release)[] = [];
    items: (Patch | Release)[] = [];

    loading = true;
    loadingFailed = false;

    errorConfig: EmptyStateConfig;

    globalActionConfig: ActionConfig;
    actionConfig: ActionConfig;
    parcelActionConfig: ActionConfig;
    isAscendingSort = false;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;
    currentSortField: SortField;
    paginationConfig: PaginationConfig;

    issueExtended: IssueExtended;

    private subscriptions: Subscription[] = [];
    constructor(private issueService: IssueService, private route: ActivatedRoute, private modalService: BsModalService,
        private auth: AuthenticationService, private loc: Location, private copyService: CopyService) { }

    ngOnInit() {
        this.errorConfig = {
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Error'
        } as EmptyStateConfig;

        this.globalActionConfig = {
                    primaryActions: [{
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            }]
        } as ActionConfig;
        
        this.actionConfig = {
            primaryActions: [{
                id: 'copyURL',
                title: 'Copy URL',
                tooltip: 'Copy URL with current filters'
            }]
        } as ActionConfig;

        this.filterConfig = {
                fields: [{
                    id: 'version',
                    title: 'Version',
                    placeholder: 'Filter by Version...',
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
                    id: 'toTestOn',
                    title: 'To test on',
                    placeholder: 'To test on...',
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
                resultsCount: this.filteredParcels.length,
                appliedFilters: []
            } as FilterConfig;

            this.auth.isLoggedIn().then(loggedIn => {
                if (loggedIn) {
                    this.parcelActionConfig = {
                        primaryActions: [{
                            id: 'edit',
                            title: 'Edit',
                            tooltip: 'Edit'
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
                totalItems: this.filteredParcels.length
            } as PaginationConfig;

            this.route.queryParamMap.subscribe(params => {
                const filters: string[] = params.getAll('filter');
                if (filters.length > 0) {
                    this.filterConfig.appliedFilters = [];
                    filters.forEach(filter => {
                        this.filterConfig.fields.forEach(ff => {
                            if (ff.queries) {
                                this.addFilterQueryFromParam(filter, ff, this.filterConfig);
                            } else {
                                this.addFilterFromParam(filter, ff, this.filterConfig);
                            }
                        });
                    });
                    this.applyFilters();
                }
            });
        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.globalActionConfig.primaryActions.push({
                        id: 'editIssue',
                        title: 'Edit Issue',
                        tooltip: 'Edit issue'
                    });
            }
        });

        this.route.paramMap.subscribe(params => {
            this.issueReference = params.get('ref');
            if (params.has('ref')) {
                this.reloadData();
            }
        });
    }

    addFilterFromParam(paramFilter: string, filterField: FilterField, filterConf: FilterConfig): void {
        const paramPrefix = filterField.id + '_';
        if (paramFilter.lastIndexOf(paramPrefix) === 0) {
            const value = paramFilter.slice(paramPrefix.length);
            filterConf.appliedFilters.push({
                field: filterField,
                value: value
            } as Filter);
        }
    }

    addFilterQueryFromParam(paramFilter: string, filterField: FilterField, filterConf: FilterConfig): void {
        const paramPrefix = filterField.id + '_';
        if (paramFilter.lastIndexOf(paramPrefix) === 0) {
            const value = paramFilter.slice(paramPrefix.length);
            const filterQuery = filterField.queries.find(q => q.id === value);
            if (filterQuery) {
                filterConf.appliedFilters.push({
                    field: filterField,
                    query: filterQuery,
                    value: filterQuery.value
                } as Filter);
            }
        }
    }

    /**
    * Clean up subscriptions
    */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }


    reloadData(): void {
        this.loading = true;
        this.subscriptions.push(this.issueService.searchIssueFull(this.issueReference)
            .subscribe(issueExtended => {
                    this.issueExtended = issueExtended;
                    this.parcels = [...this.issueExtended.releases, ...this.issueExtended.patches];
                    this.parcels.sort((item1: any, item2: any) => this.compare(item1, item2));
                    this.applyFilters();
                },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    applyFilters(): void {
        this.filteredParcels = [];
        if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
            this.parcels.forEach((item) => {
                if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
                    this.filteredParcels.push(item);
                }
            });
        } else {
            this.filteredParcels = this.parcels;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredParcels.length;
        this.paginationConfig.pageNumber = 1;
        this.paginationConfig.totalItems = this.filteredParcels.length;
        this.updateItems();
    }
    filterChanged($event: FilterEvent): void {
        this.applyFilters();
    }

    matchesFilter(item: any, filter: Filter): boolean {
        let match = true;
        const data = item.release ? item.release: item;
        switch (filter.field.id) {
            case 'version':
                match = data.version.versionNumber.indexOf(filter.value) !== -1;
                break;
            case 'onlyDeployed':
                match = !item.undeployed;
                break;
            case 'deployedOn':
                match = item[filter.query.id] && item[filter.query.id].deployDate
                    && !item[filter.query.id].undeployDate;
                break;
            case 'toTestOn':
                match = item[filter.query.id] && item[filter.query.id].deployDate
                    && !item[filter.query.id].validationDate
                    && !item[filter.query.id].undeployDate;
                break;
            case 'missingOn':
                match = !item[filter.query.id] || !item[filter.query.id].deployDate;
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
        if (action.id === 'copyURL') {
            this.copyURL();
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

    copyURL() {
        const angularRoute = this.loc.path();
        const fullUrl = window.location.href;
        const domainAndApp = fullUrl.replace(angularRoute, '');
        let urlToCopy = domainAndApp;
        this.route.snapshot.url.forEach(us => {
            urlToCopy = urlToCopy.concat('/', us.path);
        });
        if (this.filterConfig.appliedFilters.length > 0) {
            let first = true;
            this.filterConfig.appliedFilters.forEach(af => {
                urlToCopy = urlToCopy.concat(first ? '?' : '&', 'filter=', af.field.id, '_', af.query ? af.query.id : af.value);
                first = false;
            });
        }
        this.copyService.copy(urlToCopy);
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
        const sourceRelease1 = (item1.release ? item1.release : item1).version.versionNumber;
        const sourceRelease2 = (item2.release ? item2.release : item2).version.versionNumber;
        compValue = sourceRelease1.localeCompare(sourceRelease2);
        if (compValue === 0) {
            const sourcePatch1 = (item1.release ? item1.sequenceNumber : '');
            const sourcePatch2 = (item2.release ? item2.sequenceNumber : '');
            compValue = sourcePatch1.localeCompare(sourcePatch2);
        }
        return compValue;
    }

    compareBuildDate(item1: any, item2: any): number {
        let compValue = 0;
        const sourceRelease1 = item1.buildDate;
        const sourceRelease2 = item2.buildDate;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }

    compareDeployDate(item1: any, item2: any, platform: string): number {
        let compValue = 0;
        const sourceRelease1 = item1[platform] ? item1[platform].deployDate : 0;
        const sourceRelease2 = item2[platform] ? item2[platform].deployDate : 0;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }


    // Handle sort changes
    handleSortChanged($event: SortEvent): void {
        this.currentSortField = $event.field;
        this.isAscendingSort = $event.isAscending;
        this.parcels.sort((item1: any, item2: any) => this.compare(item1, item2));
        this.applyFilters();
    }

    updateItems() {
        this.items = this.filteredParcels.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }

    onWizardClose(releaseFullChanged: any) {
        if (releaseFullChanged) {
            this.reloadData();
        }
        this.modalRef.hide();
    }
}

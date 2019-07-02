import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ReleaseService } from './shared/release.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    WizardEvent, EmptyStateConfig, Action, ActionConfig, FilterConfig, ToolbarConfig, SortConfig, PaginationConfig, FilterType,
    PaginationEvent, Filter, FilterEvent, SortField, SortEvent, FilterField, CopyService
} from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { Issue } from '../issue/shared/issue.model';
import { Patch } from '../patch/shared/patch.model';
import { ReleaseFull, Release } from './shared/release.model';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';

enum ReleaseDetailTab {
    OVERVIEW,
    RELEASE_NOTE,
    PATCHES,
    ALL_ISSUES
}

@Component({
    selector: 'app-release-detail',
    templateUrl: './release-detail.component.html',
    styleUrls: ['./release-detail.component.less']
})
export class ReleaseDetailComponent implements OnInit, OnDestroy {
    @ViewChild('updateRelease') updateReleaseTemplate: TemplateRef<any>;
    @ViewChild( 'createPatch' ) createPatchTemplate: TemplateRef<any>;
    @ViewChild( 'updatePatch' ) updatePatchTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    ReleaseDetailTabEnum = ReleaseDetailTab;

    versionNumber: string;
    currentTab = ReleaseDetailTab.OVERVIEW;
    viewAtStartup = '';

    loading = true;
    loadingFailed = false;

    errorConfig: EmptyStateConfig;
    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;
    patchIconStyleClass = PATCH_CONSTANT.iconStyleClass;

    globalActionConfig: ActionConfig;
    actionConfig: ActionConfig;

    releaseFull: ReleaseFull;
    release: Release;

    issues: Issue[];
    filteredIssues: Issue[] = [];
    isAscendingSortForIssues = true;
    issueActionConfig: ActionConfig;
    issueFilterConfig: FilterConfig;
    issueSortConfig: SortConfig;
    issueToolbarConfig: ToolbarConfig;
    issuePaginationConfig: PaginationConfig;
    currentIssuesSortField: SortField;

    patches: Patch[];
    filteredPatches: Patch[] = [];
    selectedPatch: Patch;
    isAscendingSortForPatches = true;
    patchActionConfig: ActionConfig;
    patchToolbarActionConfig: ActionConfig;
    patchFilterConfig: FilterConfig;
    patchSortConfig: SortConfig;
    patchToolbarConfig: ToolbarConfig;
    patchPaginationConfig: PaginationConfig;
    currentPatchSortField: SortField;

    allIssues: Issue[];
    allOriginalIssues: Issue[];
    filteredAllIssues: Issue[] = [];
    isAscendingSortForAllIssues = true;
    allIssueFilterConfig: FilterConfig;
    allIssueSortConfig: SortConfig;
    allIssueToolbarConfig: ToolbarConfig;
    allIssuePaginationConfig: PaginationConfig;
    currentAllIssuesSortField: SortField;

    private subscriptions: Subscription[] = [];
    constructor(private releaseService: ReleaseService, private route: ActivatedRoute, private modalService: BsModalService,
        private auth: AuthenticationService, private loc: Location, private copyService: CopyService) { }

    ngOnInit() {
        this.errorConfig = {
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Error'
        } as EmptyStateConfig;

        this.actionConfig = {
                primaryActions: [{
                    id: 'copyURL',
                    title: 'Copy URL',
                    tooltip: 'Copy URL with current filters'
                }]
            } as ActionConfig;
        this.patchToolbarActionConfig = {
                primaryActions: [{
                    id: 'copyURL',
                    title: 'Copy URL',
                    tooltip: 'Copy URL with current filters'
                }]
            } as ActionConfig;

        this.issueActionConfig = {
            primaryActions: [{
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            }]
        } as ActionConfig;

        this.issueFilterConfig = {
            fields: [{
                id: 'reference',
                title: 'Reference',
                placeholder: 'Filter by Reference...',
                type: FilterType.TEXT
            }, {
                id: 'description',
                title: 'Description',
                placeholder: 'Filter by Description...',
                type: FilterType.TEXT
            }, {
                id: 'container',
                title: 'Container',
                placeholder: 'Filter by Container...',
                type: FilterType.SELECT,
                queries: [{
                    id: 'JIRA',
                    value: 'Jira'
                }, {
                    id: 'MANTIS',
                    value: 'Mantis'
                }
                ]
            }],
            resultsCount: this.filteredIssues.length,
            appliedFilters: []
        } as FilterConfig;

        this.issueSortConfig = {
            fields: [{
                id: 'reference',
                title: 'Reference',
                sortType: 'alpha'
            }, {
                id: 'container',
                title: 'Container',
                sortType: 'alpha'
            }],
            isAscending: this.isAscendingSortForIssues
        } as SortConfig;

        this.currentIssuesSortField = this.issueSortConfig.fields[0];

        this.issueToolbarConfig = {
            actionConfig: this.actionConfig,
            filterConfig: this.issueFilterConfig,
            sortConfig: this.issueSortConfig
        } as ToolbarConfig;

        this.issuePaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredIssues.length
        } as PaginationConfig;

        this.patchFilterConfig = {
            fields: [{
                 id: 'issue',
                title: 'Issue',
                placeholder: 'Filter by issue...',
                type: FilterType.TEXT
            }, {
                id: 'sequence',
                title: 'Sequence',
                placeholder: 'Filter by Sequence Number...',
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
            resultsCount: this.filteredPatches.length,
            appliedFilters: []
        } as FilterConfig;

        this.patchSortConfig = {
            fields: [{
                id: 'sequenceNumber',
                title: 'Sequence Number',
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
            isAscending: this.isAscendingSortForPatches
        } as SortConfig;

        this.currentPatchSortField = this.patchSortConfig.fields[0];
        
        this.patchActionConfig = {
                primaryActions: []
            } as ActionConfig;

        this.patchPaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredPatches.length
        } as PaginationConfig;

        this.patchToolbarConfig = {
            actionConfig: this.patchToolbarActionConfig,
            filterConfig: this.patchFilterConfig,
            sortConfig: this.patchSortConfig
        } as ToolbarConfig;

        this.allIssueFilterConfig = {
            fields: [{
                id: 'reference',
                title: 'Reference',
                placeholder: 'Filter by Reference...',
                type: FilterType.TEXT
            }, {
                id: 'description',
                title: 'Description',
                placeholder: 'Filter by Description...',
                type: FilterType.TEXT
            }, {
                id: 'container',
                title: 'Container',
                placeholder: 'Filter by Container...',
                type: FilterType.SELECT,
                queries: [{
                    id: 'JIRA',
                    value: 'Jira'
                }, {
                    id: 'MANTIS',
                    value: 'Mantis'
                }
                ]
            }],
            resultsCount: this.filteredAllIssues.length,
            appliedFilters: []
        } as FilterConfig;

        this.allIssueSortConfig = {
            fields: [{
                id: 'reference',
                title: 'Reference',
                sortType: 'alpha'
            }, {
                id: 'container',
                title: 'Container',
                sortType: 'alpha'
            }],
            isAscending: this.isAscendingSortForAllIssues
        } as SortConfig;

        this.currentAllIssuesSortField = this.allIssueSortConfig.fields[0];

        this.allIssuePaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredAllIssues.length
        } as PaginationConfig;

        this.allIssueToolbarConfig = {
            actionConfig: this.actionConfig,
            filterConfig: this.allIssueFilterConfig,
            sortConfig: this.allIssueSortConfig
        } as ToolbarConfig;
        
        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.globalActionConfig = {
                    primaryActions: [{
                        id: 'editRelease',
                        title: 'Edit release',
                        tooltip: 'Edit release'
                    }]
                } as ActionConfig;
                this.patchToolbarActionConfig.primaryActions.push({
                    id: 'addPatch',
                    title: 'Add new patch',
                    tooltip: 'Add a new patch'
                });
                this.patchActionConfig.primaryActions.push({
                    id: 'editPatch',
                    title: 'Edit patch',
                    tooltip: 'Edit this patch'
                });
            }
        });

        this.route.paramMap.subscribe(params => {
            this.versionNumber = params.get('version');
            this.viewAtStartup = params.get('view');
            this.currentTab = ReleaseDetailTab[this.viewAtStartup];
            if (params.has('version')) {
                this.reloadData();
            }

            if (this.currentTab !== ReleaseDetailTab.OVERVIEW) {
                const filterConf: FilterConfig = this.getCurrentFilterConfig();

                this.route.queryParamMap.subscribe(queryParams => {
                    const filters: string[] = queryParams.getAll('filter');
                    if (filters.length > 0) {
                        filterConf.appliedFilters = [];
                        filters.forEach(filter => {
                            filterConf.fields.forEach(ff => {
                                if (ff.queries) {
                                    this.addFilterQueryFromParam(filter, ff, filterConf);
                                } else {
                                    this.addFilterFromParam(filter, ff, filterConf);
                                }
                            });
                        });
                        this.applyIssueFilters();
                    }
                });
            }
        });
    }

    getCurrentFilterConfig(): FilterConfig {
        let filterConf: FilterConfig = {} as FilterConfig;
        switch (this.currentTab) {
            case ReleaseDetailTab.ALL_ISSUES:
                filterConf = this.allIssueFilterConfig;
                break;
            case ReleaseDetailTab.PATCHES:
                filterConf = this.patchFilterConfig;
                break;
            default:
                filterConf = this.issueFilterConfig;
                break;
        }
        return filterConf;
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

    getRelease(): ReleaseFull {
        return this.releaseFull;
    }

    reloadData(): void {
        this.loading = true;
        this.subscriptions.push(this.releaseService.searchReleaseFull(this.versionNumber)
            .subscribe(newRelease => {
                this.releaseFull = newRelease; this.release = this.releaseFull.release;
                this.releaseFull.issues.sort((item1: any, item2: any) => this.compareIssue(item1, item2, this.currentIssuesSortField,
                    this.isAscendingSortForIssues));
                this.releaseFull.patches.sort((item1: any, item2: any) => this.comparePatch(item1, item2));
                this.allOriginalIssues = Array.from(this.releaseFull.issues);
                const issueReferences = this.allOriginalIssues.map(issue => issue.reference);
                this.releaseFull.patches.forEach(patch => {
                    patch.issues.filter(issue => issueReferences.every(ref => ref !== issue.reference))
                        .forEach(issue => { this.allOriginalIssues.push(issue); issueReferences.push(issue.reference); });
                });
                this.allOriginalIssues.sort((item1: any, item2: any) => this.compareIssue(item1, item2, this.currentAllIssuesSortField,
                    this.isAscendingSortForAllIssues));
                this.applyIssueFilters(); this.applyPatchFilters(); this.applyAllIssueFilters();
            },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    handleAction(action: Action, item?: any): void {
        if ( action.id === 'addPatch' ) {
            this.openModal( this.createPatchTemplate );
        } else if (action.id === 'editPatch') {
            this.selectedPatch = item;
            this.openModal( this.updatePatchTemplate );
        } else if (action.id === 'editRelease') {
            this.openModal(this.updateReleaseTemplate);
        } else if (action.id === 'openIssue') {
            const url = ISSUE_CONSTANT.constainer_urls[item.container] + item.reference;
            window.open(url, '_blank');
        } else if (action.id === 'copyURL') {
            this.copyURL();
        } else {
            console.log('handleAction: unknown action: ' + action.id);
        }
    }

    filterChanged($event: FilterEvent, releaseDetailTabType: ReleaseDetailTab): void {
        switch (releaseDetailTabType) {
            case ReleaseDetailTab.RELEASE_NOTE:
                this.applyIssueFilters();
                break;
            case ReleaseDetailTab.PATCHES:
                this.applyPatchFilters();
                break;
            case ReleaseDetailTab.ALL_ISSUES:
                this.applyAllIssueFilters();
                break;
        }
    }

    applyIssueFilters(): void {
        this.filteredIssues = [];
        if (this.issueFilterConfig.appliedFilters && this.issueFilterConfig.appliedFilters.length > 0) {
            this.releaseFull.issues.forEach((item) => {
                if (this.matchesIssueFilters(item, this.issueFilterConfig.appliedFilters)) {
                    this.filteredIssues.push(item);
                }
            });
        } else {
            this.filteredIssues = this.releaseFull.issues;
        }
        this.issueToolbarConfig.filterConfig.resultsCount = this.filteredIssues.length;
        this.issuePaginationConfig.pageNumber = 1;
        this.issuePaginationConfig.totalItems = this.filteredIssues.length;
        this.updateIssueItems();
    }

    applyAllIssueFilters(): void {
        this.filteredAllIssues = [];
        if (this.allIssueFilterConfig.appliedFilters && this.allIssueFilterConfig.appliedFilters.length > 0) {
            this.allOriginalIssues.forEach((item) => {
                if (this.matchesIssueFilters(item, this.allIssueFilterConfig.appliedFilters)) {
                    this.filteredAllIssues.push(item);
                }
            });
        } else {
            this.filteredAllIssues = this.allOriginalIssues;
        }
        this.allIssueToolbarConfig.filterConfig.resultsCount = this.filteredAllIssues.length;
        this.allIssuePaginationConfig.pageNumber = 1;
        this.allIssuePaginationConfig.totalItems = this.filteredAllIssues.length;
        this.updateAllIssueItems();
    }

    matchesIssueFilter(item: any, filter: Filter): boolean {
        let match = true;
        if (filter.field.id === 'reference') {
            match = item.reference.indexOf(filter.value) !== -1;
        } else if (filter.field.id === 'description') {
            match = item.description.indexOf(filter.value) !== -1;
        } else if (filter.field.id === 'container') {
            match = item.container === filter.query.id;
        }
        return match;
    }

    matchesIssueFilters(item: any, filters: Filter[]): boolean {
        if (filters.length === 0) {
            return true;
        }
        let matches = true;
        let allMatches = new Map<string, boolean>();
        filters.forEach((filter) => {
            if (allMatches.has(filter.field.id)) {
                allMatches = allMatches.set(filter.field.id, allMatches.get(filter.field.id) || this.matchesIssueFilter(item, filter));
            } else {
                allMatches = allMatches.set(filter.field.id, this.matchesIssueFilter(item, filter));
            }
        });
        allMatches.forEach(value => {
            matches = matches && value;
        });
        return matches;
    }

    copyURL() {
        const angularRoute = this.loc.path();
        const fullUrl = window.location.href;
        const domainAndApp = fullUrl.replace(angularRoute, '');
        let urlToCopy = domainAndApp;
        this.route.snapshot.url.forEach(us => {
            if (this.viewAtStartup !== us.path) {
                urlToCopy = urlToCopy.concat('/', us.path);
            }
        });
        if (this.currentTab !== ReleaseDetailTab.OVERVIEW) {
            urlToCopy = urlToCopy.concat('/', ReleaseDetailTab[this.currentTab]);
            const filterConf: FilterConfig = this.getCurrentFilterConfig();
            if (filterConf.appliedFilters.length > 0) {
                let first = true;
                filterConf.appliedFilters.forEach(af => {
                    urlToCopy = urlToCopy.concat(first ? '?' : '&', 'filter=', af.field.id, '_', af.query ? af.query.id : af.value);
                    first = false;
                });
            }
        }
        this.copyService.copy(urlToCopy);
    }

    comparePatch(item1: any, item2: any): number {
        let compValue = 0;
        if (this.currentPatchSortField.id === 'sequenceNumber') {
            compValue = this.compareSequenceNumber(item1, item2);
        } else if (this.currentPatchSortField.id === 'buildDate') {
            compValue = this.compareBuildDate(item1, item2);
        } else if (this.currentPatchSortField.id === 'qualificationDate') {
            compValue = this.compareDeployDate(item1, item2, 'qualification');
        } else if (this.currentPatchSortField.id === 'keyUserDate') {
            compValue = this.compareDeployDate(item1, item2, 'keyUser');
        } else if (this.currentPatchSortField.id === 'pilotDate') {
            compValue = this.compareDeployDate(item1, item2, 'pilot');
        } else if (this.currentPatchSortField.id === 'productionDate') {
            compValue = this.compareDeployDate(item1, item2, 'production');
        }

        if (compValue === 0) {
            compValue = this.compareSequenceNumber(item1, item2);
        }
        if (!this.isAscendingSortForPatches) {
            compValue = compValue * -1;
        }
        return compValue;
    }


    compareSequenceNumber(item1: any, item2: any): number {
        let compValue = 0;
        const seqNum1 = item1.sequenceNumber;
        const seqNum2 = item2.sequenceNumber;
        compValue = seqNum1.localeCompare(seqNum2);
        return compValue;
    }

    compareBuildDate(item1: any, item2: any): number {
        let compValue = 0;
        const sourceRelease1 = item1.buildDate || 0;
        const sourceRelease2 = item2.buildDate || 0;
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

    compareIssue(item1: any, item2: any, sortField: SortField, ascendingSort: boolean): number {
        let compValue = 0;
        if (sortField.id === 'reference') {
            compValue = this.compareReference(item1, item2);
        } else if (sortField.id === 'container') {
            compValue = this.compareContainer(item1, item2);
        }

        if (compValue === 0) {
            compValue = this.compareReference(item1, item2);
        }
        if (!ascendingSort) {
            compValue = compValue * -1;
        }
        return compValue;
    }

    compareReference(item1: any, item2: any): number {
        let compValue = 0;
        const reference1 = item1.reference;
        const reference2 = item2.reference;
        compValue = reference1.localeCompare(reference2);
        return compValue;
    }

    compareContainer(item1: any, item2: any): number {
        let compValue = 0;
        const container1 = item1.container;
        const container2 = item2.container;
        compValue = container1.localeCompare(container2);
        return compValue;
    }

    // Handle sort changes
    handleSortChanged($event: SortEvent, releaseDetailTabType: ReleaseDetailTab): void {

        switch (releaseDetailTabType) {
            case ReleaseDetailTab.RELEASE_NOTE:
                this.currentIssuesSortField = $event.field;
                this.isAscendingSortForIssues = $event.isAscending;
                this.releaseFull.issues.sort((item1: any, item2: any) => this.compareIssue(item1, item2, this.currentIssuesSortField,
                    this.isAscendingSortForIssues));
                this.applyIssueFilters();
                break;
            case ReleaseDetailTab.PATCHES:
                this.currentPatchSortField = $event.field;
                this.isAscendingSortForPatches = $event.isAscending;
                this.releaseFull.patches.sort((item1: any, item2: any) => this.comparePatch(item1, item2));
                this.applyPatchFilters();
                break;
            case ReleaseDetailTab.ALL_ISSUES:
                this.currentAllIssuesSortField = $event.field;
                this.isAscendingSortForAllIssues = $event.isAscending;
                this.allOriginalIssues.sort((item1: any, item2: any) => this.compareIssue(item1, item2, this.currentAllIssuesSortField,
                    this.isAscendingSortForAllIssues));
                this.applyAllIssueFilters();
                break;
        }
    }

    handlePageSize($event: PaginationEvent, releaseDetailTabType: ReleaseDetailTab) {
        switch (releaseDetailTabType) {
            case ReleaseDetailTab.RELEASE_NOTE:
                this.updateIssueItems();
                break;
            case ReleaseDetailTab.PATCHES:
                this.updatePatches();
                break;
            case ReleaseDetailTab.ALL_ISSUES:
                this.updateAllIssueItems();
                break;
        }
    }

    handlePageNumber($event: PaginationEvent, releaseDetailTabType: ReleaseDetailTab) {
        switch (releaseDetailTabType) {
            case ReleaseDetailTab.RELEASE_NOTE:
                this.updateIssueItems();
                break;
            case ReleaseDetailTab.PATCHES:
                this.updatePatches();
                break;
            case ReleaseDetailTab.ALL_ISSUES:
                this.updateAllIssueItems();
                break;
        }
    }

    updateIssueItems() {
        this.issues = this.filteredIssues.slice((this.issuePaginationConfig.pageNumber - 1) * this.issuePaginationConfig.pageSize,
            this.issuePaginationConfig.totalItems).slice(0, this.issuePaginationConfig.pageSize);
    }

    updateAllIssueItems() {
        this.allIssues = this.filteredAllIssues.slice(
            (this.allIssuePaginationConfig.pageNumber - 1) * this.allIssuePaginationConfig.pageSize,
            this.allIssuePaginationConfig.totalItems).slice(0, this.allIssuePaginationConfig.pageSize);
    }


    applyPatchFilters(): void {
        this.filteredPatches = [];
        if (this.patchFilterConfig.appliedFilters && this.patchFilterConfig.appliedFilters.length > 0) {
            this.releaseFull.patches.forEach((item) => {
                if (this.matchesPatchFilters(item, this.patchFilterConfig.appliedFilters)) {
                    this.filteredPatches.push(item);
                }
            });
        } else {
            this.filteredPatches = this.releaseFull.patches;
        }
        this.patchToolbarConfig.filterConfig.resultsCount = this.filteredPatches.length;
        this.patchPaginationConfig.pageNumber = 1;
        this.patchPaginationConfig.totalItems = this.filteredPatches.length;
        this.updatePatches();
    }

    matchesPatchFilter(item: any, filter: Filter): boolean {
        let match = true;
        switch (filter.field.id) {

            case 'sequence':
                match = item.sequenceNumber.indexOf(filter.value) !== -1;
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

    matchesPatchFilters(item: any, filters: Filter[]): boolean {
        if (filters.length === 0) {
            return true;
        }
        let matches = true;
        let allMatches = new Map<string, boolean>();
        filters.forEach((filter) => {
            if (allMatches.has(filter.field.id)) {
                allMatches = allMatches.set(filter.field.id, allMatches.get(filter.field.id) || this.matchesPatchFilter(item, filter));
            } else {
                allMatches = allMatches.set(filter.field.id, this.matchesPatchFilter(item, filter));
            }
        });
        allMatches.forEach(value => {
            matches = matches && value;
        });
        return matches;
    }

    updatePatches() {
        this.patches = this.filteredPatches.slice((this.patchPaginationConfig.pageNumber - 1) * this.patchPaginationConfig.pageSize,
            this.patchPaginationConfig.totalItems).slice(0, this.patchPaginationConfig.pageSize);
    }

    onWizardClose(releaseFullChanged: any) {
        if (releaseFullChanged) {
            this.reloadData();
        }
        this.modalRef.hide();
    }
}

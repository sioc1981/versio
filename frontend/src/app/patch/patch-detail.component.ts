import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    EmptyStateConfig, Action, ActionConfig, FilterConfig, ToolbarConfig, SortConfig, PaginationConfig, FilterType,
    PaginationEvent, Filter, FilterEvent, SortField, SortEvent, CopyService, FilterField
} from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PATCH_CONSTANT, PatchService } from '../patch/shared/patch.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { Issue } from '../issue/shared/issue.model';
import { Patch } from '../patch/shared/patch.model';
import { RELEASE_CONSTANT } from '../release/shared/release.constant';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';

enum PatchDetailTab {
    OVERVIEW,
    RELEASE_NOTE
}

@Component({
    selector: 'app-patch-detail',
    templateUrl: './patch-detail.component.html',
    styleUrls: ['./patch-detail.component.less']
})
export class PatchDetailComponent implements OnInit, OnDestroy {
    @ViewChild('updatePatch') updatePatchTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    PatchDetailTabEnum = PatchDetailTab;
    RELEASE_CONSTANT = RELEASE_CONSTANT;

    versionNumber: string;
    sequenceNumber: string;
    currentTab: PatchDetailTab = PatchDetailTab.OVERVIEW;

    viewAtStartup = '';

    loading = true;
    loadingFailed = false;

    errorConfig: EmptyStateConfig;
    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;
    patchIconStyleClass = PATCH_CONSTANT.iconStyleClass;

    actionConfig: ActionConfig;

    patch: Patch;

    issues: Issue[];
    filteredIssues: Issue[] = [];
    isAscendingSortForIssues = true;
    issueActionConfig: ActionConfig;
    issueToolbarActionConfig: ActionConfig;
    issueFilterConfig: FilterConfig;
    issueSortConfig: SortConfig;
    issueToolbarConfig: ToolbarConfig;
    issuePaginationConfig: PaginationConfig;
    currentIssuesSortField: SortField;

    private subscriptions: Subscription[] = [];
    constructor(private patchService: PatchService, private route: ActivatedRoute, private modalService: BsModalService,
        private auth: AuthenticationService, private loc: Location, private copyService: CopyService) { }

    ngOnInit() {
        this.errorConfig = {
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Error'
        } as EmptyStateConfig;

        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.actionConfig = {
                    primaryActions: [{
                        id: 'editPatch',
                        title: 'Edit patch',
                        tooltip: 'Edit patch'
                    }]
                } as ActionConfig;
            }
        });

        this.issueActionConfig = {
            primaryActions: [{
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            }]
        } as ActionConfig;

        this.issueToolbarActionConfig = {
            primaryActions: [{
                id: 'copyURL',
                title: 'Copy URL',
                tooltip: 'Copy URL with current filters'
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
            actionConfig: this.issueToolbarActionConfig,
            filterConfig: this.issueFilterConfig,
            sortConfig: this.issueSortConfig
        } as ToolbarConfig;

        this.issuePaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            totalItems: this.filteredIssues.length
        } as PaginationConfig;

        this.subscriptions.push(this.route.paramMap.subscribe(params => {
            this.versionNumber = params.get('version');
            this.sequenceNumber = params.get('sequence');
            this.viewAtStartup = params.get('view');
            this.currentTab = PatchDetailTab[this.viewAtStartup];
            this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {
                const filters: string[] = queryParams.getAll('filter');
                if (filters.length > 0) {
                    this.issueFilterConfig.appliedFilters = [];
                    filters.forEach(filter => {
                        this.issueFilterConfig.fields.forEach(ff => {
                            if (ff.queries) {
                                this.addFilterQueryFromParam(filter, ff, this.issueFilterConfig);
                            } else {
                                this.addFilterFromParam(filter, ff, this.issueFilterConfig);
                            }
                        });
                    });
                    if (this.patch) {
                        this.applyIssueFilters();
                    }
                }
            }));
            if (params.has('version') && params.has('sequence')) {
                this.reloadData();
            }
        }));

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

    getPatch(): Patch {
        return this.patch;
    }

    reloadData(): void {
        this.loading = true;
        this.subscriptions.push(this.patchService.searchPatch(this.versionNumber, this.sequenceNumber)
            .subscribe(newPatch => {
                this.patch = newPatch;
                this.applyIssueFilters();
            },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    handleAction(action: Action, item?: any): void {
        console.log('action: ', action.id);
        if (action.id === 'editPatch') {
            this.openModal(this.updatePatchTemplate);
        } else if (action.id === 'openIssue') {
            const url = ISSUE_CONSTANT.constainer_urls[item.container] + item.reference;
            window.open(url, '_blank');
        } else if (action.id === 'copyURL') {
            this.copyURL();
        } else {
        }
    }

    filterChanged($event: FilterEvent, patchDetailTabType: PatchDetailTab): void {
        switch (patchDetailTabType) {
            case PatchDetailTab.RELEASE_NOTE:
                this.applyIssueFilters();
                break;
        }

    }

    applyIssueFilters(): void {
        this.filteredIssues = [];
        if (this.issueFilterConfig.appliedFilters && this.issueFilterConfig.appliedFilters.length > 0) {
            this.patch.issues.forEach((item) => {
                if (this.matchesIssueFilters(item, this.issueFilterConfig.appliedFilters)) {
                    this.filteredIssues.push(item);
                }
            });
        } else {
            this.filteredIssues = this.patch.issues;
        }
        this.issueToolbarConfig.filterConfig.resultsCount = this.filteredIssues.length;
        this.issuePaginationConfig.pageNumber = 1;
        this.issuePaginationConfig.totalItems = this.filteredIssues.length;
        this.updateIssueItems();
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
        if (this.currentTab === PatchDetailTab.RELEASE_NOTE) {
            urlToCopy = urlToCopy.concat('/', PatchDetailTab[PatchDetailTab.RELEASE_NOTE]);
        }
        if (this.issueFilterConfig.appliedFilters.length > 0) {
            let first = true;
            this.issueFilterConfig.appliedFilters.forEach(af => {
                urlToCopy = urlToCopy.concat(first ? '?' : '&', 'filter=', af.field.id, '_', af.query ? af.query.id : af.value);
                first = false;
            });
        }
        console.log(urlToCopy);
        this.copyService.copy(urlToCopy);
    }

    compareIssue(item1: any, item2: any): number {
        let compValue = 0;
        if (this.currentIssuesSortField.id === 'reference') {
            compValue = this.compareReference(item1, item2);
        } else if (this.currentIssuesSortField.id === 'container') {
            compValue = this.compareContainer(item1, item2);
        }

        if (compValue === 0) {
            compValue = this.compareReference(item1, item2);
        }
        if (!this.isAscendingSortForIssues) {
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
    handleSortChanged($event: SortEvent, patchDetailTabType: PatchDetailTab): void {
        switch (patchDetailTabType) {
            case PatchDetailTab.RELEASE_NOTE:
                this.currentIssuesSortField = $event.field;
                this.isAscendingSortForIssues = $event.isAscending;
                this.patch.issues.sort((item1: any, item2: any) => this.compareIssue(item1, item2));
                this.applyIssueFilters();
                break;
        }
    }

    handlePageSize($event: PaginationEvent, patchDetailTabType: PatchDetailTab) {
        switch (patchDetailTabType) {
            case PatchDetailTab.RELEASE_NOTE:
                this.updateIssueItems();
                break;
        }
    }

    handlePageNumber($event: PaginationEvent, patchDetailTabType: PatchDetailTab) {
        switch (patchDetailTabType) {
            case PatchDetailTab.RELEASE_NOTE:
                this.updateIssueItems();
                break;
        }
    }

    updateIssueItems() {
        this.issues = this.filteredIssues.slice((this.issuePaginationConfig.pageNumber - 1) * this.issuePaginationConfig.pageSize,
            this.issuePaginationConfig.totalItems).slice(0, this.issuePaginationConfig.pageSize);
    }

    onWizardClose(patchChanged: Patch) {
        if (patchChanged) {
            this.reloadData();
        }
        this.modalRef.hide();
    }

}

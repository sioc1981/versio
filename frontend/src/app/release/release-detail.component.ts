import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ReleaseService } from './shared/release.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseModalContainer } from './release-modal-container';
import {
    WizardEvent, EmptyStateConfig, Action, ActionConfig, FilterConfig, ToolbarConfig, SortConfig, PaginationConfig, FilterType,
    PaginationEvent, Filter, FilterEvent
} from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { Issue } from '../issue/shared/issue.model';
import { Patch } from '../patch/shared/patch.model';
import { ReleaseFull, Release } from './shared/release.model';


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
export class ReleaseDetailComponent implements OnInit, OnDestroy, ReleaseModalContainer {
    @ViewChild('updateRelease') updateReleaseTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    ReleaseDetailTabEnum = ReleaseDetailTab;

    versionNumber: string;
    currentTab = '';

    loading = true;
    loadingFailed = false;

    errorConfig: EmptyStateConfig;
    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;
    patchIconStyleClass = PATCH_CONSTANT.iconStyleClass;

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

    patches: Patch[];
    filteredPatches: Patch[] = [];
    isAscendingSortForPatches = true;
    patchFilterConfig: FilterConfig;
    patchSortConfig: SortConfig;
    patchToolbarConfig: ToolbarConfig;
    patchPaginationConfig: PaginationConfig;

    allIssues: Issue[];
    allOriginalIssues: Issue[];
    filteredAllIssues: Issue[] = [];
    isAscendingSortForAllIssues = true;
    allIssueFilterConfig: FilterConfig;
    allIssueSortConfig: SortConfig;
    allIssueToolbarConfig: ToolbarConfig;
    allIssuePaginationConfig: PaginationConfig;

    private subscriptions: Subscription[] = [];
    constructor(private releaseService: ReleaseService, private route: ActivatedRoute, private modalService: BsModalService) { }

    ngOnInit() {
        this.errorConfig = {
            iconStyleClass: 'pficon-error-circle-o',
            title: 'Error'
        } as EmptyStateConfig;
        this.actionConfig = {
            primaryActions: [{
                id: 'editRelease',
                title: 'Edit release',
                tooltip: 'Edit release'
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

        this.issueToolbarConfig = {
            filterConfig: this.issueFilterConfig
        } as ToolbarConfig;

        this.issuePaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredIssues.length
        } as PaginationConfig;

        this.patchFilterConfig = {
            fields: [{
                id: 'sequence',
                title: 'Sequence',
                placeholder: 'Filter by Sequence Number...',
                type: FilterType.TEXT
            }, {
                id: 'issue',
                title: 'issue',
                placeholder: 'Filter by issue...',
                type: FilterType.TEXT
            }],
            resultsCount: this.filteredPatches.length,
            appliedFilters: []
        } as FilterConfig;

        this.patchToolbarConfig = {
            filterConfig: this.patchFilterConfig
        } as ToolbarConfig;

        this.patchPaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredPatches.length
        } as PaginationConfig;

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

        this.allIssueToolbarConfig = {
            filterConfig: this.allIssueFilterConfig
        } as ToolbarConfig;

        this.allIssuePaginationConfig = {
            pageNumber: 1,
            pageSize: 5,
            pageSizeIncrements: [3, 5, 10],
            totalItems: this.filteredAllIssues.length
        } as PaginationConfig;

        this.route.paramMap.subscribe(params => {
            this.versionNumber = params.get('version');
            this.currentTab = params.get('view');
            if (params.has('version')) {
                this.reloadData();
            }
        });
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
                this.allOriginalIssues = Array.from(this.releaseFull.issues);
                const issueReferences = this.allOriginalIssues.map(issue => issue.reference);
                this.releaseFull.patches.forEach(patch => {
                    patch.issues.filter(issue => issueReferences.every(ref => ref !== issue.reference))
                        .forEach(issue => { this.allOriginalIssues.push(issue); issueReferences.push(issue.reference); });
                });
                this.applyIssueFilters(); this.applyPatchFilters(); this.applyAllIssueFilters();
            },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }


    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    handleAction(action: Action, item?: any): void {
        if (action.id === 'editRelease') {
            this.openModal(this.updateReleaseTemplate);
        } else if (action.id === 'openIssue') {
            const url = ISSUE_CONSTANT.constainer_urls[item.container] + item.reference;
            window.open(url, '_blank');
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
        if (filter.field.id === 'sequence') {
            match = item.sequenceNumber.indexOf(filter.value) !== -1;
        }
        if (filter.field.id === 'issue') {
            let issueMatch = false;
            item.issues.forEach(issue => {
                issueMatch = issue.reference.indexOf(filter.value) !== -1
                    || issue.description.indexOf(filter.value) !== -1;
            });
            match = issueMatch;
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
}

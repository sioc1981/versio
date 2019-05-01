import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ReleaseService } from './shared/release.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseFull } from './shared/ReleaseFull';
import { ReleaseModalContainer } from './release-modal-container';
import { WizardEvent, EmptyStateConfig, Action, ActionConfig, FilterConfig, ToolbarConfig, SortConfig, PaginationConfig, FilterType,
    PaginationEvent, Filter, FilterEvent } from 'patternfly-ng';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Release } from './shared/Release';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { Issue } from '../issue/shared/Issue';
import { Patch } from '../patch/shared/Patch';

@Component({
    selector: 'app-release-detail',
    templateUrl: './release-detail.component.html',
    styleUrls: ['./release-detail.component.less']
})
export class ReleaseDetailComponent implements OnInit, OnDestroy, ReleaseModalContainer {
    @ViewChild('updateRelease') updateReleaseTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    versionNumber: string;

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

    private subscriptions: Subscription[] = [];
    constructor(private releaseService: ReleaseService, private route: ActivatedRoute, private modalService: BsModalService) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.versionNumber = params.get('version');
            if (params.has('version')) {
                this.reloadData();
            }
        });
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
                id: 'version',
                title: 'Version',
                placeholder: 'Filter by Version...',
                type: FilterType.TEXT
            }, {
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
            .subscribe(newRelease => { this.releaseFull = newRelease; this.release = this.releaseFull.release;
                        this.applyIssueFilters(); this.applyPatchFilters(); },
                _ => this.loadingFailed = true,
                () => { this.loading = false; }));
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    handleAction(action: Action): void {
        if (action.id === 'editRelease') {
            this.openModal(this.updateReleaseTemplate);
        }
    }

    filterChanged($event: FilterEvent, isForIssue: boolean): void {
        if (isForIssue) {
            this.applyIssueFilters();
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


    handlePageSize($event: PaginationEvent, isForIssue: boolean) {
        if (isForIssue) {
            this.updateIssueItems();
        } else {
            this.updatePatches();
        }
    }

    handlePageNumber($event: PaginationEvent, isForIssue: boolean) {
        if (isForIssue) {
            this.updateIssueItems();
        } else {
            this.updatePatches();
        }
    }

    updateIssueItems() {
        this.issues = this.filteredIssues.slice((this.issuePaginationConfig.pageNumber - 1) * this.issuePaginationConfig.pageSize,
            this.issuePaginationConfig.totalItems).slice(0, this.issuePaginationConfig.pageSize);
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
        if (filter.field.id === 'version') {
            match = item.release.version.versionNumber.indexOf(filter.value) !== -1;
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

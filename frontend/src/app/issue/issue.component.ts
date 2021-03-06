import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { IssueService } from './shared/issue.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent,
    SortField,
    SortEvent,
    CopyService,
    FilterField
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { Issue } from './shared/issue.model';
import { ISSUE_CONSTANT } from './shared/issue.constant';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-issue',
    templateUrl: './issue.component.html',
    styleUrls: ['./issue.component.less']
})
export class IssueComponent implements OnInit, OnDestroy {
    @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    @ViewChild('createIssue') createIssueTemplate: TemplateRef<any>;
    @ViewChild('importIssue') importIssueTemplate: TemplateRef<any>;
    @ViewChild('updateIssue') updateIssueTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    actionConfig: ActionConfig;
    issueActionConfig: ActionConfig;
    isAscendingSort = false;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;
    currentSortField: SortField;

    issues: Issue[];
    filteredIssues: Issue[] = [];
    items: Issue[] = [];

    selectedIssue: Issue;

    paginationConfig: PaginationConfig;

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private modalService: BsModalService, private auth: AuthenticationService,
        private route: ActivatedRoute, private loc: Location, private copyService: CopyService, private router: Router) { }

    ngOnInit() {
        this.filterConfig = {
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

        this.issueActionConfig = {
            primaryActions: [{
                id: 'showMoreIssue',
                title: 'Show More',
                tooltip: 'Show Releases and patches mentionned by the issue'
            }, {
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

        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.actionConfig.primaryActions.unshift(
                    {
                        id: 'addIssue',
                        title: 'Add new issue',
                        tooltip: 'Add a new issue'
                    }, {
                        id: 'importIssues',
                        title: 'Import issues',
                        tooltip: 'Import new issues'
                    });

                this.issueActionConfig.primaryActions.push({
                    id: 'editIssue',
                    title: 'Edit issue',
                    tooltip: 'Edit issue'
                });
            }
        });

        this.sortConfig = {
            fields: [{
                id: 'reference',
                title: 'Reference',
                sortType: 'alpha'
            }, {
                id: 'globalReference',
                title: 'Global Reference',
                sortType: 'alpha'
            }, {
                id: 'container',
                title: 'Container',
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
            totalItems: this.filteredIssues.length
        } as PaginationConfig;

        this.subscriptions.push(this.route.queryParamMap.subscribe(params => {
            const filters: string[] = params.getAll('filter');
            this.filterConfig.appliedFilters = [];
            if (filters.length > 0) {
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
        }));
        this.getIssues();
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

    getIssues(): void {
        this.subscriptions.push(this.issueService.getIssues()
            .subscribe(newIssues => {
                this.issues = newIssues;
                this.issues.sort((item1: any, item2: any) => this.compare(item1, item2));
                this.applyFilters();
            }));
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    applyFilters(): void {
        this.filteredIssues = [];
        if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
            this.issues.forEach((item) => {
                if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
                    this.filteredIssues.push(item);
                }
            });
        } else {
            this.filteredIssues = this.issues;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredIssues.length;
        this.paginationConfig.pageNumber = 1;
        this.paginationConfig.totalItems = this.filteredIssues.length;
        this.updateItems();
    }

    filterChanged($event: FilterEvent): void {
        this.applyFilters();
        this.updateUrl();
    }

    private updateUrl(): void {
        let params: Params = null;
        if (this.filterConfig.appliedFilters.length > 0) {
            params = [];
            params['filter'] = [];
            this.filterConfig.appliedFilters.forEach(af => {
                params['filter'].push(af.field.id + '_' + (af.query ? af.query.id : af.value));
            });
        }
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: params
        });
    }

    matchesFilter(item: any, filter: Filter): boolean {
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
        if (action.id === 'addIssue') {
            this.openModal(this.createIssueTemplate);
        } else if (action.id === 'editIssue') {
            this.selectedIssue = item;
            this.openModal(this.updateIssueTemplate);
        } else if (action.id === 'showMoreIssue') {
            this.selectedIssue = item;
            this.router.navigate(['/issue', item.reference]);
        } else if (action.id === 'importIssues') {
            this.openModal(this.importIssueTemplate);
        } else if (action.id === 'openIssue') {
            const url = ISSUE_CONSTANT.constainer_urls[item.container] + item.reference;
            window.open(url, '_blank');
        } else if (action.id === 'copyURL') {
            this.copyURL();
        } else {
            console.log('handleAction: unknown action: ' + action.id);
        }
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

    handlePageSize($event: PaginationEvent) {
        this.updateItems();
    }

    handlePageNumber($event: PaginationEvent) {
        this.updateItems();
    }

    compare(item1: any, item2: any): number {
        let compValue = 0;
        if (this.currentSortField.id === 'reference') {
            compValue = this.compareReference(item1, item2);
        } else if (this.currentSortField.id === 'globalReference') {
            compValue = this.compareGlobalReference(item1, item2);
        } else if (this.currentSortField.id === 'container') {
            compValue = this.compareContainer(item1, item2);
        }

        if (compValue === 0) {
            compValue = this.compareReference(item1, item2);
        }
        if (!this.isAscendingSort) {
            compValue = compValue * -1;
        }
        return compValue;
    }

    compareGlobalReference(item1: any, item2: any): number {
        let compValue = 0;
        const globalReference1 = item1.globalReference || '';
        const globalReference2 = item2.globalReference || '';
        compValue = globalReference1.localeCompare(globalReference2);
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
    handleSortChanged($event: SortEvent): void {
        this.currentSortField = $event.field;
        this.isAscendingSort = $event.isAscending;
        this.issues.sort((item1: any, item2: any) => this.compare(item1, item2));
        this.applyFilters();
    }

    updateItems() {
        this.items = this.filteredIssues.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }

    onWizardClose(issuesChanged: Issue) {
        if (issuesChanged) {
            this.getIssues();
        }
        this.modalRef.hide();
    }

    onImportWizardClose(importSuccessfull: boolean) {
        if (importSuccessfull) {
            this.getIssues();
        }
        this.modalRef.hide();
    }
}

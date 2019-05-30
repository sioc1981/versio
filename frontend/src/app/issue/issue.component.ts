import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { IssueService } from './shared/issue.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent,
    SortField,
    SortEvent
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { Issue } from './shared/issue.model';
import { ISSUE_CONSTANT } from './shared/issue.constant';
import { AuthenticationService } from '../auth/authentication.service';

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

    constructor(private issueService: IssueService, private modalService: BsModalService, private auth: AuthenticationService) { }

    ngOnInit() {
        this.getIssues();

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
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            }]
        } as ActionConfig;

        this.auth.isLoggedIn().then(loggedIn => {
            if (loggedIn) {
                this.actionConfig = {
                    primaryActions: [{
                        id: 'addIssue',
                        title: 'Add new issue',
                        tooltip: 'Add a new issue'
                    }, {
                        id: 'importIssues',
                        title: 'Import issues',
                        tooltip: 'Import new issues'
                    }]
                } as ActionConfig;
                this.toolbarConfig.actionConfig = this.actionConfig;

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

    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getIssues(): void {
        this.subscriptions.push(this.issueService.getIssues()
            .subscribe(newIssues => { this.issues = newIssues; this.applyFilters(); }));
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
        } else if (action.id === 'importIssues') {
            this.openModal(this.importIssueTemplate);
        } else if (action.id === 'openIssue') {
            const url = ISSUE_CONSTANT.constainer_urls[item.container] + item.reference;
            window.open(url, '_blank');
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

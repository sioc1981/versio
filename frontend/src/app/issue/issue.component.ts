import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { IssueService } from './shared/issue.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { Issue } from './shared/issue.model';
import { ISSUE_CONSTANT } from './shared/issue.constant';

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
    isAscendingSort = true;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;

    issues: Issue[];
    filteredIssues: Issue[] = [];
    items: Issue[] = [];

    selectedIssue: Issue;

    paginationConfig: PaginationConfig;

    private subscriptions: Subscription[] = [];

    constructor(private issueService: IssueService, private modalService: BsModalService) { }

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

        this.issueActionConfig = {
            primaryActions: [{
                id: 'openIssue',
                title: 'Open issue',
                tooltip: 'Open issue in an new tab'
            } , {
                id: 'editIssue',
                title: 'Edit issue',
                tooltip: 'Edit issue'
            }]
        } as ActionConfig;

        this.toolbarConfig = {
            filterConfig: this.filterConfig,
            actionConfig: this.actionConfig
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

    updateItems() {
        this.items = this.filteredIssues.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }
}

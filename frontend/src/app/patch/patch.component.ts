import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Patch } from './shared/Patch';
import { PatchService } from './shared/patch.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch',
    templateUrl: './patch.component.html',
    styleUrls: ['./patch.component.less']
})
export class PatchComponent implements OnInit, OnDestroy {
    @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    @ViewChild('createPatch') createPatchTemplate: TemplateRef<any>;
    @ViewChild('updatePatch') updatePatchTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    actionConfig: ActionConfig;
    patchActionConfig: ActionConfig;
    isAscendingSort = true;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;

    patches: Patch[];
    filteredPatches: Patch[] = [];
    items: Patch[] = [];

    selectedPatch: Patch;

    paginationConfig: PaginationConfig;

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;

    private subscriptions: Subscription[] = [];

    constructor(private patchService: PatchService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getPatchs();
        this.filterConfig = {
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

        this.actionConfig = {
            primaryActions: [{
                id: 'addPatch',
                title: 'Add new patch',
                tooltip: 'Add a new patch'
            }]
        } as ActionConfig;

        this.patchActionConfig = {
            primaryActions: [{
                id: 'editPatch',
                title: 'Edit patch',
                tooltip: 'Edit patch'
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
            totalItems: this.filteredPatches.length
        } as PaginationConfig;

    }
   /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getPatchs(): void {
        this.subscriptions.push(this.patchService.getPatchs()
            .subscribe(newPatchs => { this.patches = newPatchs; this.applyFilters(); }));
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    applyFilters(): void {
        this.filteredPatches = [];
        if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
            this.patches.forEach((item) => {
                if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
                    this.filteredPatches.push(item);
                }
            });
        } else {
            this.filteredPatches = this.patches;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredPatches.length;
        this.paginationConfig.pageNumber = 1;
        this.paginationConfig.totalItems = this.filteredPatches.length;
        this.updateItems();
    }
    filterChanged($event: FilterEvent): void {
        this.applyFilters();
    }

    matchesFilter(item: any, filter: Filter): boolean {
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
        if (action.id === 'addPatch') {
            this.openModal(this.createPatchTemplate);
        } else if (action.id === 'editPatch') {
            this.selectedPatch = item;
            this.openModal(this.updatePatchTemplate);
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
        this.items = this.filteredPatches.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }
}

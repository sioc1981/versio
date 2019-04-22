import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Release } from './shared/Release';
import { ReleaseService } from './shared/release.service';
import {
    WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { ReleaseFull } from './shared/ReleaseFull';
import { Subscription } from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';

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
    isAscendingSort = true;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;

    releases: ReleaseFull[] = [];
    filteredReleases: ReleaseFull[] = [];
    items: ReleaseFull[] = [];

    selectedRelease: ReleaseFull;

    paginationConfig: PaginationConfig;

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;
    patchIconStyleClass = PATCH_CONSTANT.iconStyleClass;

    private subscriptions: Subscription[] = [];

    constructor(private releaseService: ReleaseService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getReleases();
        this.filterConfig = {
            fields: [{
                id: 'version',
                title: 'Version',
                placeholder: 'Filter by Version...',
                type: FilterType.TEXT
            }],
            resultsCount: this.filteredReleases.length,
            appliedFilters: []
        } as FilterConfig;

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

        this.toolbarConfig = {
            filterConfig: this.filterConfig,
            actionConfig: this.actionConfig
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

    getReleases(): void {
        this.subscriptions.push(this.releaseService.getFullReleases()
            .subscribe(newReleases => { this.releases = newReleases; this.applyFilters(); }));
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
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
        if (filter.field.id === 'version') {
            match = item.release.version.versionNumber.indexOf(filter.value) !== -1;
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

    updateItems() {
        this.items = this.filteredReleases.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }
}

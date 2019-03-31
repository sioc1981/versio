import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Version } from './shared/Version';
import { VersionService } from './shared/version.service';
import { WizardEvent, FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action } from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-version',
    templateUrl: './version.component.html',
    styleUrls: ['./version.component.less']
})
export class VersionComponent implements OnInit {
    @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    @ViewChild('createVersion') createVersionTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    actionConfig: ActionConfig;
    isAscendingSort = true;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;

    versions: Version[] = [];
    filteredVersions: Version[] = [];

    constructor(private versionService: VersionService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getVersions();
        this.filterConfig = {
            fields: [{
                id: 'name',
                title: 'Name',
                placeholder: 'Filter by Name...',
                type: FilterType.TEXT
            }],
            resultsCount: this.filteredVersions.length,
            appliedFilters: []
        } as FilterConfig;

        this.actionConfig = {
            primaryActions: [{
                id: 'addVersion',
                title: 'Add new version',
                tooltip: 'Add a new Version'
            }]
        } as ActionConfig;

        this.toolbarConfig = {
            filterConfig: this.filterConfig,
            actionConfig: this.actionConfig
        } as ToolbarConfig;
    }

    getVersions(): void {
        this.versionService.getVersions()
            .subscribe(newVersions => { this.versions = newVersions; this.applyFilters(); });
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        console.log('openModal');
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        console.log('openModal: ' + this.modalRef);
    }

    applyFilters(): void {
        this.filteredVersions = [];
        if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
            this.versions.forEach((item) => {
                if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
                    this.filteredVersions.push(item);
                }
            });
        } else {
            this.filteredVersions = this.versions;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredVersions.length;
    }
    filterChanged($event: FilterEvent): void {
        this.applyFilters();
    }

    matchesFilter(item: any, filter: Filter): boolean {
        let match = true;
        if (filter.field.id === 'name') {
            match = item.versionNumber.indexOf(filter.value) !== -1;
        }
        return match;
    }

    matchesFilters(item: any, filters: Filter[]): boolean {
        if (filters.length === 0) {
            return true;
        }
        let matches = false;
        filters.forEach((filter) => {
            if (this.matchesFilter(item, filter)) {
                matches = true;
                return matches;
            }
        });
        return matches;
    }

    handleAction(action: Action): void {
        if (action.id === 'addVersion') {
            this.openModal(this.createVersionTemplate);
        }
    }

}

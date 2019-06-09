import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Patch } from './shared/patch.model';
import { PatchService } from './shared/patch.service';
import {
    FilterConfig, ToolbarConfig, FilterType, FilterEvent, Filter, SortConfig, ActionConfig, Action,
    PaginationConfig,
    PaginationEvent,
    SortEvent,
    SortField,
    CopyService,
    FilterField
} from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';
import { AuthenticationService } from '../auth/authentication.service';
import { Location } from '@angular/common';

@Component( {
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch',
    templateUrl: './patch.component.html',
    styleUrls: ['./patch.component.less']
} )
export class PatchComponent implements OnInit, OnDestroy {
    @ViewChild( 'wizardTemplate' ) wizardTemplate: TemplateRef<any>;
    @ViewChild( 'createPatch' ) createPatchTemplate: TemplateRef<any>;
    @ViewChild( 'importPatch' ) importPatchTemplate: TemplateRef<any>;
    @ViewChild( 'updatePatch' ) updatePatchTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    actionConfig: ActionConfig;
    patchActionConfig: ActionConfig;
    isAscendingSort = false;
    filterConfig: FilterConfig;
    sortConfig: SortConfig;
    toolbarConfig: ToolbarConfig;
    currentSortField: SortField;

    patches: Patch[] = [];
    filteredPatches: Patch[] = [];
    items: Patch[] = [];

    selectedPatch: Patch;

    paginationConfig: PaginationConfig;

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;

    private subscriptions: Subscription[] = [];

    constructor( private patchService: PatchService, private modalService: BsModalService, private auth: AuthenticationService,
        private zone: NgZone, private route: ActivatedRoute, private loc: Location, private copyService: CopyService ) { }

    ngOnInit() {
        this.reloadData();
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
                title: 'Issue',
                placeholder: 'Filter by issue...',
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

        this.auth.isLoggedIn().then( loggedIn => {
            if ( loggedIn ) {
                this.actionConfig = {
                    primaryActions: [{
                        id: 'addPatch',
                        title: 'Add new patch',
                        tooltip: 'Add a new patch'
                    }, {
                        id: 'importPatch',
                        title: 'Import patches',
                        tooltip: 'Import patches'
                    }, {
                        id: 'copyURL',
                        title: 'Copy URL',
                        tooltip: 'Copy URL with current filters'
                    }]
                } as ActionConfig;
                this.toolbarConfig.actionConfig = this.actionConfig;

                this.patchActionConfig = {
                    primaryActions: [{
                        id: 'editPatch',
                        title: 'Edit patch',
                        tooltip: 'Edit patch'
                    }]
                } as ActionConfig;
            }
        } );

        this.sortConfig = {
            fields: [{
                id: 'version',
                title: 'Version',
                sortType: 'alpha'
            }, {
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
            totalItems: this.filteredPatches.length
        } as PaginationConfig;

        this.route.queryParamMap.subscribe( params => {
            const filters: string[] = params.getAll( 'filter' );
            if ( filters.length > 0 ) {
                this.filterConfig.appliedFilters = [];
                filters.forEach( filter => {
                        this.filterConfig.fields.forEach(ff => {
                            if (ff.queries) {
                                this.addFilterQueryFromParam(filter, ff, this.filterConfig);
                            } else {
                                this.addFilterFromParam(filter, ff, this.filterConfig);
                            }
                        });
                } );
                this.applyFilters();
            }
        });

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
        this.subscriptions.forEach( sub => sub.unsubscribe );
    }

    reloadData(): void {
        this.subscriptions.push( this.patchService.getPatchs()
            .subscribe( newPatchs => {
                this.patches = newPatchs;
                this.patches = this.patches.sort(( item1: any, item2: any ) => this.compare( item1, item2 ) );
                this.applyFilters();
            } ) );
    }

    getPatch(): Patch {
        return this.selectedPatch;
    }

    openModal( template: TemplateRef<any> ): void {
        this.modalRef = this.modalService.show( template, { class: 'modal-lg' } );
    }

    applyFilters(): void {
        this.filteredPatches = [];
        if ( this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0 ) {
            this.patches.forEach(( item ) => {
                if ( this.matchesFilters( item, this.filterConfig.appliedFilters ) ) {
                    this.filteredPatches.push( item );
                }
            } );
        } else {
            this.filteredPatches = this.patches;
        }
        this.toolbarConfig.filterConfig.resultsCount = this.filteredPatches.length;
        this.paginationConfig.pageNumber = 1;
        this.paginationConfig.totalItems = this.filteredPatches.length;
        this.updateItems();
    }

    filterChanged( $event: FilterEvent ): void {
        this.applyFilters();
    }

    matchesFilter( item: any, filter: Filter ): boolean {
        let match = true;
        switch ( filter.field.id ) {

            case 'sequence':
                match = item.sequenceNumber.indexOf( filter.value ) !== -1;
                break;
            case 'version':
                match = item.release.version.versionNumber.indexOf( filter.value ) !== -1;
                break;
            case 'issue':
                let issueMatch = false;
                item.issues.forEach( issue => {
                    issueMatch = issueMatch || issue.reference.indexOf( filter.value ) !== -1
                        || issue.description.indexOf( filter.value ) !== -1;
                } );
                match = issueMatch;
                break;
            case 'onlyDeployed':
                match = !item.undeployed;
                break;
            case 'deployedOn':
                match = item[filter.query.id] && item[filter.query.id].deployDate
                    && !item[filter.query.id].undeployDate;
                break;
            case 'missingOn':
                match = !item[filter.query.id] || !item[filter.query.id].deployDate;
                break;
        }
        return match;
    }

    matchesFilters( item: any, filters: Filter[] ): boolean {
        if ( filters.length === 0 ) {
            return true;
        }
        let matches = true;
        let allMatches = new Map<string, boolean>();
        filters.forEach(( filter ) => {
            if ( allMatches.has( filter.field.id ) ) {
                allMatches = allMatches.set( filter.field.id, allMatches.get( filter.field.id ) || this.matchesFilter( item, filter ) );
            } else {
                allMatches = allMatches.set( filter.field.id, this.matchesFilter( item, filter ) );
            }
        } );
        allMatches.forEach( value => {
            matches = matches && value;
        } );
        return matches;
    }

    handleAction( action: Action, item?: any ): void {
        if ( action.id === 'addPatch' ) {
            this.openModal( this.createPatchTemplate );
        } else if ( action.id === 'editPatch' ) {
            this.selectedPatch = item;
            this.openModal( this.updatePatchTemplate );
        } else if ( action.id === 'importPatch' ) {
            this.openModal( this.importPatchTemplate );
        } else if (action.id === 'copyURL') {
            this.copyURL();
        } else {
            console.log( 'handleAction: unknown action: ' + action.id );
        }
    }

    handlePageSize( $event: PaginationEvent ) {
        this.updateItems();
    }

    handlePageNumber( $event: PaginationEvent ) {
        this.updateItems();
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
                urlToCopy = urlToCopy.concat(first ? '?' : '&', 'filter=' , af.field.id , '_' , af.query ? af.query.id : af.value);
                first = false;
            });
        }
        this.copyService.copy(urlToCopy);
    }

    compare( item1: any, item2: any ): number {
        let compValue = 0;
        if ( this.currentSortField.id === 'version' ) {
            compValue = this.compareVersion( item1, item2 );
        } else if ( this.currentSortField.id === 'sequenceNumber' ) {
            compValue = this.compareSequenceNumber( item1, item2 );
        } else if ( this.currentSortField.id === 'buildDate' ) {
            compValue = this.compareBuildDate( item1, item2 );
        } else if ( this.currentSortField.id === 'qualificationDate' ) {
            compValue = this.compareDeployDate( item1, item2, 'qualification' );
        } else if ( this.currentSortField.id === 'keyUserDate' ) {
            compValue = this.compareDeployDate( item1, item2, 'keyUser' );
        } else if ( this.currentSortField.id === 'pilotDate' ) {
            compValue = this.compareDeployDate( item1, item2, 'pilot' );
        } else if ( this.currentSortField.id === 'productionDate' ) {
            compValue = this.compareDeployDate( item1, item2, 'production' );
        }

        if ( compValue === 0 ) {
            compValue = this.compareVersion( item1, item2 );
        }
        if ( !this.isAscendingSort ) {
            compValue = compValue * -1;
        }
        return compValue;
    }

    compareVersion( item1: any, item2: any ): number {
        let compValue = 0;
        const sourceRelease1 = item1.release.version.versionNumber;
        const sourceRelease2 = item2.release.version.versionNumber;
        compValue = sourceRelease1.localeCompare( sourceRelease2 );
        return compValue;
    }

    compareSequenceNumber( item1: any, item2: any ): number {
        let compValue = 0;
        const seqNum1 = item1.sequenceNumber;
        const seqNum2 = item2.sequenceNumber;
        compValue = seqNum1.localeCompare( seqNum2 );
        return compValue;
    }

    compareBuildDate( item1: any, item2: any ): number {
        let compValue = 0;
        const sourceRelease1 = item1.release.buildDate;
        const sourceRelease2 = item2.release.buildDate;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }

    compareDeployDate( item1: any, item2: any, platform: string ): number {
        let compValue = 0;
        const sourceRelease1 = item1.release[platform] ? item1.release[platform].deployDate : 0;
        const sourceRelease2 = item2.release[platform] ? item2.release[platform].deployDate : 0;
        compValue = sourceRelease1 - sourceRelease2;
        return compValue;
    }


    // Handle sort changes
    handleSortChanged( $event: SortEvent ): void {
        this.currentSortField = $event.field;
        this.isAscendingSort = $event.isAscending;
        this.patches.sort(( item1: any, item2: any ) => this.compare( item1, item2 ) );
        this.applyFilters();
    }

    updateItems() {
        this.items = this.filteredPatches.slice(( this.paginationConfig.pageNumber - 1 ) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems ).slice( 0, this.paginationConfig.pageSize );
    }

    onWizardClose( patchChanged: Patch ) {
        if ( patchChanged ) {
            this.reloadData();
        }
        this.modalRef.hide();
    }

    onImportWizardClose( importSuccessfull: boolean ) {
        if ( importSuccessfull ) {
            this.reloadData();
        }
        this.modalRef.hide();
    }
}

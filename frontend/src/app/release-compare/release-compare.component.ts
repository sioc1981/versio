import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { Release } from '../release/shared/Release';
import { ReleaseService } from '../release/shared/release.service';
import { ActivatedRoute } from '@angular/router';
import { ReleaseComparison } from '../release/shared/ReleaseComparison';
import { Subscription } from 'rxjs';
import { VersionGraphConfig } from './version-graph-config';
import { SseService } from '../server-event/sse.service';
import {
    ToolbarConfig, TableConfig, SortConfig, PaginationConfig, FilterConfig, EmptyStateConfig,
    SortField, SortEvent, Filter, FilterEvent,
    FilterField, FilterType
} from 'patternfly-ng';

@Component({
    selector: 'app-release-compare',
    templateUrl: './release-compare.component.html',
    styleUrls: ['./release-compare.component.less']
})
export class ReleaseCompareComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('addressTemplate') addressTemplate: TemplateRef<any>;
    @ViewChild('birthMonthTemplate') birthMonthTemplate: TemplateRef<any>;
    @ViewChild('nameTemplate') nameTemplate: TemplateRef<any>;
    @ViewChild('weekDayTemplate') weekDayTemplate: TemplateRef<any>;

    @ViewChild('issueTemplate') issueTemplate: TemplateRef<any>;
    @ViewChild('sourcesTemplate') sourcesTemplate: TemplateRef<any>;
    @ViewChild('destTemplate') destTemplate: TemplateRef<any>;

    releases: Release[] = [];
    versionCompare: ReleaseComparison;
    fromVersion: string;
    toVersion: string;
    private subscriptions: Subscription[] = [];
    private itemIssuesSubscription: Subscription;

    issueItems: any[] = [];
    issueList: any = {};

    versionGrahConfig: VersionGraphConfig = {
        chartId: 'versionGraph',
        chartHeight: 200,
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            },
            y: {
                show: false
            }
        },
    };


    columns: any[];
    currentSortField: SortField;
    emptyStateConfig: EmptyStateConfig;
    filterConfig: FilterConfig;
    filteredRows: any[] = [];
    filtersText = '';
    isAscendingSort = true;
    paginationConfig: PaginationConfig;
    rows: any[];
    rowsAvailable = true;
    separator: Object;
    sortConfig: SortConfig;
    tableConfig: TableConfig;
    toolbarConfig: ToolbarConfig;

    constructor(private releaseService: ReleaseService, private route: ActivatedRoute, private sseService: SseService) { }

    ngOnInit() {
        this.getReleases();


        this.columns = [{
            cellTemplate: this.issueTemplate,
            draggable: false,
            prop: 'issue',
            name: 'Issue',
            resizeable: true,
            sortable: false // using sort menu
        }, {
            cellTemplate: this.sourcesTemplate,
            draggable: false,
            prop: 'sourceReleases',
            name: 'From Version',
            resizeable: true,
            sortable: false // using sort menu
        }, {
            cellTemplate: this.destTemplate,
            draggable: false,
            prop: 'destReleases',
            name: 'To Version',
            resizeable: true,
            sortable: false // using sort menu
        }];

        this.filteredRows = this.issueItems;

        this.paginationConfig = {
            pageNumber: 1,
            pageSize: 10,
            pageSizeIncrements: [5, 10, 15],
            totalItems: this.filteredRows.length
        } as PaginationConfig;

        // Need to initialize for results/total counts
        this.updateRows(false);

        this.filterConfig = {
            fields: [{
                id: 'issue',
                title: 'Issue',
                placeholder: 'Filter by Issue...',
                type: FilterType.TEXT
            }, {
                id: 'sourceRelease',
                title: 'From Release',
                placeholder: 'Filter by From Releases...',
                type: FilterType.SELECT,
                queries: this.generateFilterQueries(this.versionCompare ? this.versionCompare.sourceReleases : [])
            }, {
                id: 'destRelease',
                title: 'To Release',
                placeholder: 'Filter by To Releases...',
                type: FilterType.SELECT,
                queries: this.generateFilterQueries(this.versionCompare ? this.versionCompare.destReleases : [])
            }] as FilterField[],
            appliedFilters: [],
            resultsCount: this.rows.length,
            totalCount: this.issueItems.length
        } as FilterConfig;


        this.sortConfig = {
            fields: [{
                id: 'issue',
                title: 'Issue',
                sortType: 'alpha'
            }, {
                id: 'sourceRelease',
                title: 'From Release',
                sortType: 'alpha'
            }, {
                id: 'destRelease',
                title: 'To Release',
                sortType: 'alpha'
            }],
            isAscending: this.isAscendingSort
        } as SortConfig;

        this.emptyStateConfig = {
            iconStyleClass: 'pficon-warning-triangle-o',
            title: 'No Issues Available',
            info: 'Please selec to 2 distinct releases and restart a comparison.'
        } as EmptyStateConfig;

        this.toolbarConfig = {
            filterConfig: this.filterConfig,
            sortConfig: this.sortConfig
        } as ToolbarConfig;

        this.tableConfig = {
            emptyStateConfig: this.emptyStateConfig,
            paginationConfig: this.paginationConfig,
            showCheckbox: false,
            toolbarConfig: this.toolbarConfig
        } as TableConfig;

        this.route.paramMap.subscribe(params => {
            this.fromVersion = params.get('fromVersion');
            this.toVersion = params.get('toVersion');
            if (params.has('fromVersion') && params.has('fromVersion')) {
                this.startCompare();
            }
        });
    }

    ngAfterViewInit(): void {
        this.updateRows(false); // Reinitialize expanded rows in order to render properly with tabs
    }
    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
        this.itemIssuesSubscription.unsubscribe();
        this.itemIssuesSubscription = null;

    }

    generateFilterQueries(releases: Release[]) {
        return releases.map(r => {
            return {
                id: r.version.versionNumber,
                value: r.version.versionNumber
            };
        });
    }
    getReleases(): void {
        this.subscriptions.push(this.releaseService.getReleases()
            .subscribe(newReleases => this.releases = newReleases.sort(this.sortVersionNumber)));
    }

    sortVersionNumber(release1: Release, release2: Release): number {
        const aVersion = release1.version.versionNumber;
        const bVersion = release2.version.versionNumber;
        return bVersion.localeCompare(aVersion);
    }

    startCompare(): void {
        this.issueItems.splice(0, this.issueItems.length);
        this.filteredRows.splice(0, this.issueItems.length);
        Object.keys(this.issueList).forEach(k => delete this.issueList[k]);
        this.filterConfig.appliedFilters = [];
        this.toolbarConfig.filterConfig.totalCount = 0;
        this.subscriptions.push(this.releaseService.compare(this.fromVersion, this.toVersion).subscribe(res => {
            this.versionCompare = res;
            this.filterConfig.fields[1].queries = this.generateFilterQueries(this.versionCompare ? this.versionCompare.sourceReleases : []);
            this.filterConfig.fields[2].queries = this.generateFilterQueries(this.versionCompare ? this.versionCompare.destReleases : []);
            if (this.itemIssuesSubscription) {
                this.itemIssuesSubscription.unsubscribe();
                this.itemIssuesSubscription = null;
            }
            this.itemIssuesSubscription = this.sseService.getIssueItems(res).subscribe(this.onIriReceive(), e => {
                if (e.currentTarget.readyState === 2) {
                    this.itemIssuesSubscription.unsubscribe();
                    this.itemIssuesSubscription = null;
                } else {
                    console.log(e);
                }
            });
        }));
    }

    onIriReceive() {
        return (iri) => {
            let current = this.issueList[iri.issueReference];
            if (current === undefined) {
                current = {
                    issue: iri.issue,
                    sourceReleases: [],
                    destReleases: []
                };
                this.issueList[iri.issueReference] = current;
                this.issueItems.push(current);
            }

            const sourceRelease = this.versionCompare.sourceReleases.find(value => {
                return value.version.versionNumber === iri.releaseVersion;
            });
            if (sourceRelease) {
                current.sourceReleases.push(sourceRelease);
            }
            const destRelease = this.versionCompare.destReleases.find(value =>
                value.version.versionNumber === iri.releaseVersion);
            if (destRelease) {
                current.destReleases.push(destRelease);
            }
            this.toolbarConfig.filterConfig.totalCount = this.issueItems.length;
            this.updateRows(false);
        };
    }

    // Filter

    applyFilters(filters: Filter[]): void {
        this.filteredRows = [];
        if (filters && filters.length > 0) {
            this.issueItems.forEach((item) => {
                if (this.matchesFilters(item, filters)) {
                    this.filteredRows.push(item);
                }
            });
        } else {
            this.filteredRows = this.issueItems;
        }
        this.updateRows(true);
    }

    // Handle filter changes
    filterChanged($event: FilterEvent): void {
        this.filtersText = '';
        $event.appliedFilters.forEach((filter) => {
            this.filtersText += filter.field.title + ' : ' + filter.value + '\n';
        });
        this.applyFilters($event.appliedFilters);
    }

    matchesFilter(item: any, filter: Filter): boolean {
        let match = true;
        const re = new RegExp(filter.value, 'i');
        if (filter.field.id === 'name') {
            match = item.name.match(re) !== null;
        } else if (filter.field.id === 'address') {
            match = item.address.match(re) !== null;
        } else if (filter.field.id === 'birthMonth') {
            match = item.birthMonth === filter.value;
        } else if (filter.field.id === 'weekDay') {
            match = item.weekDay === filter.value;
        }
        return match;
    }

    matchesFilters(item: any, filters: Filter[]): boolean {
        let matches = true;
        filters.forEach((filter) => {
            if (!this.matchesFilter(item, filter)) {
                matches = false;
                return matches;
            }
        });
        return matches;
    }

    // Drag and drop

    // ngx-datatable
    updateRows(reset: boolean): void {
        if (reset) {
            this.paginationConfig.pageNumber = 1;
        }
        this.paginationConfig.totalItems = this.filteredRows.length;
        this.rows = this.filteredRows.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
            this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
    }

    // Sort

    compare(item1: any, item2: any): number {
        let compValue = 0;
        if (this.currentSortField.id === 'issue') {
            compValue = item1.issue.reference.localeCompare(item2.issue.reference);
        } else if (this.currentSortField.id === 'sourceRelease') {
            //compValue = item1.address.localeCompare(item2.address);
        }
        compValue = item1.issue.reference.localeCompare(item2.issue.reference);
        if (!this.isAscendingSort) {
            compValue = compValue * -1;
        }
        return compValue;
    }

    // Handle sort changes
    handleSortChanged($event: SortEvent): void {
        this.currentSortField = $event.field;
        this.isAscendingSort = $event.isAscending;
        this.issueItems.sort((item1: any, item2: any) => this.compare(item1, item2));
        this.applyFilters(this.filterConfig.appliedFilters || []);
    }

    // Selection

    updateItemsAvailable(): void {
        if (this.rowsAvailable) {
            this.filteredRows = this.issueItems;
            this.updateRows(false);
        } else {
            // Clear previously applied properties to simulate no rows available
            this.filterConfig.appliedFilters = [];
            this.rows = [];
        }
    }

    // 'issue-missing': row.destReleases.length === 0,
    //             'issue-new': row.sourceReleases.length === 0,
    //             'issue-exist': row.sourceReleases.length !== 0 && row.destReleases.length !== 0

}

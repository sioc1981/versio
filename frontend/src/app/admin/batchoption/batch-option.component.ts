import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActionConfig, FilterConfig, SortConfig, ToolbarConfig, SortField, PaginationConfig, FilterType, FilterField,
  Filter, FilterEvent, Action, SortEvent
} from 'patternfly-ng';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Subscription } from 'rxjs';
import { BatchOption } from './shared/batch-option.model';
import { BatchOptionService } from './shared/batch-option.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-batch-option',
  templateUrl: './batch-option.component.html',
  styleUrls: ['./batch-option.component.less']
})
export class BatchOptionComponent implements OnInit, OnDestroy {
  actionConfig: ActionConfig;
  batchOptionActionConfig: ActionConfig;
  isAscendingSort = false;
  filterConfig: FilterConfig;
  sortConfig: SortConfig;
  toolbarConfig: ToolbarConfig;
  currentSortField: SortField;

  batchOptions: BatchOption[] = [];
  filteredBatchOptions: BatchOption[] = [];
  items: BatchOption[] = [];

  selectedBatchOption: BatchOption;
  paginationConfig: PaginationConfig;


  private subscriptions: Subscription[] = [];

  constructor(private batchOptionService: BatchOptionService,
    private auth: AuthenticationService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.reloadData();
    this.filterConfig = {
      fields: [{
        id: 'key',
        title: 'Key',
        placeholder: 'Filter by Key...',
        type: FilterType.TEXT
      }],
      resultsCount: this.filteredBatchOptions.length,
      appliedFilters: []
    } as FilterConfig;

    this.auth.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.actionConfig = {
          primaryActions: [{
            id: 'addBatchOption',
            title: 'Add a batch option',
            tooltip: 'Add a batch option'
          }]
        } as ActionConfig;
        this.toolbarConfig.actionConfig = this.actionConfig;

        this.batchOptionActionConfig = {
            primaryActions: [{
                id: 'save',
                title: 'Save',
                tooltip: 'Save Batch Option'
            }]
        } as ActionConfig;
      }
    });

    this.sortConfig = {
      fields: [{
        id: 'key',
        title: 'Key',
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
      totalItems: this.filteredBatchOptions.length
    } as PaginationConfig;

    this.subscriptions.push(this.route.queryParamMap.subscribe(params => {
      const filters: string[] = params.getAll('filter');
      if (filters.length > 0) {
        this.filterConfig.appliedFilters = [];
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

  reloadData(): void {
    this.subscriptions.push(this.batchOptionService.getBatchOptions()
      .subscribe(newBatchOptions => {
        this.batchOptions = newBatchOptions;
        this.batchOptions = this.batchOptions.sort((item1: BatchOption, item2: BatchOption) => this.compare(item1, item2));
        this.applyFilters();
      }));
  }

  compare(item1: BatchOption, item2: BatchOption): number {
    let compValue = 0;
    const batchOptionName1 = item1.key;
    const batchOptionName2 = item2.key;
    compValue = batchOptionName1.localeCompare(batchOptionName2);
    if (!this.isAscendingSort) {
      compValue = compValue * -1;
    }
    return compValue;
  }

  applyFilters(): void {
    this.filteredBatchOptions = [];
    if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
      this.batchOptions.forEach((item) => {
        if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
          this.filteredBatchOptions.push(item);
        }
      });
    } else {
      this.filteredBatchOptions = this.batchOptions;
    }
    this.toolbarConfig.filterConfig.resultsCount = this.filteredBatchOptions.length;
    this.paginationConfig.pageNumber = 1;
    this.paginationConfig.totalItems = this.filteredBatchOptions.length;
    this.updateItems();
  }
  filterChanged($event: FilterEvent): void {
    this.applyFilters();
  }

  matchesFilter(item: any, filter: Filter): boolean {
    let match = true;
    switch (filter.field.id) {
      case 'key':
        match = item.key.indexOf(filter.value) !== -1;
        break;
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
    if (action.id === 'addBatchOption') {
      this.items.push(new BatchOption());
    } else if (action.id === 'save') {
        this.subscriptions.push(this.batchOptionService.updateBatchOption(item)
            .subscribe(_ => {
                item.updated = true;
            }, _ => {
                item.updated = false;
            }));
    } else {
      console.log('handleAction: unknown action: ' + action.id);
    }
  }

  handlePageSize() {
    this.updateItems();
  }

  handlePageNumber() {
    this.updateItems();
  }

  // Handle sort changes
  handleSortChanged($event: SortEvent): void {
    this.currentSortField = $event.field;
    this.isAscendingSort = $event.isAscending;
    this.batchOptions.sort((item1: any, item2: any) => this.compare(item1, item2));
    this.applyFilters();
  }

  updateItems() {
    this.items = this.filteredBatchOptions.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
      this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
  }

}

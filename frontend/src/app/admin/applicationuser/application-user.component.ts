import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {
  ActionConfig, FilterConfig, SortConfig, ToolbarConfig, SortField, PaginationConfig, FilterType, FilterField,
  CopyService, Filter, PaginationEvent, FilterEvent, Action, SortEvent
} from 'patternfly-ng';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Subscription } from 'rxjs';
import { ApplicationUser } from './shared/application-user.model';
import { ApplicationUserService } from './shared/application-user.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-application-user',
  templateUrl: './application-user.component.html',
  styleUrls: ['./application-user.component.less']
})
export class ApplicationUserComponent implements OnInit, OnDestroy {
  @ViewChild('createApplicationUser') createApplicationUserTemplate: TemplateRef<any>;
  @ViewChild('updateApplicationUser') updateApplicationUserTemplate: TemplateRef<any>;
  modalRef: BsModalRef;

  actionConfig: ActionConfig;
  applicationUserActionConfig: ActionConfig;
  isAscendingSort = false;
  filterConfig: FilterConfig;
  sortConfig: SortConfig;
  toolbarConfig: ToolbarConfig;
  currentSortField: SortField;

  applicationUsers: ApplicationUser[] = [];
  filteredApplicationUsers: ApplicationUser[] = [];
  items: ApplicationUser[] = [];

  selectedApplicationUser: ApplicationUser;
  paginationConfig: PaginationConfig;


  private subscriptions: Subscription[] = [];

  constructor(private applicationUserService: ApplicationUserService, private modalService: BsModalService,
    private auth: AuthenticationService, private route: ActivatedRoute, private loc: Location,
    private copyService: CopyService) { }

  ngOnInit() {
    this.reloadData();
    this.filterConfig = {
      fields: [{
        id: 'name',
        title: 'Name',
        placeholder: 'Filter by Name...',
        type: FilterType.TEXT
      }],
      resultsCount: this.filteredApplicationUsers.length,
      appliedFilters: []
    } as FilterConfig;

    this.auth.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.actionConfig = {
          primaryActions: [{
            id: 'addApplicationUser',
            title: 'Add an Application User',
            tooltip: 'Add a new Application User'
          }]
        } as ActionConfig;
        this.toolbarConfig.actionConfig = this.actionConfig;

        // this.applicationUserActionConfig = {
        //   primaryActions: [{
        //     id: 'editApplicationUser',
        //     title: 'Edit',
        //     tooltip: 'Edit the application user'
        //   }]
        // } as ActionConfig;
      }
    });

    this.sortConfig = {
      fields: [{
        id: 'name',
        title: 'Name',
        sortType: 'alpha'
      }, {
        id: 'country',
        title: 'Country',
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
      totalItems: this.filteredApplicationUsers.length
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
    this.subscriptions.push(this.applicationUserService.getApplicationUsers()
      .subscribe(newApplicationUsers => {
        this.applicationUsers = newApplicationUsers;
        this.applicationUsers = this.applicationUsers.sort((item1: ApplicationUser, item2: ApplicationUser) => this.compare(item1, item2));
        this.applyFilters();
      }));
  }

  compare(item1: ApplicationUser, item2: ApplicationUser): number {
    let compValue = 0;
    const applicationUserName1 = item1.name;
    const applicationUserName2 = item2.name;
    compValue = applicationUserName1.localeCompare(applicationUserName2);
    return compValue;
  }

  applyFilters(): void {
    this.filteredApplicationUsers = [];
    if (this.filterConfig.appliedFilters && this.filterConfig.appliedFilters.length > 0) {
      this.applicationUsers.forEach((item) => {
        if (this.matchesFilters(item, this.filterConfig.appliedFilters)) {
          this.filteredApplicationUsers.push(item);
        }
      });
    } else {
      this.filteredApplicationUsers = this.applicationUsers;
    }
    this.toolbarConfig.filterConfig.resultsCount = this.filteredApplicationUsers.length;
    this.paginationConfig.pageNumber = 1;
    this.paginationConfig.totalItems = this.filteredApplicationUsers.length;
    this.updateItems();
  }
  filterChanged($event: FilterEvent): void {
    this.applyFilters();
  }

  matchesFilter(item: any, filter: Filter): boolean {
    let match = true;
    switch (filter.field.id) {
      case 'version':
        match = item.release.version.versionNumber.indexOf(filter.value) !== -1;
        break;
      case 'issue':
        let issueMatch = false;
        item.issues.forEach(issue => {
          issueMatch = issueMatch || issue.reference.indexOf(filter.value) !== -1
            || issue.description.indexOf(filter.value) !== -1;
        });
        match = issueMatch;
        break;
      case 'onlyDeployed':
        match = !item.release.undeployed;
        break;
      case 'deployedOn':
        match = item.release[filter.query.id] && item.release[filter.query.id].deployDate
          && !item.release[filter.query.id].undeployDate;
        break;
      case 'toTestOn':
        match = item.release[filter.query.id] && item.release[filter.query.id].deployDate
          && !item.release[filter.query.id].validationDate
          && !item.release[filter.query.id].undeployDate;
        break;
      case 'missingOn':
        match = !item.release[filter.query.id] || !item.release[filter.query.id].deployDate;
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
    if (action.id === 'addApplicationUser') {
      this.openModal(this.createApplicationUserTemplate);
      // } else if (action.id === 'editApplicationUser') {
      //   this.selectedRelease = item;
      //   this.openModal(this.updateReleaseTemplate);
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

  // Handle sort changes
  handleSortChanged($event: SortEvent): void {
    this.currentSortField = $event.field;
    this.isAscendingSort = $event.isAscending;
    this.applicationUsers.sort((item1: any, item2: any) => this.compare(item1, item2));
    this.applyFilters();
  }

  updateItems() {
    this.items = this.filteredApplicationUsers.slice((this.paginationConfig.pageNumber - 1) * this.paginationConfig.pageSize,
      this.paginationConfig.totalItems).slice(0, this.paginationConfig.pageSize);
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  onWizardClose(applicationUserChanged: ApplicationUser) {
    if (applicationUserChanged) {
      this.reloadData();
    }
    this.modalRef.hide();
  }

}

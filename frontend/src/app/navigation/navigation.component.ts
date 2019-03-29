import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { VerticalNavigationItem } from 'patternfly-ng/navigation/vertical-navigation/vertical-navigation-item';
import { VERSION_CONSTANT } from '../version/shared/version.constants';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constants';
import { PATCH_CONSTANT } from '../patch/shared/patch.constants';
import { VerticalNavigationComponent } from 'patternfly-ng';
import { RELEASE_CONSTANT } from '../release/shared/release.constants';


@Component({
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:component-selector
  selector: 'app-navigation',
  styles: [`
    .example-page-container.container-fluid {
      position: fixed;
      top: 37px;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #f5f5f5;
      padding-top: 15px;
    }

    .hide-vertical-nav {
      margin-top: 15px;
      margin-left: 30px;
    }

    .navbar-brand-txt {
      line-height: 34px;
    }
  `],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit {

    @ViewChild('myNav') nav: VerticalNavigationComponent ;

  navigationItems: VerticalNavigationItem[];


  constructor(private chRef: ChangeDetectorRef, private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
      VERSION_CONSTANT.summary.count$.subscribe(c => this.navigationItems[1].badges[0].count = c);
      ISSUE_CONSTANT.summary.count$.subscribe(c => this.navigationItems[2].badges[0].count = c);
      PATCH_CONSTANT.summary.count$.subscribe(c => this.navigationItems[3].badges[0].count = c);
      RELEASE_CONSTANT.summary.count$.subscribe(c => this.navigationItems[4].badges[0].count = c);
    this.refreshItems();
  }

  refreshItems(): void {
      this.navigationItems = this.getItems();
  }

  getItems(): VerticalNavigationItem[] {
    return [
      {
        title: 'Dashboard',
        iconStyleClass: 'fa fa-dashboard',
        url: '/dashboard'
      },
      {
        title: VERSION_CONSTANT.title,
        iconStyleClass: VERSION_CONSTANT.iconStyleClass,
        url: VERSION_CONSTANT.url,
        badges: [
          {
            count: VERSION_CONSTANT.summary.count,
            tooltip: 'Total number of versions'
          }
        ]
      },
      {
        title: ISSUE_CONSTANT.title,
        iconStyleClass: ISSUE_CONSTANT.iconStyleClass,
        url: ISSUE_CONSTANT.url,
        badges: [
          {
            count: ISSUE_CONSTANT.summary.count,
            tooltip: 'Total number of issues'
          }
        ]
      },
      {
        title: PATCH_CONSTANT.title,
        iconStyleClass: PATCH_CONSTANT.iconStyleClass,
        url: PATCH_CONSTANT.url,
        badges: [
          {
            count: PATCH_CONSTANT.summary.count,
            tooltip: 'Total number of patchs'
          }
        ]
      },
      {
        title: RELEASE_CONSTANT.title,
        iconStyleClass: RELEASE_CONSTANT.iconStyleClass,
        url: RELEASE_CONSTANT.url,
        badges: [
          {
            count: RELEASE_CONSTANT.summary.count,
            tooltip: 'Total number of releases'
          }
        ]
      }
    ];
  }
  getOriginalItems(): VerticalNavigationItem[] {
      return [
      {
        title: 'Dashboard',
        iconStyleClass: 'fa fa-dashboard',
        url: '/verticalnavigation/dashboard'
      },
      {
        title: 'Dolor',
        iconStyleClass: 'fa fa-shield',
        url: '/verticalnavigation/dolor',
        badges: [
          {
            count: 1283,
            tooltip: 'Total number of items'
          }
        ]
      },
      {
        title: 'Ipsum',
        iconStyleClass: 'fa fa-space-shuttle',
        children: [
          {
            title: 'Intellegam',
            children: [
              {
                title: 'Recteque',
                url: '/verticalnavigation/ipsum/intellegam/recteque',
                badges: [
                  {
                    count: 6,
                    tooltip: 'Total number of error items',
                    badgeClass: 'example-error-background'
                  }
                ]
              },
              {
                title: 'Suavitate',
                url: '/verticalnavigation/ipsum/intellegam/suavitate',
                badges: [
                  {
                    count: 2,
                    tooltip: 'Total number of items'
                  }
                ]
              },
              {
                title: 'Vituperatoribus',
                url: '/verticalnavigation/ipsum/intellegam/vituperatoribus',
                badges: [
                  {
                    count: 18,
                    tooltip: 'Total number of warning items',
                    badgeClass: 'example-warning-background'
                  }
                ]
              }
            ]
          },
          {
            title: 'Copiosae',
            children: [
              {
                title: 'Exerci',
                url: '/verticalnavigation/ipsum/copiosae/exerci',
                badges: [
                  {
                    count: 2,
                    tooltip: 'Total number of error items',
                    iconStyleClass: 'pficon pficon-error-circle-o'
                  },
                  {
                    count: 6,
                    tooltip: 'Total number warning error items',
                    iconStyleClass: 'pficon pficon-warning-triangle-o'
                  }
                ]
              },
              {
                title: 'Quaeque',
                url: '/verticalnavigation/ipsum/copiosae/quaeque',
                badges: [
                  {
                    count: 0,
                    tooltip: 'Total number of error items',
                    iconStyleClass: 'pficon pficon-error-circle-o'
                  },
                  {
                    count: 4,
                    tooltip: 'Total number warning error items',
                    iconStyleClass: 'pficon pficon-warning-triangle-o'
                  }
                ]
              },
              {
                title: 'Utroque',
                url: '/verticalnavigation/ipsum/copiosae/utroque',
                badges: [
                  {
                    count: 1,
                    tooltip: 'Total number of error items',
                    iconStyleClass: 'pficon pficon-error-circle-o'
                  },
                  {
                    count: 2,
                    tooltip: 'Total number warning error items',
                    iconStyleClass: 'pficon pficon-warning-triangle-o'
                  }
                ]
              }
            ]
          },
          {
            title: 'Patrioque',
            children: [
              {
                title: 'Novum',
                url: '/verticalnavigation/ipsum/patrioque/novum'
              },
              {
                title: 'Pericula',
                url: '/verticalnavigation/ipsum/patrioque/pericula'
              },
              {
                title: 'Gubergren',
                url: '/verticalnavigation/ipsum/patrioque/gubergren'
              }
            ]
          },
          {
            title: 'Accumsan',
            url: '/verticalnavigation/ipsum/Accumsan',
            badges: [
              {
                count: 2,
                tooltip: 'Total number of error items',
                iconStyleClass: 'pficon pficon-error-circle-o'
              },
              {
                count: 6,
                tooltip: 'Total number warning error items',
                iconStyleClass: 'pficon pficon-warning-triangle-o'
              }
            ]
          }
        ]
      },
      {
        title: 'Amet',
        iconStyleClass: 'fa fa-paper-plane',
        children: [
          {
            title: 'Detracto',
            children: [
              {
                title: 'Delicatissimi',
                url: '/verticalnavigation/amet/detracto/delicatissimi'
              },
              {
                title: 'Aliquam',
                url: '/verticalnavigation/amet/detracto/aliquam'
              },
              {
                title: 'Principes',
                url: '/verticalnavigation/amet/detracto/principes'
              }
            ]
          },
          {
            title: 'Mediocrem',
            children: [
              {
                title: 'Convenire',
                url: '/verticalnavigation/amet/mediocrem/convenire'
              },
              {
                title: 'Nonumy',
                url: '/verticalnavigation/amet/mediocrem/nonumy'
              },
              {
                title: 'Deserunt',
                url: '/verticalnavigation/amet/mediocrem/deserunt'
              }
            ]
          },
          {
            title: 'Corrumpit',
            children: [
              {
                title: 'Aeque',
                url: '/verticalnavigation/amet/corrumpit/aeque'
              },
              {
                title: 'Delenit',
                url: '/verticalnavigation/amet/corrumpit/delenit'
              },
              {
                title: 'Qualisque',
                url: '/verticalnavigation/amet/corrumpit/qualisque'
              }
            ]
          },
          {
            title: 'urbanitas',
            url: '/verticalnavigation/amet/urbanitas'
          }
        ]
      },
      {
        title: 'Adipscing',
        iconStyleClass: 'fa fa-graduation-cap',
        url: '/verticalnavigation/adipscing'
      },
      {
        title: 'Lorem',
        iconStyleClass: 'fa fa-gamepad',
        url: '/verticalnavigation/lorem'
      }
    ];
  }

}

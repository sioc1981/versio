import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Release } from './shared/Release';
import { ReleaseService } from './shared/release.service';
import { WizardEvent, ActionConfig, Action } from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constants';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-release',
    templateUrl: './release.component.html',
    styleUrls: ['./release.component.less']
})
export class ReleaseComponent implements OnInit {
     @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    releases: Release[];

    issueIconStyleClass = ISSUE_CONSTANT.iconStyleClass;

    constructor(private releaseService: ReleaseService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getReleases();
    }

    getReleases(): void {
        this.releaseService.getReleases()
            .subscribe(newReleases => { this.releases = newReleases; console.log(JSON.stringify(newReleases)); });
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        console.log('openModal');
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        console.log('openModal: ' + this.modalRef );
    }

    /* Get the ActionConfig properties for each row
   *
   * @param item The current row item
   * @param actionButtonTemplate {TemplateRef} Custom button template
   * @param startButtonTemplate {TemplateRef} Custom button template
   * @returns {ActionConfig}
   */
  getActionConfig(item: any, actionButtonTemplate: TemplateRef<any>,
    startButtonTemplate: TemplateRef<any>): ActionConfig {
    const actionConfig = {
      primaryActions: [],
      moreActionsDisabled: true,
      moreActionsVisible: false
    } as ActionConfig;

    // Set button disabled
    if (item.started === true) {
      actionConfig.primaryActions[0].disabled = true;
    }

    // Set custom properties for row
    if (item.name === 'John Smith') {
      actionConfig.moreActionsStyleClass = 'red'; // Set kebab option text red
      actionConfig.primaryActions[1].visible = false; // Hide first button
      actionConfig.primaryActions[2].disabled = true; // Set last button disabled
      actionConfig.primaryActions[3].styleClass = 'red'; // Set last button text red
      actionConfig.moreActions[0].visible = false; // Hide first kebab option
    }

    // Hide kebab
    if (item.name === 'Frank Livingston') {
      actionConfig.moreActionsVisible = false;
    }
    return actionConfig;
  }

    handleAction($event: Action, item: any): void {
    if ($event.id === 'start' && item !== null) {
      item.started = true;
    }
  }
}

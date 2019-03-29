import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Patch } from './shared/Patch';
import { PatchService } from './shared/patch.service';
import { WizardEvent, ActionConfig, Action } from 'patternfly-ng';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-patch',
    templateUrl: './patch.component.html',
    styleUrls: ['./patch.component.less']
})
export class PatchComponent implements OnInit {
     @ViewChild('wizardTemplate') wizardTemplate: TemplateRef<any>;
    modalRef: BsModalRef;

    patchs: Patch[];

    constructor(private patchService: PatchService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getPatchs();
    }

    getPatchs(): void {
        this.patchService.getPatchs()
            .subscribe(newPatchs => { this.patchs = newPatchs; console.log(JSON.stringify(newPatchs)); });
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

    // if (!item.buildDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add build Date',
    //     tooltip: 'Perform an action'
    //   });
    // }

    // if (!item.packageDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add package Date',
    //     tooltip: 'Perform an action'
    //   });
    // }

    // if (!item.qualificationDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add qualification Date',
    //     tooltip: 'Perform an action'
    //   });
    // }

    // if (!item.kuQualificationDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add ku Qualification Date',
    //     tooltip: 'Perform an action'
    //   });
    // }

    // if (!item.pilotDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add pilot Date',
    //     tooltip: 'Perform an action'
    //   });
    // }
    // if (!item.productionDate ) {
    //     actionConfig.primaryActions.push({
    //     id: 'action1',
    //     title: 'Add production Date',
    //     tooltip: 'Perform an action'
    //   });
    // }

    // Set button disabled
    if (item.started === true) {
      actionConfig.primaryActions[0].disabled = true;
    }

    return actionConfig;
  }

    handleAction($event: Action, item: any): void {
    if ($event.id === 'start' && item !== null) {
      item.started = true;
    }
  }
}

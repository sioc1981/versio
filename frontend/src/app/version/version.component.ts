import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Version } from './shared/Version';
import { VersionService } from './shared/version.service';
import { WizardEvent } from 'patternfly-ng';
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
    modalRef: BsModalRef;

    versions: Version[];

    constructor(private versionService: VersionService, private modalService: BsModalService) { }

    ngOnInit() {
        this.getVersions();
    }

    getVersions(): void {
        this.versionService.getVersions()
            .subscribe(newVersions => this.versions = newVersions);
    }

    closeModal($event: WizardEvent): void {
        this.modalRef.hide();
    }

    openModal(template: TemplateRef<any>): void {
        console.log('openModal');
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        console.log('openModal: ' + this.modalRef );
    }

}

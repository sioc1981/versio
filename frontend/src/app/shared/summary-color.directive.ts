import { Directive, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { PlatformSummary } from './platform.model';

@Directive({
    selector: '[appSummaryColor]'
})
export class SummaryColorDirective implements OnInit {
    @Input('appSummaryColor') appSummaryColor: PlatformSummary;
    @Input() appSummaryType: string;
    @Input() appSummaryPatch = 0;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {
    }

    ngOnInit() {
        if (this.appSummaryType === 'release') {
            this.applyReleaseColor();
        } else if (this.appSummaryType === 'patch') {
            this.applyPatchColor();
        }
    }

    applyReleaseColor(): void {
        if (!this.appSummaryColor || !this.appSummaryColor.deployed) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'To be deployed');
        } else if (this.appSummaryColor.undeployed) {
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'No more deployed');
        } else if (this.appSummaryColor.validated) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Deployed and validated');
        } else {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Need to be validated');
        }
        
    }

    applyPatchColor(): void {
        if (!this.appSummaryColor || !this.appSummaryColor.deployed) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'To be deployed');
        } else if (this.appSummaryColor.undeployed) {
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'No more deployed');
        } else if (this.appSummaryColor.deployedPatchCount !== this.appSummaryPatch) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Missing patch(es)');
        } else if (this.appSummaryColor.validedPatchCount === this.appSummaryPatch) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Patches deployed and validated');
        } else {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Deployed Patches to be validated');
        }
    }
}

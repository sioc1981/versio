import { Directive, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { PlatformSummary } from './PlatformSummary';

@Directive({
    selector: '[appSummaryColor]'
})
export class SummaryColorDirective implements OnInit {
    @Input('appSummaryColor') appSummaryColor: PlatformSummary;
    @Input('appSummaryType') appSummaryType: string;
    @Input('appSummaryPatch') appSummaryPatch: number = 0;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {
    }

    ngOnInit() {
        if (this.appSummaryType === 'release') {
            this.applyReleaseColor();
        } else if (this.appSummaryType === 'release') {
            this.applyPatchColor();
        }
    }

    applyReleaseColor(): void {
        if (!this.appSummaryColor || !this.appSummaryColor.deployed) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
        } else if (this.appSummaryColor.validated) {
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
        } else {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-orange');
        }
    }

    applyPatchColor(): void {
        if (!this.appSummaryColor || !this.appSummaryColor.deployed) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
        } else if (this.appSummaryColor.deployedPatchCount !== this.appSummaryPatch) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-red');
        } else if (this.appSummaryColor.validedPatchCount === this.appSummaryPatch) {
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
        } else {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
        }
    }
}

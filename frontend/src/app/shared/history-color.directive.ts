import { Directive, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appHistoryColor]'
})
export class HistoryColorDirective implements OnInit {
    @Input('appHistoryColor') appHistoryColor: any;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {
    }

    ngOnInit() {
       if (!this.appHistoryColor || !this.appHistoryColor.validationDate && !this.appHistoryColor.deployDate ) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'To be deployed');
       } else if (this.appHistoryColor.undeployDate) {
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'No more deployed');
       } else if (this.appHistoryColor.validationDate) {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Deployed and validated');
        } else {
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-grey');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-green');
            this.renderer.addClass(this.hostElement.nativeElement, 'myApp-orange');
            this.renderer.removeClass(this.hostElement.nativeElement, 'myApp-red');
            this.renderer.setAttribute(this.hostElement.nativeElement, 'title', 'Need to be Validated');
         }
    }
}

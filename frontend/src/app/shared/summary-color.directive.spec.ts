import { SummaryColorDirective } from './summary-color.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PlatformSummary } from './platform.model';

@Component({
    template: `
        <span class="fas fa myApp myApp-store" [appSummaryColor]="production" appSummaryType="release"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="pilot" appSummaryType="release"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="keyUser" appSummaryType="release"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="qualification" appSummaryType="release"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="production" appSummaryType="patch" [appSummaryPatch]="nbPatches"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="production" appSummaryType="patch" [appSummaryPatch]="nbPatchesToDeploy"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="pilot" appSummaryType="patch" [appSummaryPatch]="nbPatches"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="keyUser" appSummaryType="patch" [appSummaryPatch]="nbPatches"></span>
        <span class="fas fa myApp myApp-store" [appSummaryColor]="qualification" appSummaryType="patch" [appSummaryPatch]="nbPatches"></span>
    `
})
class SummaryColorDirectiveTestComponent {
    nbPatches=5;
    nbPatchesToDeploy=6;

    production: PlatformSummary = {
        deployed: true,
        validated: true,
        undeployed: false,
        deployedPatchCount: 5,
        validedPatchCount: 5
    };
    
    pilot: PlatformSummary = {
        deployed: true,
        validated: false,
        undeployed: false,
        deployedPatchCount: 5,
        validedPatchCount: 4
    };

    keyUser: PlatformSummary = {
        deployed: false,
        validated: false,
        undeployed: false,
        deployedPatchCount: 5,
        validedPatchCount: 5
    };

    qualification: PlatformSummary = {
        deployed: true,
        validated: true,
        undeployed: true,
        deployedPatchCount: 5,
        validedPatchCount: 5
    };
}

describe('SummaryColorDirective', () => {
    let component: SummaryColorDirectiveTestComponent;
    let fixture: ComponentFixture<SummaryColorDirectiveTestComponent>;

    let des: DebugElement[];  // the three elements w/ the directive

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [SummaryColorDirective, SummaryColorDirectiveTestComponent]
        })
            .createComponent(SummaryColorDirectiveTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // initial binding

        // all elements with an attached HighlightDirective
        des = fixture.debugElement.queryAll(By.directive(SummaryColorDirective));

    });

    it('should have one SummaryColorDirective elements', () => {
        expect(des.length).toBe(9);
    });

    it('should 1st <span> have class "myApp-green"', () => {
        const classes = des[0].nativeElement.classList;
        expect(classes).toContain('myApp-green', 'constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });

    it('should 2nd <span> have class "myApp-orange"', () => {
        const classes = des[1].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).toContain('myApp-orange', 'constains myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });

    it('should 3rd <span> have no class myApp-*', () => {
        const classes = des[2].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'constains myApp-red');
    });

    it('should 4th <span> have class "myApp-gray"', () => {
        const classes = des[3].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).toContain('myApp-grey', 'constains myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });

    it('should 5th <span> have class "myApp-green"', () => {
        const classes = des[4].nativeElement.classList;
        expect(classes).toContain('myApp-green', 'constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });

    it('should 6th <span> have class "myApp-red"', () => {
        const classes = des[5].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).toContain('myApp-red', 'constains myApp-red');
    });

    it('should 7th <span> have class "myApp-orange"', () => {
        const classes = des[6].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).toContain('myApp-orange', 'constains myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });

    it('should 8th <span> have no class myApp-*', () => {
        const classes = des[7].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).not.toContain('myApp-grey', 'doesn\'t constain myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'constains myApp-red');
    });

    it('should 9th <span> have class "myApp-gray"', () => {
        const classes = des[8].nativeElement.classList;
        expect(classes).not.toContain('myApp-green', 'doesn\'t constains myApp-green');
        expect(classes).toContain('myApp-grey', 'constains myApp-grey');
        expect(classes).not.toContain('myApp-orange', 'doesn\'t constain myApp-orange');
        expect(classes).not.toContain('myApp-red', 'doesn\'t constain myApp-red');
    });
});

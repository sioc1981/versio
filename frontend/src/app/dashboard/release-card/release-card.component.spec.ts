import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCardComponent } from './release-card.component';
import { AppModule } from 'src/app/app.module';

describe('ReleaseCardComponent', () => {
    let component: ReleaseCardComponent;
    let fixture: ComponentFixture<ReleaseCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReleaseCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

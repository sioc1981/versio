import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCardChartContainerComponent } from './release-card-chart-container.component';
import { AppModule } from 'src/app/app.module';

describe('ReleaseCardChartContainerComponent', () => {
    let component: ReleaseCardChartContainerComponent;
    let fixture: ComponentFixture<ReleaseCardChartContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReleaseCardChartContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseImportComponent } from './release-import.component';
import { AppModule } from '../app.module';

describe('ReleaseImportComponent', () => {
  let component: ReleaseImportComponent;
  let fixture: ComponentFixture<ReleaseImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

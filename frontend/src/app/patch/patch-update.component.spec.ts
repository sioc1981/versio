import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchUpdateComponent } from './patch-update.component';
import { AppModule } from '../app.module';

describe('PatchUpdateComponent', () => {
  let component: PatchUpdateComponent;
  let fixture: ComponentFixture<PatchUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

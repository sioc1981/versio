import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerEventComponent } from './server-event.component';
import { AppModule } from '../app.module';

describe('ServerEventComponent', () => {
  let component: ServerEventComponent;
  let fixture: ComponentFixture<ServerEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

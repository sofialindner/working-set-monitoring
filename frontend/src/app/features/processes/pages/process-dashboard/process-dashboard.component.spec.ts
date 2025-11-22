import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDashboardComponent } from './process-dashboard.component';

describe('ProcessDashboardComponent', () => {
  let component: ProcessDashboardComponent;
  let fixture: ComponentFixture<ProcessDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

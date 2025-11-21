import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingSetChartComponent } from './working-set-chart.component';

describe('WorkingSetChartComponent', () => {
  let component: WorkingSetChartComponent;
  let fixture: ComponentFixture<WorkingSetChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingSetChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingSetChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

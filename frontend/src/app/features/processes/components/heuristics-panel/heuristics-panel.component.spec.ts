import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeuristicsPanelComponent } from './heuristics-panel.component';

describe('HeuristicsPanelComponent', () => {
  let component: HeuristicsPanelComponent;
  let fixture: ComponentFixture<HeuristicsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeuristicsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeuristicsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

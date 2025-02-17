import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlotComponentComponent } from './scatter-plot-component.component';

describe('ScatterPlotComponentComponent', () => {
  let component: ScatterPlotComponentComponent;
  let fixture: ComponentFixture<ScatterPlotComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterPlotComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterPlotComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

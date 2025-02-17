import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScatterPlotComponentComponent } from './features/scatter-plot-component/scatter-plot-component.component';

@Component({
  selector: 'app-root',
  imports: [ScatterPlotComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'graphics-app';
}

import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss'],
})
export class ScatterPlotComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;
  private data: any[] = [];
  private selectedData: Set<any> = new Set();
  private margin = { top: 20, right: 30, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private svg: any;
  private x: any;
  private y: any;
  private focus: any;
  private brush: any;
  private zoom: any;
  private circles: any;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.http.get<any[]>('assets/data.json').subscribe((data) => {
      this.data = data;
      this.createChart();
      this.addClearSelectionEvent();
    });
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.focus = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3
      .scaleLinear()
      .domain(
        d3.extent(this.data, (d) => d.Miles_per_Gallon) as [number, number]
      )
      .range([0, this.width]);

    this.y = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d) => d.Horsepower) as [number, number])
      .range([this.height, 0]);

    this.focus
      .append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    this.focus.append('g').call(d3.axisLeft(this.y));

    this.addGridLines();
    this.updateCircles();

    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('brush end', (event) => this.brushed(event));

    this.focus.append('g').attr('class', 'brush').call(this.brush);

    this.zoom = d3
      .zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', (event) => {
        this.focus.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);
  }

  private addGridLines(): void {
    this.focus
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.x)
          .tickSize(-this.height)
          .tickFormat(() => '')
      );

    this.focus
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(this.y)
          .tickSize(-this.width)
          .tickFormat(() => '')
      );
  }

  private brushed(event: any): void {
    if (!event.selection) return;
    const [[x0, y0], [x1, y1]] = event.selection;

    this.selectedData.clear();
    this.data.forEach((d) => {
      if (
        x0 <= this.x(d.Miles_per_Gallon) &&
        this.x(d.Miles_per_Gallon) <= x1 &&
        y0 <= this.y(d.Horsepower) &&
        this.y(d.Horsepower) <= y1
      ) {
        this.selectedData.add(d);
      }
    });

    this.updateCircles();
    this.updateSelectedList();
  }

  private updateCircles(): void {
    this.circles = this.focus
      .selectAll('circle')
      .data(this.data, (d: any) => d.Name);

    this.circles
      .enter()
      .append('circle')
      .attr('cx', (d: any) => this.x(d.Miles_per_Gallon))
      .attr('cy', (d: any) => this.y(d.Horsepower))
      .attr('r', 4)
      .attr('fill', (d: any) =>
        this.selectedData.has(d) ? 'red' : 'steelblue'
      )
      .merge(this.circles)
      .attr('fill', (d: any) =>
        this.selectedData.has(d) ? 'red' : 'steelblue'
      );

    this.circles.exit().remove();
  }

  private updateSelectedList(): void {
    const list = d3.select('#selected-data');
    list.html('');
    this.selectedData.forEach((d) => {
      list
        .append('li')
        .text(`${d.Name}: MPG ${d.Miles_per_Gallon}, HP ${d.Horsepower}`);
    });
  }

  private addClearSelectionEvent(): void {
    d3.select('#clear-selection').on('click', () => {
      this.data = this.data.filter((d) => !this.selectedData.has(d));
      this.selectedData.clear();
      this.updateCircles();
      this.updateSelectedList();
    });
  }
}

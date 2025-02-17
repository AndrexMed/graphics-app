import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

// import * as d3 from "d3";
// declare module 'd3';

@Component({
  selector: 'app-scatter-plot-component',
  imports: [],
  templateUrl: './scatter-plot-component.component.html',
  styleUrl: './scatter-plot-component.component.scss',
})
export class ScatterPlotComponentComponent {
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;
  private data: any[] = [];
  private margin = { top: 20, right: 30, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private svg: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private brush: any;
  private zoom: any;
  private focus: any;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.http.get<any[]>('assets/data.json').subscribe((data) => {
      this.data = data;
      this.createChart();
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

    this.xAxis = this.focus
      .append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    this.focus.append('g').call(d3.axisLeft(this.y));

    const circles = this.focus
      .selectAll('circle')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => this.x(d.Miles_per_Gallon))
      .attr('cy', (d: any) => this.y(d.Horsepower))
      .attr('r', 4)
      .attr('fill', 'steelblue');

    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('brush end', (event) => this.brushed(event, circles));

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

  private brushed(event: any, circles: any): void {
    if (!event.selection) return;
    const [[x0, y0], [x1, y1]] = event.selection;
    const selectedData = this.data.filter(
      (d) =>
        x0 <= this.x(d.Miles_per_Gallon) &&
        this.x(d.Miles_per_Gallon) <= x1 &&
        y0 <= this.y(d.Horsepower) &&
        this.y(d.Horsepower) <= y1
    );

    circles.attr('fill', (d: any) =>
      selectedData.includes(d) ? 'red' : 'steelblue'
    );

    const list = d3.select('#selected-data');
    list.html('');
    selectedData.forEach((d) => {
      list
        .append('li')
        .text(`${d.Name}: MPG ${d.Miles_per_Gallon}, HP ${d.Horsepower}`);
    });
  }
}

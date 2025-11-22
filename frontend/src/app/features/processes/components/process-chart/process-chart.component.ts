import { Component, ElementRef, ViewChild, signal, effect, Input } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';
import { ProcessesStore } from '../../state';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

@Component({
  selector: 'app-process-chart',
  standalone: true,
  templateUrl: './process-chart.component.html',
})
export class ProcessChartComponent {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  private intervalId!: number;
  private lastLength = 0;

  constructor(private store: ProcessesStore) {}

  ngAfterViewInit() {
    const context = this.canvas.nativeElement.getContext('2d')!;

    this.chart = new Chart(context, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Working Set (KB)',
            data: [],
            borderWidth: 2,
            borderColor: 'rgb(0, 171, 140)',
            backgroundColor: 'rgba(0, 171, 140, 0.3)',
            tension: 0.2,
            pointRadius: 3,
            pointBackgroundColor: 'rgb(0, 171, 140)',
            yAxisID: 'ws',
          },
          {
            label: 'Page Faults/s',
            data: [],
            borderWidth: 2,
            borderColor: 'rgb(82, 213, 82)',
            backgroundColor: 'rgba(82, 213, 82, 0.3)',
            tension: 0.2,
            pointRadius: 3,
            pointBackgroundColor: 'rgb(82, 213, 82)',
            yAxisID: 'pf',
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          ws: {
            type: 'linear',
            position: 'left',
            ticks: { color: 'grey' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            title: { display: true, text: 'Working Set (MB)', color: '#fff' }
          },
          pf: {
            type: 'linear',
            position: 'right',
            ticks: { color: 'grey' },
            grid: { drawOnChartArea: false, color: 'rgba(255,255,255,0.1)' },
            title: { display: true, text: 'Page Faults/s', color: '#fff' }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#fff',
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 12,
              boxHeight: 12,
              padding: 16
            }
          }
        }
      }
    });


    this.intervalId = window.setInterval(() => {
      const metrics = this.store.selectedMetrics();
      this.syncChart(metrics);
    }, 200);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  private syncChart(metrics: any[]) {
    if (!metrics.length) return;

    if (metrics.length === this.lastLength) return;
    this.lastLength = metrics.length;

    const last = metrics[metrics.length - 1];

    this.chart.data.labels!.push("");
    this.chart.data.datasets[0].data.push(last.working_set_size);
    this.chart.data.datasets[1].data.push(last.page_fault_count);

    const MAX_POINTS = 200;
    if (this.chart.data.labels!.length > MAX_POINTS) {
      this.chart.data.labels!.shift();
      this.chart.data.datasets.forEach(d => d.data.shift());
    }

    this.chart.update('none');
  }
}

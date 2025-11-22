import { Component } from '@angular/core';
import { ProcessChartComponent } from "../process-chart/process-chart.component";
import { CommonModule } from '@angular/common';
import { ProcessesStore } from '../../state';

@Component({
  selector: 'app-process-details',
  standalone: true,
  imports: [CommonModule, ProcessChartComponent],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss'
})
export class ProcessDetailsComponent {
  constructor(public store: ProcessesStore) {}
}

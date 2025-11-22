import { Component } from '@angular/core';
import { ProcessDetailsComponent, ProcessTableComponent } from '../../components';

@Component({
  selector: 'app-process-dashboard',
  standalone: true,
  imports: [ProcessTableComponent, ProcessDetailsComponent],
  templateUrl: './process-dashboard.component.html',
  styleUrl: './process-dashboard.component.scss'
})
export class ProcessDashboardComponent {
}

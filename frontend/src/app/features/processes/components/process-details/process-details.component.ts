import { Component } from '@angular/core';
import { ProcessChartComponent } from '../process-chart/process-chart.component';
import { CommonModule } from '@angular/common';
import { ProcessesStore } from '../../state';
import { ProcessService } from '../../services/process.service';
import { AppNotification, NotificationService } from '@core/notifications';

@Component({
  selector: 'app-process-details',
  standalone: true,
  imports: [CommonModule, ProcessChartComponent],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss',
})
export class ProcessDetailsComponent {
  constructor(
    public store: ProcessesStore,
    private processService: ProcessService,
    private notifications: NotificationService
  ) {}

  onTerminateProcess(pid: number) {
    this.processService.terminateProcess(pid).subscribe((response: any) => {
      //this.notifications.push(response.text, response.type);
      this.notifications.push(response.status);
    });
  }

  onClearWorkingSet(pid: number) {
    this.processService.clearWorkingSet(pid).subscribe((response: any) => {
      //this.notifications.push(response.text, response.type);
      this.notifications.push(response.status);
    });
  }
}

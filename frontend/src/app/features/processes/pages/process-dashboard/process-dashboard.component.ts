import { Component, signal } from '@angular/core';
import {
  HeuristicsPanelComponent,
  ProcessDetailsComponent,
  ProcessTableComponent,
} from '../../components';
import { MetricsStore } from '../../state';
import { TabsComponent } from '@shared/components';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-process-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProcessTableComponent,
    ProcessDetailsComponent,
    TabsComponent,
    HeuristicsPanelComponent
],
  templateUrl: './process-dashboard.component.html',
  styleUrl: './process-dashboard.component.scss',
})
export class ProcessDashboardComponent {
  tabs = [
    { label: "Processos", icon: "table" },
    { label: "Heurística", icon: "settings" }
  ];
  selectedTab = signal(0);

  constructor(public store: MetricsStore) {}

  selectTab(index: number) {
    this.selectedTab.set(index);
  }
}

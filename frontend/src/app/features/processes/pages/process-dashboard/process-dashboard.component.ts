import { Component, signal } from '@angular/core';
import {
  HeuristicsPanelComponent,
  ProcessDetailsComponent,
  ProcessTableComponent,
} from '../../components';
import { MetricsStore, ProcessesStore } from '../../state';
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
    { label: "Limpeza Automática", icon: "bolt" }
  ];
  selectedTab = signal(0);

  constructor(public store: MetricsStore, public processesStore: ProcessesStore) {}

  selectTab(index: number) {
    this.selectedTab.set(index);
  }
}

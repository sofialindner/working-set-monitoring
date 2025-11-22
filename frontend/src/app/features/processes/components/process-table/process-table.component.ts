import { Component, computed, signal } from '@angular/core';
import { ProcessesStore } from '../../state/processes.store';
import { CommonModule } from '@angular/common';
import { ProcessOrderBy } from '../../models/process.model';
import { FilterSelectComponent } from "../../../../shared/components";
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-process-table',
  imports: [
    CommonModule,
    FormsModule,
    FilterSelectComponent
],
  templateUrl: './process-table.component.html',
  styleUrl: './process-table.component.scss'
})
export class ProcessTableComponent {
  orderBy = signal<ProcessOrderBy>('working_set_size');

  constructor(public store: ProcessesStore) {}

  sortedProcesses = computed(() => {
    const processes = this.store.processes();
    const sortField = this.orderBy();

    return [...processes].sort((a, b) => {
      const firstValue = a[sortField];
      const secondValue = b[sortField];

      if (typeof firstValue === 'string') return firstValue.localeCompare(secondValue as string);
      return (secondValue as number) - (firstValue as number);
    });
  });

  sortBy(col: any) {
    this.orderBy.set(col);
  }
}

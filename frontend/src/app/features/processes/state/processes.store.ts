import { Injectable, computed, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';
import { Process } from '../models/process.model';

@Injectable({ providedIn: 'root' })
export class ProcessesStore {
  private _processes = signal<Process[]>([]);
  processes = this._processes.asReadonly();

  selectedPid = signal<number | null>(null);

  selectedProcess = computed(() => {
    const pid = this.selectedPid();
    if (!pid) return null;
    return this._processes().find(p => p.pid === pid) || null;
  });

  constructor(ws: WebSocketService) {
    this._processes.set([
        {
            pid: 2,
            name: 'Firefox',
            workingSet: 12,
            hardFaults: 23
        }
    ])
    effect(() => {
      const message = ws.message();
      if (message?.processes) this._processes.set(message.processes);
    });
  }

  select(pid: number) {
    this.selectedPid.set(pid);
  }
}

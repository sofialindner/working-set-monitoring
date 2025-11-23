import { Injectable, computed, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';
import { Process } from '../models/process.model';
import { Metric } from '../models/metrics.model';

@Injectable({ providedIn: 'root' })
export class ProcessesStore {
  private _processes = signal<Process[]>([]);
  processes = this._processes.asReadonly();

  private _processMetrics = signal<Map<number, Metric[]>>(new Map());

  selectedPid = signal<number | null>(null);

  selectedProcess = computed(() => {
    const pid = this.selectedPid();
    if (!pid) return null;
    return this._processes().find((p) => p.pid === pid) || null;
  });

  selectedMetrics = computed(() => {
    const pid = this.selectedPid();
    if (!pid) return [];
    return this._processMetrics().get(pid) ?? [];
  });

  greedyProcess = computed(() => {
    const list = this._processes();
    if (!list.length) return null;

    return list.reduce((max, p) =>
      p.working_set_size > max.working_set_size ? p : max
    );
  });

  constructor(ws: WebSocketService) {
    effect(() => {
      const message = ws.message();
      if (!message?.processes) return;

      const now = Date.now();

      this._processes.set(message.processes);

      this._processMetrics.update((map) => {
        const newMap = new Map(map);

        for (const p of message.processes) {
          const arr = newMap.get(p.pid) ?? [];

          arr.push({
            timestamp: now,
            working_set_size: p.working_set_size,
            page_fault_count: p.page_fault_count,
          });

          const TWENTY_SECONDS = 20_000;
          const cutoff = now - TWENTY_SECONDS;

          const filtered = arr.filter((item) => item.timestamp >= cutoff);

          newMap.set(p.pid, [...filtered]);
        }

        return newMap;
      });
    });
  }

  select(pid: number) {
    this.selectedPid.set(pid);
  }
}

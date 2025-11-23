import { Injectable, signal, effect } from '@angular/core';
import { WebSocketService } from '../../../core/websocket';

@Injectable({ providedIn: 'root' })
export class MetricsStore {
  totalProcesses = signal<number | null>(null);
  totalThreads = signal<number | null>(null);
  totalWorkingSetSizeGB = signal<number | null>(null);
  totalCleaned = signal<number>(0);

  constructor(ws: WebSocketService) {
    effect(() => {
      const msg = ws.message();
      if (msg?.total) this.totalProcesses.set(msg.total);
      if (msg?.thread_total) this.totalThreads.set(msg.thread_total);
      if (msg?.working_set_sizes_gb_total) this.totalWorkingSetSizeGB.set(msg.working_set_sizes_gb_total);
      if (msg?.total_cleaned) this.totalCleaned.set(msg.total_cleaned);
    });
  }
}

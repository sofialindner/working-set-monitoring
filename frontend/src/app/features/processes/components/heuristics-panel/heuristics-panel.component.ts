import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { NgxMaskDirective } from 'ngx-mask';
import { HeuristicsStore } from '../../state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../services/process.service';

@Component({
  selector: 'app-heuristics-panel',
  imports: [CommonModule, NgxMaskDirective, FormsModule],
  templateUrl: './heuristics-panel.component.html',
  styleUrl: './heuristics-panel.component.scss',
})
export class HeuristicsPanelComponent {
  @ViewChild('anchor') anchor!: ElementRef<HTMLElement>;
  @ViewChild('consoleContainer') container!: ElementRef<HTMLElement>;

  limitInput: number | null;

  constructor(
    public store: HeuristicsStore,
    private processService: ProcessService
  ) {
    this.limitInput = this.store.workingSetLimit();

    effect(() => {
      const logs = this.store.consoleLogs();
      if (!logs.length) return;
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  updateLimit(value: string | number) {
    this.limitInput = Number(value);
  }

  onSetWorkingSetLimit() {
    if (!this.limitInput) return;
    this.store.workingSetLimit.set(this.limitInput);
    this.processService.setWorkingSetLimit(this.limitInput);
  }

  getLogTypeColor(type: 'error' | 'success' | 'info'): string {
    if (type === 'error') return 'red';
    if (type === 'success') return 'var(--secondary-color';
    return 'var(--primary-color)';
  }

  private scrollToBottom() {
    if (!this.anchor || !this.container) return;

    const el = this.container.nativeElement;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth"
    });
  }
}

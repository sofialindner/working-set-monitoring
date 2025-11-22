import { Component } from '@angular/core';
import { NgxMaskDirective } from 'ngx-mask';
import { HeuristicsStore } from '../../state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heuristics-panel',
  imports: [CommonModule, NgxMaskDirective],
  templateUrl: './heuristics-panel.component.html',
  styleUrl: './heuristics-panel.component.scss',
})
export class HeuristicsPanelComponent {
  constructor(public store: HeuristicsStore) {}
}

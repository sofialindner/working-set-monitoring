import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export type TabItem = {
  label: string;
  icon?: string;
};

@Component({
  selector: 'app-tabs',
  imports: [
    CommonModule
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() active = 0;
  @Output() activeChange = new EventEmitter<number>();

  select(index: number) {
    this.activeChange.emit(index);
  }
}
import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-filter-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterSelectComponent,
      multi: true,
    }
  ],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent implements ControlValueAccessor {

  @Input() options: { label: string; value: any }[] = [];
  @Input() placeholder = 'Selecionar…';

  isOpen = signal(false);
  internalValue = signal<any>(null);
  selectedLabel = computed(() => {
    const v = this.internalValue();
    return this.options.find(o => o.value === v)?.label ?? this.placeholder;
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: any): void {
    this.internalValue.set(v);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  toggle() {
    this.isOpen.update(v => !v);
  }

  select(option: any) {
    this.internalValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.isOpen.set(false);
  }
}
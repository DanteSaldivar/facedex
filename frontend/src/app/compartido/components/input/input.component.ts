import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  selector: 'app-input',
  styleUrl: './input.component.scss',
  templateUrl: './input.component.html',
})
export class InputComponent implements ControlValueAccessor {

  label = input('');
  type = input('text');
  placeholder = input('');
  errorMessage = input('');
  isInvalid = input(false);

  value = '';
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouch: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.value = inputElement.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouch();
  }
}
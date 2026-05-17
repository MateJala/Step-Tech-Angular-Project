import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: ValidationErrors = {};

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors['noSpecialChar'] = true;
  if (!/[0-9]/.test(value))                   errors['noDigit'] = true;
  if (!/[A-Z]/.test(value))                   errors['noUppercase'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private fb = inject(FormBuilder);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
    confirmPassword: ['',[Validators.required]],
  });
  get currentPassword() {return this.passwordForm.get('currentPassword')}
  get newPassword() {return this.passwordForm.get('newPassword')}
  get confirmPassword() {return this.passwordForm.get('confirmPassword')}

  public showCurrentPassword = false;
  public showNewPassword = false;
  public showConfirmPassword = false;
  public submited = signal<boolean>(false);
  public deleteConfirm = signal<boolean>(false);
  onSubmit(){
  
  }
  deleteAccount(){
    
  }
}

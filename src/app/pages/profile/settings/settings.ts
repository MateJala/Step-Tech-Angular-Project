import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user-service';
import Swal from 'sweetalert2';

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
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
  });

  get currentPassword() { return this.passwordForm.get('currentPassword') }
  get newPassword() { return this.passwordForm.get('newPassword') }
  get confirmPassword() { return this.passwordForm.get('confirmPassword') }

  public showCurrentPassword = false;
  public showNewPassword = false;
  public showConfirmPassword = false;
  public submited = signal<boolean>(false);
  public deleteConfirm = signal<boolean>(false);
  public isLoading = signal<boolean>(false);

  onSubmit() {
    this.submited.set(true);
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) return;

    if (this.newPassword?.value !== this.confirmPassword?.value) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
        text: 'New password and confirm password must be the same.',
      });
      return;
    }

    this.isLoading.set(true);
    this.userService.changePassword({
      currentPassword: this.currentPassword?.value,
      newPassword: this.newPassword?.value,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.passwordForm.reset();
          this.submited.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Password Updated!',
            text: 'Your password has been changed successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Current password is incorrect or something went wrong.',
          });
        }
      });
  }

  deleteAccount() {
    this.userService.deleteProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteConfirm.set(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.deleteConfirm.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Something went wrong. Please try again.',
          });
        }
      });
  }
}
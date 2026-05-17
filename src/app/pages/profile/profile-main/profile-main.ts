import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../../services/user-service';
import Swal from 'sweetalert2';

function getFormErrors(form: FormGroup): string {
  const messages: string[] = [];

  if (form.get('firstName')?.errors?.['required']) messages.push('First name is required');
  if (form.get('firstName')?.errors?.['minlength']) messages.push('First name must be at least 2 characters');
  if (form.get('lastName')?.errors?.['required']) messages.push('Last name is required');
  if (form.get('lastName')?.errors?.['minlength']) messages.push('Last name must be at least 2 characters');
  if (form.get('phoneNumber')?.errors?.['minlength']) messages.push('Phone number must be at least 7 characters');
  if (form.get('phoneNumber')?.errors?.['maxlength']) messages.push('Phone number must be under 15 characters');
  if (form.get('address')?.errors?.['minlength']) messages.push('Address must be at least 5 characters');
  if (form.get('pictureUrl')?.errors?.['minlength']) messages.push('Picture URL must be at least 10 characters');

  return `<ul style="text-align:left; padding-left: 1.2rem">${messages.map(m => `<li>${m}</li>`).join('')}</ul>`;
}

@Component({
  selector: 'app-profile-main',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-main.html',
  styleUrl: './profile-main.scss',
})
export class ProfileMain implements OnInit {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  public hasChanges = signal(false);
  public isLoading = signal(false);

  profileForm: FormGroup = this.fb.group({
    pictureUrl: ['', [Validators.minLength(10), Validators.maxLength(500)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: ['', []],
    phoneNumber: ['', [Validators.minLength(7), Validators.maxLength(15)]],
    address: ['', [Validators.minLength(5), Validators.maxLength(200)]],
  });

  get pictureUrl() { return this.profileForm.get('pictureUrl') }
  get firstName() { return this.profileForm.get('firstName') }
  get lastName() { return this.profileForm.get('lastName') }
  get dateOfBirth() { return this.profileForm.get('dateOfBirth') }
  get phoneNumber() { return this.profileForm.get('phoneNumber') }
  get address() { return this.profileForm.get('address') }

  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const user = this.userService.user();
          if (user) {
            this.profileForm.patchValue({
              pictureUrl: user.details.pictureUrl ?? '',
              firstName: user.firstName,
              lastName: user.lastName,
              dateOfBirth: user.details.dob ? user.details.dob.substring(0, 10) : '',
              phoneNumber: user.details.phoneNumber ?? '',
              address: user.details.address ?? '',
            });
            this.profileForm.markAsPristine();
          }
        }
      });

    this.profileForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.hasChanges.set(this.profileForm.dirty);
      });
  }

  onSubmit() {
  this.profileForm.markAllAsTouched();
  console.log('form valid:', this.profileForm.valid);
  console.log('lastName errors:', this.profileForm.get('lastName')?.errors);
  console.log('lastName value:', this.profileForm.get('lastName')?.value);
  
    if (this.profileForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        html: getFormErrors(this.profileForm),
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!this.hasChanges()) return;

    const user = this.userService.user();
    const body = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: user!.email,
      phoneNumber: this.profileForm.value.phoneNumber === '' ? null : this.profileForm.value.phoneNumber,
      address: this.profileForm.value.address === '' ? null : this.profileForm.value.address,
      pictureUrl: this.profileForm.value.pictureUrl === '' ? null : this.profileForm.value.pictureUrl,
      dateOfBirth: this.profileForm.value.dateOfBirth !== ''
        ? new Date(this.profileForm.value.dateOfBirth).toISOString()
        : null,
    };

    this.isLoading.set(true);
    this.userService.updateUser(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.userService.getUser()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
          this.profileForm.markAsPristine();
          this.hasChanges.set(false);
          this.isLoading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: 'Your profile has been updated.',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again.',
          });
        }
      });
  }

  discardChanges() {
    const user = this.userService.user();
    if (user) {
      this.profileForm.patchValue({
        pictureUrl: user.details.pictureUrl ?? '',
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.details.dob ? user.details.dob.substring(0, 10) : '',
        phoneNumber: user.details.phoneNumber ?? '',
        address: user.details.address ?? '',
      });
      this.profileForm.markAsPristine();
      this.hasChanges.set(false);
    }
  }
}
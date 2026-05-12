import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal  from 'sweetalert2';
import { AuthService, registerBody } from '../../../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: ValidationErrors = {};

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors['noSpecialChar'] = true;
  if (!/[0-9]/.test(value))                   errors['noDigit'] = true;
  if (!/[A-Z]/.test(value))                   errors['noUppercase'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private router = inject(Router);
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  
  RegisterForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
  });
  get firstName() {return this.RegisterForm.get('firstName')}
  get lastName() {return this.RegisterForm.get('lastName')}
  get email() {return this.RegisterForm.get('email')}
  get password() {return this.RegisterForm.get('password')}

  public submited = signal<boolean>(false);

  onSubmit(): void {
    this.submited.set(true);
    let registerBody : registerBody = {
      firstName: this.firstName?.value,
      lastName: this.lastName?.value,
      email: this.email?.value,
      password: this.password?.value,
    }
    if (this.RegisterForm.valid) {
      this.register(registerBody);
    } else {
      const pw = this.password?.errors;
      const hasBasicErrors =
        this.firstName?.errors?.['required'] ||
        this.lastName?.errors?.['required'] ||
        this.email?.errors?.['required'] ||
        this.email?.errors?.['email'] ||
        pw?.['required'] ||
        pw?.['minlength'];
      const errors: string[] = [];
      if (pw?.['noUppercase'])                    errors.push('Password must contain at least one uppercase letter.');
      if (pw?.['noDigit'])                        errors.push('Password must contain at least one digit.');
      if (pw?.['noSpecialChar'])                  errors.push('Password must contain at least one special character.');
      if (this.firstName?.errors)                 errors.push('First name must be at least 2 characters.');
      if (this.lastName?.errors)                  errors.push('Last name must be at least 2 characters.');

      if (!hasBasicErrors && errors.length) {
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          title: 'Please fix the following errors',
          html: errors.map(e => `<p style="margin:4px 0">• ${e}</p>`).join('') + '<br><b></b>',
          icon: 'error',
          timer: 7000,
          timerProgressBar: true,
          didOpen: () => {
            const b = Swal.getPopup()?.querySelector('b');
            timerInterval = setInterval(() => {
              if (b) b.textContent = `Closing in ${((Swal.getTimerLeft() ?? 0) / 1000).toFixed(1)}s`;
            }, 100);
          },
          willClose: () => clearInterval(timerInterval),
        });
      }
    }
  }

  private register(info: registerBody): void {
    this.authService.Register(info)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.RegisterForm.reset();
        this.submited.set(false);
        this.router.navigate(['/auth/verification', info.email]);
      },
      error: (err) => {
        const message = err.error?.detail ?? 'Something went wrong. Please try again.';
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          title: 'Error',
          html: message,
          icon: 'error',
          timer: 4000,
          timerProgressBar: true,
          didOpen: () => {
            const b = Swal.getPopup()?.querySelector('b');
            timerInterval = setInterval(() => {
              if (b) b.textContent = `Closing in ${((Swal.getTimerLeft() ?? 0) / 1000).toFixed(1)}s`;
            }, 100);
          },
          willClose: () => clearInterval(timerInterval),
        });
      }
    });
  }
}

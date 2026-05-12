import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

@Component({
  selector: 'appforgot-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private router = inject(Router);
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  
  forgotPassword: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  get email() {return this.forgotPassword.get('email')}

  onSubmit(): void {
    if (this.forgotPassword.valid) {
      this.forgotPasswordFunction(this.email?.value)
    } else {
      this.forgotPassword.markAllAsTouched();
    }
  }
  private forgotPasswordFunction(email:string): void {
    this.authService.ForgotPassword(email)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          title: 'If the email exists, a reset link has been sent.',
          html: '',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          didOpen: () => {
            const b = Swal.getPopup()?.querySelector('b');
            timerInterval = setInterval(() => {
              if (b) b.textContent = `Closing in ${((Swal.getTimerLeft() ?? 0) / 1000).toFixed(1)}s`;
            }, 100);
          },
          willClose: () => clearInterval(timerInterval),
        });
      },
      error: (err) => {
        const message = err.error?.detail ?? 'Something went wrong. Please try again.';
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          title: 'Error',
          html: message,
          icon: 'error',
          timer: 3000,
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

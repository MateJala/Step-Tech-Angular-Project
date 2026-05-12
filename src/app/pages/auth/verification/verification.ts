import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verification',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './verification.html',
  styleUrl: './verification.scss',
})
export class Verification {
  private route = inject(ActivatedRoute)
  private router = inject(Router);
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  Verify: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6)]]
  });
  get code() {return this.Verify.get('code')}
  private email = this.route.snapshot.paramMap.get('email') ?? '';
  onSubmit(): void {
    
    if (this.Verify.valid) {
      this.verifyEmail(this.email, this.code?.value);
    } else if (this.Verify.touched) {
      let timerInterval: ReturnType<typeof setInterval>;
      Swal.fire({
        title: 'Error!',
        html: 'Invalid verification code.',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        didOpen: () => {
          const b = Swal.getPopup()?.querySelector('b');
          timerInterval = setInterval(() => {
          }, 100);
        },
        willClose: () => clearInterval(timerInterval),
      });
    }
  }


  private verifyEmail(email: string, code: string): void {
    this.authService.VerifyEmail(email, code)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          title: 'Login Successful!',
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
        this.Verify.reset();
        this.router.navigate(['/']);
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
  public resendCode():void{
    this.authService.ResendEmailVerification(this.email)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        let timerInterval: ReturnType<typeof setInterval>;
        Swal.fire({
          html: 'Verification code sent to your email.',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          didOpen: () => {
            const b = Swal.getPopup()?.querySelector('b');
            timerInterval = setInterval(() => {
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

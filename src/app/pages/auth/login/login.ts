import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  get email() {return this.loginForm.get('email')}
  get password() {return this.loginForm.get('password')}

  public RememberUser = signal<boolean>(false);
  toggleRememberMe(): void {
    this.RememberUser.update(v => !v);
  }

  public submited = signal<boolean>(false);
  onSubmit(): void {
    this.submited.set(true);
    let email = this.email?.value
    let password = this.password?.value
    if (this.loginForm.valid) {
      this.login(email, password);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private login(email:string, password:string): void {
    this.authService.Login(email, password)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        this.loginForm.reset();
        this.submited.set(false);
        this.router.navigate(['/']);
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

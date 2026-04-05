import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormGroup
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

  hidePassword = true;
  currentYear = new Date().getFullYear();

  form!: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [true]
    });
  }

  get emailCtrl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passwordCtrl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const payload = {
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;
        const email = response.email || payload.email;
        const userType = this.authService.getUserTypeFromAuthResponse(response);

        if (response.requiresTwoFactor) {
          // Reset any previous session so a stale ADMIN role cannot leak into OTP login.
          this.authService.clearSession();
          this.authService.savePendingOtpAuth(response, payload.email);

          this.router.navigate(['/auth/verify-otp'], {
            queryParams: { email }
          });
          return;
        }

        const token = response.accessToken || response.token;

        if (!token) {
          this.errorMsg = 'Unexpected login response: token missing';
          return;
        }
         localStorage.setItem("accessToken", token);

        this.authService.clearSession();
        this.authService.saveToken(token);
        this.authService.saveUserFromAuthResponse(response, payload.email);
        this.authService.saveUserEmail(email);

        if (userType === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('LOGIN ERROR =>', err);
        this.errorMsg = err?.error?.message || 'Invalid email or password';
      }
    });
  }
}

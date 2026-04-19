import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  hidePassword = true;
  isLoading = false;
  errorMsg = '';
  currentYear = new Date().getFullYear();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      agree: [false, [Validators.requiredTrue]]
    });
  }

  get fullName(): FormControl | null {
    return this.form.get('fullName') as FormControl;
  }

  get email(): FormControl | null {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl | null {
    return this.form.get('password') as FormControl;
  }

  get phone(): FormControl | null {
    return this.form.get('phone') as FormControl;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const payload = {
      fullName: this.form.value.fullName,
      email: this.form.value.email,
      password: this.form.value.password,
      phone: this.form.value.phone,
      userType: 'CLIENT',
      enabled: true
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/sign-in']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('SIGN UP ERROR =>', err);
        this.errorMsg = err?.error?.message || 'Registration failed';
      }
    });
  }
}
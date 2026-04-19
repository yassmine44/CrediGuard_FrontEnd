import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, Profile } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-front',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-front.component.html',
  styleUrls: ['./profile-front.component.scss']
})
export class ProfileFrontComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  saving = false;
  message = '';
  errorMessage = '';
  profile: Profile | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.loading = false;
        this.profile = res;

        this.form.patchValue({
          fullName: res.fullName,
          email: res.email,
          phone: res.phone || ''
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load profile';
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.message = '';
    this.errorMessage = '';

    this.profileService.updateMyProfile(this.form.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.profile = res;
        this.message = 'Profile updated successfully';
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile';
      }
    });
  }

  get initials(): string {
    if (!this.profile?.fullName) {
      return 'U';
    }

    return this.profile.fullName.charAt(0).toUpperCase();
  }
}
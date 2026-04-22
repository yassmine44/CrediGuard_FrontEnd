import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService, Policy } from '../../services/policy.service';

@Component({
  selector: 'app-policies-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies-admin.component.html',
  styleUrls: ['./policies-admin.component.scss']
})
export class PoliciesAdminComponent implements OnInit {

  policies: Policy[] = [];
  search: string = '';
  loading: boolean = false;

  constructor(private policyService: PolicyService) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.policyService.getAll().subscribe({
      next: (data: any[]) => {
        console.log('POLICIES LOADED:', data);
        // 🔥 MAP DATA TO HANDLE MISSING FIELDS
        this.policies = data.map(p => {
          // If status is missing, calculate it based on dates
          let status = p.status || p.policyStatus;
          if (!status && p.endDate) {
            const today = new Date();
            const end = new Date(p.endDate);
            status = end > today ? 'ACTIVE' : 'EXPIRED';
          }

          return {
            ...p,
            status: status || 'PENDING',
            premium: p.premium ?? p.premiumAmount ?? p.amount ?? 0
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading policies:', err);
        this.loading = false;
      }
    });
  }

  get filteredPolicies() {
    if (!this.search) return this.policies;
    const filter = this.search.toLowerCase();
    return this.policies.filter(p =>
      p.policyNumber.toLowerCase().includes(filter) ||
      (p.client?.fullName && p.client.fullName.toLowerCase().includes(filter)) ||
      (p.insuranceCompany?.name && p.insuranceCompany.name.toLowerCase().includes(filter))
    );
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.trim().toUpperCase()) {
      case 'ACTIVE':
      case 'VALID': return 'badge approved';
      case 'EXPIRED': return 'badge rejected';
      case 'PENDING': return 'badge pending';
      default: return 'badge gray';
    }
  }

  getActiveCount(): number {
    return this.policies.filter(p => p.status?.toUpperCase() === 'ACTIVE').length;
  }

  getExpiredCount(): number {
    return this.policies.filter(p => p.status?.toUpperCase() === 'EXPIRED').length;
  }

  deletePolicy(id: number): void {
      if (confirm('Are you sure you want to delete this policy?')) {
          this.policyService.delete(id).subscribe(() => this.loadPolicies());
      }
  }
}

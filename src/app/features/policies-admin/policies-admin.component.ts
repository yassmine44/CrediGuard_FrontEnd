import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratService } from '../../core/services/insurance/contrat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-policies-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies-admin.component.html',
  styleUrls: ['./policies-admin.component.scss']
})
export class PoliciesAdminComponent implements OnInit {

  policies: any[] = [];
  search: string = '';
  loading: boolean = false;

  constructor(
    private contratService: ContratService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.contratService.getAll().subscribe({
      next: (data: any[]) => {
        this.policies = data;
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
      (p.policyNumber && p.policyNumber.toLowerCase().includes(filter)) ||
      (p.client?.fullName && p.client.fullName.toLowerCase().includes(filter)) ||
      (p.insuranceCompany?.name && p.insuranceCompany.name.toLowerCase().includes(filter))
    );
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.trim().toUpperCase()) {
      case 'ACTIF':
      case 'ACTIVE':
      case 'VALID': return 'badge approved';
      case 'EXPIRE':
      case 'EXPIRED': return 'badge rejected';
      case 'PENDING': return 'badge pending';
      default: return 'badge gray';
    }
  }

  getActiveCount(): number {
    return this.policies.filter(p => p.status?.toUpperCase() === 'ACTIF' || p.status?.toUpperCase() === 'ACTIVE').length;
  }

  getExpiredCount(): number {
    return this.policies.filter(p => p.status?.toUpperCase() === 'EXPIRE' || p.status?.toUpperCase() === 'EXPIRED').length;
  }

  deletePolicy(id: number): void {
      if (confirm('Are you sure you want to delete this policy?')) {
          this.contratService.delete(id).subscribe(() => this.loadPolicies());
      }
  }
}

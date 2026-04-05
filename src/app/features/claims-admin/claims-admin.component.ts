import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsAdminService } from './claims-admin.service';

@Component({
  selector: 'app-claims-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './claims-admin.component.html',
  styleUrls: ['./claims-admin.component.scss']
})
export class ClaimsAdminComponent implements OnInit {

  claims: any[] = [];
  selectedClaim: any = null;
  search: string = '';

  constructor(private service: ClaimsAdminService) {}

  ngOnInit(): void {
    this.load();
  }
  get filteredClaims() {
  return this.claims.filter(c =>
    c.claimReference.toLowerCase().includes(this.search.toLowerCase())
  );
}

  // ===== LOAD DATA =====
  load(): void {
    this.service.getAll().then((data: any[]) => {
      console.log("CLAIMS BACK:", data);
      this.claims = data;
    });
  }

  // ===== ACTIONS =====
  approve(id: number): void {
    this.service.approve(id).then(() => this.load());
  }

  reject(id: number): void {
    this.service.reject(id).then(() => this.load());
  }

  // ===== POPUP =====
  openDetails(claim: any): void {
    this.selectedClaim = claim;
  }

  closeDetails(): void {
    this.selectedClaim = null;
  }

  // ===== BUSINESS LOGIC =====

  // policy valable ?
  isPolicyValid(c: any): boolean {
    const today = new Date();
    const expiration = new Date(c.voucher?.expirationDate);
    return expiration > today;
  }

  // nombre de claims du client
  getClientClaimsCount(c: any): number {
    return this.claims.filter(
      x => x.voucher?.client?.id === c.voucher?.client?.id
    ).length;
  }

  // règle décision assurance
  canApprove(c: any): boolean {
    return this.isPolicyValid(c) &&
           this.getClientClaimsCount(c) <= 2 &&
           c.status === 'PENDING';
  }

  // ===== STATS =====
  get pendingCount(): number {
    return this.claims.filter(c => c.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.claims.filter(c => c.status === 'APPROVED').length;
  }

  get rejectedCount(): number {
    return this.claims.filter(c => c.status === 'REJECTED').length;
  }
}
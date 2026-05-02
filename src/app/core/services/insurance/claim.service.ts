import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { InsuranceClaim, ClaimStatus } from '../../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private apiUrl = 'http://127.0.0.1:8089/api/claims';

  constructor(private http: HttpClient) {}

  submit(policyId: number, userId: number, description: string, amountRequested: number, files?: File[]): Observable<InsuranceClaim> {
    const formData = new FormData();
    formData.append('policyId', policyId.toString());
    formData.append('userId', userId.toString());
    formData.append('description', description);
    formData.append('amountRequested', amountRequested.toString());
    if (files) {
      files.forEach(file => formData.append('files', file));
    }
    return this.http.post<InsuranceClaim>(this.apiUrl, formData);
  }

  updateStatus(id: number, status: ClaimStatus, adminId?: number, comment?: string, amountApproved?: number, rejectionReason?: string): Observable<InsuranceClaim> {
    const params: any = { status };
    if (adminId) params.adminId = adminId.toString();
    if (comment) params.comment = comment;
    if (amountApproved) params.amountApproved = amountApproved.toString();
    if (rejectionReason) params.rejectionReason = rejectionReason;

    return this.http.patch<InsuranceClaim>(`${this.apiUrl}/${id}/statut`, null, { params });
  }

  approve(id: number): Promise<InsuranceClaim> {
    // Mock admin ID 1 for automated approval
    return firstValueFrom(this.updateStatus(id, ClaimStatus.APPROVED, 1, "Approbation automatique (Moteur de risque)"));
  }

  reject(id: number, reason: string): Promise<InsuranceClaim> {
    return firstValueFrom(this.updateStatus(id, ClaimStatus.REJECTED, 1, "Rejet automatique", 0, reason));
  }

  getByClient(clientId: number): Observable<InsuranceClaim[]> {
    return this.http.get<InsuranceClaim[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getAll(): Observable<InsuranceClaim[]> {
    return this.http.get<InsuranceClaim[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  segmentClaim(id: number): Observable<SegmentationResult> {
    return this.http.post<SegmentationResult>(`${this.apiUrl}/${id}/segment`, {});
  }
}

export interface SegmentationResult {
  segment: 'High Risk' | 'Medium Risk' | 'Low Risk';
  confidence: number;
  probabilities: { [key: string]: number };
}

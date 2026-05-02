import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationRisqueResponse } from '../models/evaluation-risque.model';

export type ProfilLoanGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface EvaluationPredictionRequest {
  loanGrade: ProfilLoanGrade;
  interestRate: number;
  nSim?: number;
  noiseFactor?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EvaluationRisqueService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/evaluations';

  getByDemande(demandeId: number): Observable<EvaluationRisqueResponse> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.get<EvaluationRisqueResponse>(this.apiUrl, { params });
  }

  predictWithModel(
    demandeId: number,
    payload: EvaluationPredictionRequest
  ): Observable<EvaluationRisqueResponse> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.post<EvaluationRisqueResponse>(
      `${this.apiUrl}/predict-mc`,
      payload,
      { params }
    );
  }
}

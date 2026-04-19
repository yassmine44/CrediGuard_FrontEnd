import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PlanUtilisationRequest,
  PlanUtilisationResponse,
} from '../models/plan-utilisation-credit.model';

@Injectable({
  providedIn: 'root',
})
export class PlanUtilisationCreditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/plans';

getByDemande(demandeId: number) {
  return this.http.get<PlanUtilisationResponse>(
    `${this.apiUrl}?demandeId=${demandeId}`
  );
}
}
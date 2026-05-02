import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskScore } from '../../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class RiskScoreService {
  private apiUrl = 'http://127.0.0.1:8089/api/score-risque';

  constructor(private http: HttpClient) {}

  calculate(userId: number, sector: string, region: string, value: number, goodsNature: string): Observable<RiskScore> {
    return this.http.post<RiskScore>(`${this.apiUrl}/calculer`, {}, {
      params: { 
        userId: userId.toString(),
        sector,
        region,
        value: value.toString(),
        goodsNature
      }
    });
  }

  simulate(sector: string, region: string, value: number, goodsNature: string): Observable<RiskScore> {
    return this.http.post<RiskScore>(`${this.apiUrl}/simuler`, {}, {
      params: { 
        sector,
        region,
        value: value.toString(),
        goodsNature
      }
    });
  }
}

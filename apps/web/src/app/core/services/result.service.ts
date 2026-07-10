import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SurveyResults } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ResultService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getResults(surveyId: string): Observable<SurveyResults> {
    return this.http.get<SurveyResults>(`${this.apiUrl}/surveys/${surveyId}/results`);
  }
}

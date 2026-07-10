import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SurveyResponse, Survey } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSurveyBySlug(slug: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/survey/${slug}`);
  }

  submitResponse(surveyId: string, answers: { questionId: string; value: unknown }[]): Observable<SurveyResponse> {
    return this.http.post<SurveyResponse>(`${this.apiUrl}/surveys/${surveyId}/responses`, { answers });
  }

  getResponses(surveyId: string, page: number = 1): Observable<{ data: SurveyResponse[]; total: number }> {
    let params = new HttpParams().set('page', page.toString());
    return this.http.get<{ data: SurveyResponse[]; total: number }>(`${this.apiUrl}/surveys/${surveyId}/responses`, { params });
  }

  getResponse(surveyId: string, responseId: string): Observable<SurveyResponse> {
    return this.http.get<SurveyResponse>(`${this.apiUrl}/surveys/${surveyId}/responses/${responseId}`);
  }

  exportCsv(surveyId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/surveys/${surveyId}/responses/export`, { responseType: 'blob' });
  }
}

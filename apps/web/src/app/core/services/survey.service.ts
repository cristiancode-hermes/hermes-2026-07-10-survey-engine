import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey } from '../models/types';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSurveys(filters?: { status?: string; search?: string }): Observable<Survey[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Survey[]>(`${this.apiUrl}/surveys`, { params });
  }

  getSurvey(id: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/surveys/${id}`);
  }

  createSurvey(data: { title: string; description: string; templateId?: string }): Observable<Survey> {
    return this.http.post<Survey>(`${this.apiUrl}/surveys`, data);
  }

  updateSurvey(id: string, data: Partial<Survey>): Observable<Survey> {
    return this.http.patch<Survey>(`${this.apiUrl}/surveys/${id}`, data);
  }

  deleteSurvey(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/surveys/${id}`);
  }

  publishSurvey(id: string): Observable<Survey> {
    return this.http.post<Survey>(`${this.apiUrl}/surveys/${id}/publish`, {});
  }

  closeSurvey(id: string): Observable<Survey> {
    return this.http.post<Survey>(`${this.apiUrl}/surveys/${id}/close`, {});
  }

  reopenSurvey(id: string): Observable<Survey> {
    return this.http.post<Survey>(`${this.apiUrl}/surveys/${id}/reopen`, {});
  }
}

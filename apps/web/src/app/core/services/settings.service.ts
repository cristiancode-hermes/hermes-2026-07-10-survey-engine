import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  updateProfile(name: string, email: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/settings/profile`, { name, email });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/settings/change-password`, { currentPassword, newPassword });
  }
}

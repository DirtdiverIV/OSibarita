// src/app/features/home/pages/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  // Navegar a la pantalla de TV específica
  navigateToTV(tvId: number): void {
    this.router.navigate(['/tv'], { queryParams: { tv: tvId } });
  }

  // Navegar al panel de administración
  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  // Navegar a la página de diagnóstico
  navigateToDiagnostic(): void {
    this.router.navigate(['/tv/diagnostico']);
  }
}
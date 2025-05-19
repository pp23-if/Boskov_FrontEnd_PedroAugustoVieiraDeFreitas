import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'logout-event') {
        window.location.href = '/login'; // Redireciona automaticamente
      }
    });
  }

}

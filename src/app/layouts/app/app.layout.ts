import { Component } from '@angular/core';

/** Services */
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app.layout.html'
})

export class AppLayout {

  constructor(private authSvc: AuthService) {

  }

  public login(): void {

    this.authSvc.login().subscribe(() => {

    });

  }

}

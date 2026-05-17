import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, Header, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit{
  private router = inject(Router)

  ngOnInit(): void {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    // do users/me and if the response is not okay then return and delete the tokens from local storage
    if(access_token === null || refresh_token === null) {
      this.router.navigate(['/'])
    }
  }



  Logout(){
    //delete the tokens from local storage and navigate to home
  }
}

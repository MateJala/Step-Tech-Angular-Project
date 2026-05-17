import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-favorites',
  imports: [RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {}

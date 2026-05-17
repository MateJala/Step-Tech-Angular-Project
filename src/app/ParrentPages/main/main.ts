import { Component } from '@angular/core';
import { Footer } from "../../components/footer/footer";
import { RouterOutlet } from "@angular/router";
import { Header } from "../../components/header/header";

@Component({
  selector: 'app-main',
  imports: [Footer, RouterOutlet, Header],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}

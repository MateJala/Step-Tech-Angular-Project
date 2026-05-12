import { Component } from '@angular/core';
import { Hero } from '../../../components/home/hero/hero';
import { Categories } from '../../../components/home/categories/categories';
import { FeaturedProducts } from '../../../components/home/featured-products/featured-products';
import { PromoSection } from '../../../components/home/promo-section/promo-section';
import { NewArrivals } from '../../../components/home/new-arrivals/new-arrivals';
import { Features } from '../../../components/home/features/features';

@Component({
  selector: 'app-home',
  imports: [Hero,Categories,FeaturedProducts,PromoSection,NewArrivals,Features],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}

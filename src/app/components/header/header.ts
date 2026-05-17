import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../../services/categoryService';
import { UserService } from '../../../services/user-service';
import { Favorites, PaginatedResponse, Product } from '../../../services/favorites';
import { Cart, CartItem } from '../../../services/cart';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(private router: Router){}

  public search = new FormControl('');
  clearSearch(){
    this.search.setValue('');
  }
  Search(){
    this.router.navigate(['/shop'], { queryParams: { search: this.search.value } });
  }

  public mobileMenuBtn = signal<boolean>(true);
  mobileMenu(){
    this.mobileMenuBtn.set(!this.mobileMenuBtn())
  }
  public mobileCartBtn = signal<boolean>(true);
  mobileCart(){
    this.mobileCartBtn.set(!this.mobileCartBtn())
  }
  routerLinkCategory(id:number){
    this.router.navigate(['/shop'], { queryParams: { category: id } });
    !this.mobileMenuBtn() ? this.mobileMenu() : null;
    this.hoverOver() ? this.hoverOver.set(false) : null;
  }

  public IsHoverable = window.matchMedia('(hover : hover)').matches;
  public hoverOver = signal<boolean>(false);
  hoverOverCategory(){
    if(this.IsHoverable){
      this.hoverOver.set(true)
    } else {
      this.hoverOver.set(!this.hoverOver())
    }
  }

  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  public categories = this.categoryService.categories;
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  private userService = inject(UserService);
  public user = this.userService.user;
  public userExists = false;
  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.userExists = true
          this.favoritesFunction();
          this.cartFunction();
        },
        error: () => {
          this.userExists = false;
        }
      });
    
    this.isLoading.set(true);
    this.categoryService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('[CategoryService] Failed to fetch categories:', err);
          this.error.set('Failed to load categories. Please try again later.');
          this.isLoading.set(false);
        }
      });
  }
  
  private favoritesService = inject(Favorites);
  public favorites = signal<PaginatedResponse<Product> | null>(null);

  private favoritesFunction() {
    this.favoritesService.getFavorites(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.favorites.set(res.data);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  private cartService = inject(Cart);
  public cart = signal<PaginatedResponse<CartItem> | null>(null);

  private cartFunction() {
    this.cartService.getCart(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.cart.set(res.data);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  public cartTotal = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  );
  public cartCount = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  Logout(){
  
  }
}

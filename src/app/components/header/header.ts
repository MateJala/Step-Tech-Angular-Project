import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NgStyle } from "@angular/common";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../../services/categoryService';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, NgStyle],
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

  ngOnInit() {
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
}

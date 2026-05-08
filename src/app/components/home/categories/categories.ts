import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CategoryService } from '../../../../services/categoryService';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-categories',
  imports: [RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  constructor(private router: Router) {}

  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  public categories = this.categoryService.categories;
  public featuredCategories = computed(() => this.categories().slice(0, 4));
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  routerLinkCategory(id: number) {
    this.router.navigate(['/shop'], { queryParams: { category: id } });
  }

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
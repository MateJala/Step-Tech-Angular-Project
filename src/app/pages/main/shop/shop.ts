import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductCard } from "../../../components/product-card/product-card";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../../../services/categoryService';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, CommonModule, ProductCard],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  public searchQueryParams = signal<string | null>(null);
  public sortQueryParams: string | null = null;
  public categoryQueryParams = signal<number | null>(null);
  public minPriceQueryParams = signal<number | null>(null);
  public maxPriceQueryParams = signal<number | null>(null);
  public inStockQueryParams = signal<boolean | null>(null);
  public minRatingQueryParams = signal<number | null>(null);
  public brandQueryParams = signal<string | null>(null);

  ngOnInit() {
    //params
    this.route.queryParams.subscribe(params => {
      this.searchQueryParams.set(params['search'] ?? null);
      this.sortQueryParams = params['sort'] ?? null;
      this.categoryQueryParams.set(params['category'] ? +params['category'] : null);
      this.minPriceQueryParams.set(params['minPrice'] ? +params['minPrice'] : null);
      this.maxPriceQueryParams.set(params['maxPrice'] ? +params['maxPrice'] : null);
      this.inStockQueryParams.set(params['inStock'] ? params['inStock'] === 'true' : null);
      this.minRatingQueryParams.set(params['minRating'] ? +params['minRating'] : null);
      this.brandQueryParams.set(params['brand'] ?? null);

      if (params['sort']) {
        const found = this.options.find(o => o.value === params['sort']);
        if (found) {
          this.selectedLabel = found.label;
          this.selectedValue = found.value;
        }
      }
    });
    //categories
    this.isCategoriesLoading.set(true);
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.isCategoriesLoading.set(false);
        },
        error: (err) => {
          console.error('[CategoryService] Failed to fetch categories:', err);
          this.isCategoriesLoading.set(false);
        }
    });
  }

  selectRating(rating: number): void {
    const next = this.minRatingQueryParams() === rating ? null : rating;
    this.minRatingQueryParams.set(next);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { minRating: next },
      queryParamsHandling: 'merge',
    });
  }

  selectCategory(category: number): void {
    const next = this.categoryQueryParams() === category ? null : category;
    this.categoryQueryParams.set(next);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: next },
      queryParamsHandling: 'merge',
    });
  }

  private priceDebounce: any = null;
  onPriceChange(type: 'min' | 'max', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value ? +value : null;

    if (type === 'min') this.minPriceQueryParams.set(parsed);
    if (type === 'max') this.maxPriceQueryParams.set(parsed);

    clearTimeout(this.priceDebounce);
    this.priceDebounce = setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          minPrice: this.minPriceQueryParams(),
          maxPrice: this.maxPriceQueryParams(),
        },
        queryParamsHandling: 'merge',
      });
    }, 500);
  }

  private brandDebounce: any = null;
  onBrandInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value ? value : null;
    this.brandQueryParams.set(parsed);

    clearTimeout(this.brandDebounce);
    this.brandDebounce = setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { brand: parsed },
        queryParamsHandling: 'merge',
      });
    }, 500);
  }

  onStockInput(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = checked ? true : null;
    this.inStockQueryParams.set(next);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { inStock: next },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters(): void {
    this.searchQueryParams.set(null);
    this.sortQueryParams = null;
    this.categoryQueryParams.set(null);
    this.minPriceQueryParams.set(null);
    this.maxPriceQueryParams.set(null);
    this.inStockQueryParams.set(null);
    this.minRatingQueryParams.set(null);
    this.brandQueryParams.set(null);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  private searchDebounce: any = null;
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value ? value : null;
    this.searchQueryParams.set(parsed);

    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { search: parsed },
        queryParamsHandling: 'merge',
      });
    }, 500);
  }

  public isSelectOpen = false;
  public selectedLabel = 'Sort by';
  public selectedValue = '';
  public options = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A-Z', value: 'name' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Newest', value: 'newest' },
  ];

  selectOption(option: { label: string, value: string }) {
    this.selectedLabel = option.label;
    this.selectedValue = option.value;
    this.isSelectOpen = false;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: option.value },
      queryParamsHandling: 'merge',
    });
  }

  removeFilter(filter: 'search' | 'category' | 'minPrice' | 'maxPrice' | 'inStock' | 'minRating' | 'brand'): void {
    switch (filter) {
      case 'search': this.searchQueryParams.set(null); break;
      case 'category': this.categoryQueryParams.set(null); break;
      case 'minPrice': this.minPriceQueryParams.set(null); break;
      case 'maxPrice': this.maxPriceQueryParams.set(null); break;
      case 'inStock': this.inStockQueryParams.set(null); break;
      case 'minRating': this.minRatingQueryParams.set(null); break;
      case 'brand': this.brandQueryParams.set(null); break;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [filter]: null },
      queryParamsHandling: 'merge',
    });
  }

  removePriceFilter(): void {
    this.minPriceQueryParams.set(null);
    this.maxPriceQueryParams.set(null);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { minPrice: null, maxPrice: null },
      queryParamsHandling: 'merge',
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQueryParams() ||
      this.sortQueryParams ||
      this.categoryQueryParams() ||
      this.minPriceQueryParams() ||
      this.maxPriceQueryParams() ||
      this.inStockQueryParams() ||
      this.minRatingQueryParams() ||
      this.brandQueryParams()
    );
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.searchQueryParams()) count++;
    if (this.categoryQueryParams()) count++;
    if (this.minPriceQueryParams()) count++;
    if (this.maxPriceQueryParams()) count++;
    if (this.inStockQueryParams()) count++;
    if (this.minRatingQueryParams()) count++;
    if (this.brandQueryParams()) count++;
    return count;
  }

  public currentPage = 1;
  public totalPages = 4;
  public pageSize = 10;
  public isPageSizeOpen = false;
  public pageSizeOptions = [12, 24, 48, 10];

  selectPageSize(size: number): void {
    this.pageSize = size;
    this.isPageSizeOpen = false;
    this.currentPage = 1;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  public mobileFilterBtn = signal<boolean>(false);
  mobileFitler() {
    this.mobileFilterBtn.set(!this.mobileFilterBtn());
  }

  private destroyRef = inject(DestroyRef);
  private categoryService = inject(CategoryService);

  public categories = this.categoryService.categories;
  public isCategoriesLoading = signal(false);

  public activeCategoryName = computed(() => {
    if (!this.categoryQueryParams()) return null;
    const match = this.categories().find(c => c.id === this.categoryQueryParams());
    return match?.name ?? null;
  });
}
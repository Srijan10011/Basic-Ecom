import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { useProductsRatingsQuery } from '../hooks/productRatingHooks';
import Pagination from '../../../shared/components/ui/Pagination';
import StarRating from '../../../shared/components/ui/StarRating';
import ProductSkeleton from '../../../shared/components/ui/ProductSkeleton';
import { PAGINATION } from '../../../constants';
import { useDebounce } from 'use-debounce';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCategoriesQuery } from '../../../lib/utils';
import { Product } from '../../../types';
import ProductCard from './ProductCard';






export default function Shop({ setCurrentPage, setSelectedProductId, addToCart, addingToCartId , cart}: {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: number) => void;
  addToCart: (product: Product) => void;
  addingToCartId: number | null;
  cart?: any[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const pageSize = PAGINATION.PRODUCTS_PER_PAGE;

  // Use React Query for data fetching with server-side filtering
  const {
    data: productsData,
    isLoading: loading,
    error,
    refetch
  } = useProductsQuery(currentPageNum, pageSize, {
    search: debouncedSearch,
    category: selectedCategory,
    priceRange: priceRange,
    sortBy: sortBy
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;

  // Get product IDs for rating queries
  const productIds = useMemo(() => products.map(p => p.id), [products]); 
  // Fetch ratings for all products
  const { 
    data: productRatings = [], 
    isLoading: ratingsLoading 
  } = useProductsRatingsQuery(productIds);

  // Create a map of product ratings for easy lookup
  const ratingsMap = useMemo(() => {
    const map = new Map();
    productRatings.forEach(rating => {
      map.set(rating.productId, rating);
    });
    return map;
  }, [productRatings]);

  // Function to manually refetch data
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);


  // Show notification when products are empty after loading

  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategoriesQuery();
  

  // ADD THIS:
  const allCategories = useMemo(() => {
    const fetchedCats = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/ /g, '-')
    }));
    return [{ id: 'all', name: 'All Products', slug: 'all' }, ...fetchedCats];
  }, [categories]);

 

  // Products are already filtered and sorted by the backend
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
    setPriceRange('all');
    setCurrentPageNum(1);
  }, []);
const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPageNum(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchQuery('');
        break;
      case 'category':
        setSelectedCategory('all');
        break;
      case 'price':
        setPriceRange('all');
        break;
    }
    setCurrentPageNum(1); // ADD THIS LINE
  };
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange !== 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <section className="bg-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop All Products
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Discover our complete collection of premium organic mushroom products
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  aria-label="Search products by name or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>

            {/* Category Filter */}
            <select
              aria-label="Filter products by category"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPageNum(1); }}
              disabled={categoriesLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {categoriesLoading ? (
                <option>Loading categories...</option>
              ) : categoriesError ? (
                <option>Failed to load categories</option>
              ) : (
                allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            
            </select>

            {/* Price Range */}
            <select
              aria-label="Filter products by price range"
              value={priceRange}
              onChange={(e) => { setPriceRange(e.target.value); setCurrentPageNum(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Prices</option>
              <option value="under-20">Under Rs 20</option>
              <option value="20-50">Rs 20 - Rs 50</option>
              <option value="over-50">Over Rs 50</option>
            </select>

            {/* Sort */}
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Name A-Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm">
                  Search: {searchQuery}
                  <button
                    onClick={() => removeFilter('search')}
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm">
                  Category: {allCategories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => removeFilter('category')}
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm">
                  Price: {priceRange === 'under-20' ? 'Under Rs 20' : priceRange === '20-50' ? 'Rs 20-Rs 50' : 'Over Rs 50'}
                  <button
                    onClick={() => removeFilter('price')}
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            {totalCount > 0 ? (
              <>
                Showing {((currentPageNum - 1) * pageSize) + 1} to {Math.min(currentPageNum * pageSize, totalCount)} of {totalCount} results
                {debouncedSearch && ` for "${debouncedSearch}"`}
              </>
            ) : (
              'No products found'
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
            {Array(12).fill(0).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load products</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error.message || 'Failed to fetch products. Please try again.'}</p>
            <button 
              onClick={handleRefetch}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Retry</span>
            </button>
          </div>
        ) : products.length > 0 ? (
          <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
             {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratingsMap.get(product.id)}
                onProductClick={(id) => {
                  setSelectedProductId(id);
                  setCurrentPage('product-detail');
                }}
                addToCart={addToCart}
                isAddingToCart={addingToCartId === product.id}
                cart={cart}
              />
            ))}
          </div>
          <Pagination
  currentPage={currentPageNum}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={pageSize}
  totalItems={totalCount}
/>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search criteria or clear filters to see all products.
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
           
        
      </div>
    </div>
  );
}
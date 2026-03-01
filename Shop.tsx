import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Star, X, RefreshCw } from 'lucide-react';
import { useProductsQuery } from '../lib/utils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge: string | null;
  badgeColor: string | null;
  details?: string[];
}

const categories = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'dried-mushrooms', name: 'Dried Mushrooms', slug: 'dried-mushrooms' },
  { id: 'fresh-mushrooms', name: 'Fresh Mushrooms', slug: 'fresh-mushrooms' },
  { id: 'spawn-seeds', name: 'Spawn Seeds', slug: 'spawn-seeds' },
  { id: 'cultivation-kits', name: 'Cultivation Kits', slug: 'cultivation-kits' }
];

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">({rating}) {reviews} reviews</span>
    </div>
  );
}

function ProductCard({ product, onProductClick, addToCart }: { product: any; onProductClick: (id: number) => void; addToCart: (product: any) => void }) {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 text-left w-full"
    >
      <button onClick={() => onProductClick(product.id)} className="w-full">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span className={`absolute top-4 left-4 ${product.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {product.badge}
            </span>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>
        </div>
      </button>
      <div className="p-6 pt-0">
        <button 
          onClick={() => addToCart(product)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function Shop({ setCurrentPage, setSelectedProductId, addToCart }: { setCurrentPage: (page: string) => void; setSelectedProductId: (id: number) => void; addToCart: (product: any) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Use React Query for data fetching with automatic refetching
  const { 
    data: products = [], 
    isLoading: loading, 
    error, 
    refetch 
  } = useProductsQuery();

  // Function to manually refetch data
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Log products state after it's updated
  React.useEffect(() => {
    console.log("Current products state:", products);
  }, [products]);

  // Show notification when products are empty after loading
  React.useEffect(() => {
    if (!loading && products.length === 0 && !error) {
      console.log('Products loaded but array is empty - this might indicate a data issue');
    }
  }, [loading, products.length, error]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price;
        switch (priceRange) {
          case 'under-20': return price < 20;
          case '20-50': return price >= 20 && price <= 50;
          case 'over-50': return price > 50;
          default: return true;
        }
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name':
        default: return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
    setPriceRange('all');
  };

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
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="under-20">Under $20</option>
              <option value="20-50">$20 - $50</option>
              <option value="over-50">Over $50</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Search: {searchQuery}
                  <button
                    onClick={() => removeFilter('search')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => removeFilter('category')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Price: {priceRange === 'under-20' ? 'Under $20' : priceRange === '20-50' ? '$20-$50' : 'Over $50'}
                  <button
                    onClick={() => removeFilter('price')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} products
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600 text-lg mb-4">Loading products...</p>
            <p className="text-gray-500 text-sm mb-6">This may take a few moments</p>
            <button 
              onClick={handleRefetch}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load products</h3>
            <p className="text-red-600 mb-4">{error.message || 'Failed to fetch products. Please try again.'}</p>
            <button 
              onClick={handleRefetch}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={(id) => {
                setSelectedProductId(id);
                setCurrentPage('product-detail');
              }} addToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {products.length === 0 && !loading && !error 
                ? "It looks like no products are available right now. This might be due to a connection issue or the products haven't loaded yet."
                : "Try adjusting your search criteria or browse all products."
              }
            </p>
            {products.length === 0 && !loading && !error && (
              <div className="mb-6">
                <button 
                  onClick={handleRefetch}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto mb-4"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Reload Products</span>
                </button>
                <p className="text-sm text-gray-500">
                  If the problem persists, try refreshing the page or check your internet connection.
                </p>
              </div>
            )}
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
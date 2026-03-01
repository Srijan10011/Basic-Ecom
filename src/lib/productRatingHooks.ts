import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

export interface ProductRating {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

// Hook to get rating for a single product
export const useProductRatingQuery = (productId: number | null) => {
  return useQuery({
    queryKey: ['productRating', productId],
    queryFn: async () => {
      if (!productId) return { averageRating: 0, reviewCount: 0 };
      
      const [avgResult, countResult] = await Promise.all([
        supabase.rpc('get_product_average_rating', { p_product_id: productId }),
        supabase.rpc('get_product_review_count', { p_product_id: productId })
      ]);
      
      if (avgResult.error) throw avgResult.error;
      if (countResult.error) throw countResult.error;
      
      return {
        averageRating: avgResult.data || 0,
        reviewCount: countResult.data || 0
      };
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get ratings for multiple products
export const useProductsRatingsQuery = (productIds: number[]) => {
  return useQuery({
    queryKey: ['productsRatings', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      
      const ratings = await Promise.all(
        productIds.map(async (productId) => {
          const [avgResult, countResult] = await Promise.all([
            supabase.rpc('get_product_average_rating', { p_product_id: productId }),
            supabase.rpc('get_product_review_count', { p_product_id: productId })
          ]);
          
          return {
            productId,
            averageRating: avgResult.data || 0,
            reviewCount: countResult.data || 0
          };
        })
      );
      
      return ratings;
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
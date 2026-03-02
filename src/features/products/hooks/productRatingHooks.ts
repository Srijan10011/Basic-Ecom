import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

export interface ProductRating {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

interface ProductRatingRPC {
  product_id: number;
  avg_rating: number;
  review_count: number;
}

/**
 * Single product rating
 */
export const useProductRatingQuery = (productId: number | null) => {
  return useQuery({
    queryKey: ['productRating', productId],
    queryFn: async (): Promise<{ averageRating: number; reviewCount: number }> => {
      if (!productId) {
        return { averageRating: 0, reviewCount: 0 };
      }

      const { data, error } = await supabase.rpc(
        'get_products_ratings',
        { product_ids: [productId] }
      );

      if (error) throw error;

      const typedData = (data ?? []) as ProductRatingRPC[];
      const result = typedData[0];

      return {
        averageRating: result?.avg_rating ?? 0,
        reviewCount: result?.review_count ?? 0,
      };
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};


/**
 * Multiple product ratings
 */
export const useProductsRatingsQuery = (productIds: number[]) => {
  const sortedIds = [...productIds].sort((a, b) => a - b);

  return useQuery({
    queryKey: ['productsRatings', sortedIds],
    queryFn: async (): Promise<ProductRating[]> => {
      if (!sortedIds.length) return [];

      const { data, error } = await supabase.rpc(
        'get_products_ratings',
        { product_ids: sortedIds }
      );

      if (error) throw error;

      const typedData = (data ?? []) as ProductRatingRPC[];

      const ratingsMap = new Map<number, ProductRatingRPC>(
        typedData.map((r) => [r.product_id, r])
      );

      return sortedIds.map((productId) => ({
        productId,
        averageRating: ratingsMap.get(productId)?.avg_rating ?? 0,
        reviewCount: ratingsMap.get(productId)?.review_count ?? 0,
      }));
    },
    enabled: sortedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
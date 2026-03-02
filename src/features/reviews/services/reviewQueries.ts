import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  image_url: string;
  created_at: string;
  user_name: string;
  user_email: string;
  owner_reply?: string; // New field for owner's reply
}

export interface ReviewStats {
  average_rating: number;
  review_count: number;
}

// Check if user can review a product
export const useCanUserReviewQuery = (userId: string | undefined, productId: number | null) => {
  return useQuery({
    queryKey: ['canUserReview', userId, productId],
    queryFn: async () => {
      if (!userId || !productId) return false;
      
      const { data, error } = await supabase.rpc('can_user_review_product', {
        p_user_id: userId,
        p_product_id: productId
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get user's existing review for a product
export const useUserReviewQuery = (userId: string | undefined, productId: number | null) => {
  return useQuery({
    queryKey: ['userReview', userId, productId],
    queryFn: async () => {
      if (!userId || !productId) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data;
    },
    enabled: !!userId && !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get all reviews for a product
export const useProductReviewsQuery = (productId: number | null) => {
  return useQuery<Review[]>({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase.rpc('get_product_reviews', {
        p_product_id: productId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get product review statistics
export const useProductReviewStatsQuery = (productId: number | null) => {
  return useQuery<ReviewStats>({
    queryKey: ['productReviewStats', productId],
    queryFn: async () => {
      if (!productId) return { average_rating: 0, review_count: 0 };
      
      const [avgResult, countResult] = await Promise.all([
        supabase.rpc('get_product_average_rating', { p_product_id: productId }),
        supabase.rpc('get_product_review_count', { p_product_id: productId })
      ]);
      
      if (avgResult.error) throw avgResult.error;
      if (countResult.error) throw countResult.error;
      
      return {
        average_rating: avgResult.data || 0,
        review_count: countResult.data || 0
      };
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Submit a new review
export const useSubmitReviewMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, productId, rating, comment, image_url }: {
      userId: string;
      productId: number;
      rating: number;
      comment: string;
      image_url: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          product_id: productId,
          rating,
          comment,
          image_url
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['productReviewStats', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', variables.userId, variables.productId] });
    },
  });
};

// Update an existing review
export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId, rating, comment, image_url }: {
      reviewId: number;
      rating: number;
      comment: string;
      image_url: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['productReviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['productReviewStats', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['userReview', data.user_id, data.product_id] });
    },
  });
};

// Delete a review
export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewId: number) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
    },
    onSuccess: (_, reviewId) => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['productReviewStats'] });
      queryClient.invalidateQueries({ queryKey: ['userReview'] });
     },                                      // closes onSuccess object property
  });                                       // closes object for useMutation
};



// Submit owner reply to a review
export const useSubmitOwnerReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, ownerReply }: {
      reviewId: number;
      ownerReply: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({ owner_reply: ownerReply, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate product reviews to refetch with owner reply
      queryClient.invalidateQueries({ queryKey: ['productReviews', data.product_id] });
     },                                      // closes onSuccess object property
  });                                       // closes object for useMutation
};
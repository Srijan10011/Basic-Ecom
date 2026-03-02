import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

interface ProductFilters {
  search?: string;
  category?: string;
  priceRange?: string;
  sortBy?: string;
}

export const useProductsQuery = (
  page: number = 1,
  pageSize: number = 12,
  filters?: ProductFilters
) => {
  return useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*, categories(id, name)", { count: 'exact' });

      // Apply search filter
      // Apply search filter
      if (filters?.search) {
        // Sanitize input: remove SQL special characters and limit length
        const sanitized = filters.search
          .replace(/[%_\\]/g, '\\$&')  // Escape wildcards
          .replace(/['";]/g, '')        // Remove quotes
          .slice(0, 100);               // Limit length
        query = query.or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }

      // Apply category filter
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }

      // Apply price range filter
      if (filters?.priceRange && filters.priceRange !== 'all') {
        switch (filters.priceRange) {
          case 'under-20':
            query = query.lt('price', 20);
            break;
          case '20-50':
            query = query.gte('price', 20).lte('price', 50);
            break;
          case 'over-50':
            query = query.gt('price', 50);
            break;
        }
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return { products: data || [], totalCount: count || 0 };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useProductQuery = (productId: number | null) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};
export const useFeaturedProductsQuery = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true);

      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

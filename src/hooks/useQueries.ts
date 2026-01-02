import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';

export interface UserProfile {
    user_id: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

// Fetch user profile
export function useUserProfile() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data as UserProfile | null;
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
}

// Update user profile
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (updates: Partial<UserProfile>) => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch profile query
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
    });
}

// Fetch routes with caching
export function useRoutes() {
    return useQuery({
        queryKey: ['routes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('route_code');

            if (error) throw error;
            return data.map(r => ({ ...r, color: r.color || '#7B2CBF' }));
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

// Fetch user tickets
export function useUserTickets() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['tickets', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('tickets')
                .select(`
          *,
          routes (
            name,
            route_code,
            color
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
// Fetch all unique stop names
export function useStops() {
    return useQuery({
        queryKey: ['stops'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('route_stops')
                .select('stop_name')
                .order('stop_name');

            if (error) throw error;

            // Get unique stop names
            const stops = Array.from(new Set(data.map(s => s.stop_name)));
            return stops;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

// Global interface for Route mapping
export interface Route {
    id: string;
    name: string;
    route_code: string;
    start_point: string;
    end_point: string;
    estimated_time: number;
    fare: number;
    color: string;
    created_at: string;
}

// Find routes that pass through both origin and destination
export function useFindRoutes(origin: string, destination: string) {
    return useQuery({
        queryKey: ['find-routes', origin, destination],
        queryFn: async () => {
            if (!origin || !destination) return [];

            // 1. Get all routes that pass through the origin
            const { data: originStops, error: originError } = await supabase
                .from('route_stops')
                .select('route_id, stop_order')
                .eq('stop_name', origin);

            if (originError) throw originError;

            // 2. Get all routes that pass through the destination
            const { data: destStops, error: destError } = await supabase
                .from('route_stops')
                .select('route_id, stop_order')
                .eq('stop_name', destination);

            if (destError) throw destError;

            // 3. Find common routes where origin comes before destination
            const matchingRouteIds = originStops
                .filter(os => {
                    const ds = destStops.find(ds => ds.route_id === os.route_id);
                    return ds && os.stop_order < ds.stop_order;
                })
                .map(os => os.route_id);

            if (matchingRouteIds.length === 0) return [];

            // 4. Fetch full route details
            const { data: routes, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .in('id', matchingRouteIds);

            if (routesError) throw routesError;
            return routes.map(r => ({ ...r, color: r.color || '#7B2CBF' })) as Route[];
        },
        enabled: !!origin && !!destination && origin !== destination,
    });
}

// Fetch all stops for a specific route
export function useRouteStops(routeId: string | null) {
    return useQuery({
        queryKey: ['route-stops', routeId],
        queryFn: async () => {
            if (!routeId) return [];

            const { data, error } = await supabase
                .from('route_stops')
                .select('*')
                .eq('route_id', routeId)
                .order('stop_order');

            if (error) throw error;
            return data;
        },
        enabled: !!routeId,
    });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';

export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: string;
    user_id: string;
    wallet_id: string;
    type: 'topup' | 'payment' | 'refund';
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string | null;
    reference_id: string | null;
    reference_type: string | null;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string | null;
    external_transaction_id: string | null;
    metadata: any;
    created_at: string;
}

export interface WalletResponse {
    success: boolean;
    transaction_id: string;
    balance_before: number;
    balance_after: number;
    amount: number;
}

// Fetch user wallet balance
export function useWallet() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['wallet', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await (supabase as any)
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return data as Wallet;
        },
        enabled: !!user?.id,
        staleTime: 30 * 1000, // 30 seconds - refresh frequently for balance
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Fetch wallet transactions
export function useWalletTransactions(limit = 50) {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['wallet-transactions', user?.id, limit],
        queryFn: async () => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await (supabase as any)
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as WalletTransaction[];
        },
        enabled: !!user?.id,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Process top-up
export function useTopUp() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({
            amount,
            paymentMethod,
            externalTransactionId,
            metadata,
        }: {
            amount: number;
            paymentMethod: string;
            externalTransactionId?: string;
            metadata?: any;
        }) => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await (supabase as any).rpc('process_topup', {
                p_user_id: user.id,
                p_amount: amount,
                p_payment_method: paymentMethod,
                p_external_transaction_id: externalTransactionId || `TGO-TOPUP-${Date.now()}`,
                p_metadata: metadata || null,
            });

            if (error) throw error;
            return data as WalletResponse;
        },
        onSuccess: () => {
            // Invalidate wallet and transactions queries
            queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] });
        },
    });
}

// Process payment
export function useProcessPayment() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({
            amount,
            description,
            referenceId,
            referenceType = 'ticket',
        }: {
            amount: number;
            description: string;
            referenceId?: string;
            referenceType?: string;
        }) => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await (supabase as any).rpc('process_payment', {
                p_user_id: user.id,
                p_amount: amount,
                p_description: description,
                p_reference_id: referenceId || null,
                p_reference_type: referenceType,
            });

            if (error) throw error;
            return data as WalletResponse;
        },
        onSuccess: () => {
            // Invalidate wallet and transactions queries
            queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] });
        },
    });
}

// Process refund
export function useProcessRefund() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({
            amount,
            description,
            referenceId,
        }: {
            amount: number;
            description: string;
            referenceId?: string;
        }) => {
            if (!user?.id) throw new Error('No user logged in');

            const { data, error } = await (supabase as any).rpc('process_refund', {
                p_user_id: user.id,
                p_amount: amount,
                p_description: description,
                p_reference_id: referenceId || null,
            });

            if (error) throw error;
            return data as WalletResponse;
        },
        onSuccess: () => {
            // Invalidate wallet and transactions queries
            queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] });
        },
    });
}

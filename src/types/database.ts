export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    credits: number;
                    plan: 'free' | 'pro' | 'enterprise';
                    role: 'user' | 'moderator' | 'admin' | 'super_admin';
                    status: 'active' | 'banned';
                    subscription_tier: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    credits?: number;
                    plan?: 'free' | 'pro' | 'enterprise';
                    role?: 'user' | 'moderator' | 'admin' | 'super_admin';
                    status?: 'active' | 'banned';
                    subscription_tier?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    credits?: number;
                    plan?: 'free' | 'pro' | 'enterprise';
                    role?: 'user' | 'moderator' | 'admin' | 'super_admin';
                    status?: 'active' | 'banned';
                    subscription_tier?: string | null;
                    updated_at?: string;
                };
            };
            credit_history: {
                Row: {
                    id: string;
                    user_id: string;
                    admin_id: string;
                    change_amount: number;
                    previous_balance: number;
                    new_balance: number;
                    reason: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    admin_id: string;
                    change_amount: number;
                    previous_balance: number;
                    new_balance: number;
                    reason: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    change_amount?: number;
                    previous_balance?: number;
                    new_balance?: number;
                    reason?: string;
                    created_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    admin_id: string;
                    action_type: string;
                    entity_type: string;
                    entity_id: string;
                    previous_data: Json | null;
                    new_data: Json | null;
                    timestamp: string;
                };
                Insert: {
                    id?: string;
                    admin_id: string;
                    action_type: string;
                    entity_type: string;
                    entity_id: string;
                    previous_data?: Json | null;
                    new_data?: Json | null;
                    timestamp?: string;
                };
                Update: {
                    id?: string;
                    action_type?: string;
                    entity_type?: string;
                    entity_id?: string;
                    previous_data?: Json | null;
                    new_data?: Json | null;
                    timestamp?: string;
                };
            };
            generated_images: {
                Row: {
                    id: string;
                    user_id: string;
                    prompt: string;
                    negative_prompt: string | null;
                    model: string;
                    provider: string;
                    resolution: string;
                    image_url: string;
                    storage_path: string;
                    is_public: boolean;
                    credits_used: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    prompt: string;
                    negative_prompt?: string | null;
                    model: string;
                    provider: string;
                    resolution: string;
                    image_url: string;
                    storage_path: string;
                    is_public?: boolean;
                    credits_used?: number;
                    created_at?: string;
                };
                Update: {
                    is_public?: boolean;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            admin_update_credits: {
                Args: {
                    target_user_id: string;
                    admin_id: string;
                    amount_change: number;
                    reason_text: string;
                };
                Returns: Json;
            };
        };
    };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type GeneratedImage = Database['public']['Tables']['generated_images']['Row'];

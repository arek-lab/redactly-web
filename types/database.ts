export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'
export type SubscriptionTier = 'free' | 'premium' | 'enterprise' | 'payg' | 'sub'
export type SubscriptionProduct = 'extension' | 'pdf_api'

export type Subscription = {
  id: string
  user_id: string
  product: SubscriptionProduct
  status: SubscriptionStatus
  tier: SubscriptionTier
  expires_at: string | null
  extension_token: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  period_start: string | null
  period_end: string | null
  quota_total: number | null
  quota_used: number
  created_at: string
  updated_at: string
}

export type PdfJob = {
  id: string
  user_id: string
  filename: string
  pages: number
  status: string
  entities_found: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>
        Relationships: []
      }
      pdf_jobs: {
        Row: PdfJob
        Insert: Omit<PdfJob, 'id' | 'created_at'>
        Update: Partial<Omit<PdfJob, 'id' | 'created_at'>>
        Relationships: []
      }
      page_wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
        }
        Update: {
          balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          stripe_event_id: string
          event_type: string
          error: string | null
          processed_at: string
        }
        Insert: {
          stripe_event_id: string
          event_type: string
          error?: string | null
        }
        Update: Partial<{
          event_type: string
          error: string | null
        }>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      topup_wallet_with_log: {
        Args: {
          p_user_id: string
          p_pages: number
          p_stripe_payment_id: string
        }
        Returns: void
      }
    }
  }
}

export type JwtSubscriptionClaim = {
  tier: SubscriptionTier
  status: SubscriptionStatus
  expires_at: number
}

export type JwtClaims = {
  subscriptions?: {
    extension?: JwtSubscriptionClaim
    pdf?: JwtSubscriptionClaim
  }
}

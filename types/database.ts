/**
 * Auto-generated TypeScript types for LegacyVault database.
 * These types mirror the public schema in Supabase.
 * Re-generate after schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          blood_group: string | null
          nationality: string | null
          address: string | null
          occupation: string | null
          marital_status: string | null
          religion: string | null
          emergency_contact: string | null
          languages: string[] | null
          biometric_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          blood_group?: string | null
          nationality?: string | null
          address?: string | null
          occupation?: string | null
          marital_status?: string | null
          religion?: string | null
          emergency_contact?: string | null
          languages?: string[] | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          blood_group?: string | null
          nationality?: string | null
          address?: string | null
          occupation?: string | null
          marital_status?: string | null
          religion?: string | null
          emergency_contact?: string | null
          languages?: string[] | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'profiles_id_fkey'
          references: 'auth.users(id)'
        }[]
      }

      trusted_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          relationship: string | null
          access_level: string
          priority: string | null
          status: string
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          email?: string | null
          phone?: string | null
          relationship?: string | null
          access_level?: string
          priority?: string | null
          status?: string
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          relationship?: string | null
          access_level?: string
          priority?: string | null
          status?: string
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'trusted_contacts_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      digital_assets: {
        Row: {
          id: string
          user_id: string
          title: string
          asset_type: string
          encrypted_data: string | null
          notes: string | null
          is_shared: boolean
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          asset_type: string
          encrypted_data?: string | null
          notes?: string | null
          is_shared?: boolean
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          asset_type?: string
          encrypted_data?: string | null
          notes?: string | null
          is_shared?: boolean
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'digital_assets_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          file_url: string | null
          file_size: number | null
          mime_type: string | null
          is_verified: boolean
          verified_at: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          category?: string
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          is_verified?: boolean
          verified_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          is_verified?: boolean
          verified_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'documents_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      photos: {
        Row: {
          id: string
          user_id: string
          title: string | null
          album_id: string | null
          file_url: string
          thumbnail_url: string | null
          file_size: number | null
          width: number | null
          height: number | null
          caption: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title?: string | null
          album_id?: string | null
          file_url: string
          thumbnail_url?: string | null
          file_size?: number | null
          width?: number | null
          height?: number | null
          caption?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          album_id?: string | null
          file_url?: string
          thumbnail_url?: string | null
          file_size?: number | null
          width?: number | null
          height?: number | null
          caption?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'photos_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      medical_information: {
        Row: {
          id: string
          user_id: string
          blood_type: string | null
          height: string | null
          weight: string | null
          organ_donor: boolean | null
          conditions: Json
          medications: Json
          allergies: Json
          notes: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          blood_type?: string | null
          height?: string | null
          weight?: string | null
          organ_donor?: boolean | null
          conditions?: Json
          medications?: Json
          allergies?: Json
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          blood_type?: string | null
          height?: string | null
          weight?: string | null
          organ_donor?: boolean | null
          conditions?: Json
          medications?: Json
          allergies?: Json
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'medical_information_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      insurance: {
        Row: {
          id: string
          user_id: string
          policy_type: string
          provider: string
          policy_number: string | null
          coverage_amount: string | null
          premium: string | null
          beneficiary: string | null
          status: string
          start_date: string | null
          end_date: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          policy_type: string
          provider: string
          policy_number?: string | null
          coverage_amount?: string | null
          premium?: string | null
          beneficiary?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          policy_type?: string
          provider?: string
          policy_number?: string | null
          coverage_amount?: string | null
          premium?: string | null
          beneficiary?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'insurance_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      financial_assets: {
        Row: {
          id: string
          user_id: string
          asset_name: string
          asset_type: string
          institution: string | null
          balance: string | null
          account_number: string | null
          notes: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          asset_name: string
          asset_type: string
          institution?: string | null
          balance?: string | null
          account_number?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_name?: string
          asset_type?: string
          institution?: string | null
          balance?: string | null
          account_number?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'financial_assets_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          cost: number
          billing_cycle: string
          next_billing_date: string | null
          status: string
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          category?: string
          cost?: number
          billing_cycle?: string
          next_billing_date?: string | null
          status?: string
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          cost?: number
          billing_cycle?: string
          next_billing_date?: string | null
          status?: string
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'subscriptions_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          handle: string | null
          followers: string | null
          memorialization_status: string
          access_instructions: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          platform: string
          handle?: string | null
          followers?: string | null
          memorialization_status?: string
          access_instructions?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          handle?: string | null
          followers?: string | null
          memorialization_status?: string
          access_instructions?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'social_accounts_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      digital_will: {
        Row: {
          id: string
          user_id: string
          title: string
          status: string
          content_json: Json
          last_reviewed_at: string | null
          witnessed_at: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title?: string
          status?: string
          content_json?: Json
          last_reviewed_at?: string | null
          witnessed_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: string
          content_json?: Json
          last_reviewed_at?: string | null
          witnessed_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'digital_will_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      emergency_messages: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          subject: string
          body: string
          delivery_trigger: string
          is_delivered: boolean
          delivered_at: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          contact_id?: string | null
          subject: string
          body: string
          delivery_trigger?: string
          is_delivered?: boolean
          delivered_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          subject?: string
          body?: string
          delivery_trigger?: string
          is_delivered?: boolean
          delivered_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKey: 'emergency_messages_user_id_fkey'
            references: 'public.profiles(id)'
          },
          {
            foreignKey: 'emergency_messages_contact_id_fkey'
            references: 'public.trusted_contacts(id)'
          },
        ]
      }

      death_verification: {
        Row: {
          id: string
          user_id: string
          verifier_id: string | null
          status: string
          verification_method: string | null
          death_certificate_url: string | null
          verified_at: string | null
          vault_release_triggered: boolean
          vault_release_triggered_at: string | null
          notes: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          verifier_id?: string | null
          status?: string
          verification_method?: string | null
          death_certificate_url?: string | null
          verified_at?: string | null
          vault_release_triggered?: boolean
          vault_release_triggered_at?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          verifier_id?: string | null
          status?: string
          verification_method?: string | null
          death_certificate_url?: string | null
          verified_at?: string | null
          vault_release_triggered?: boolean
          vault_release_triggered_at?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKey: 'death_verification_user_id_fkey'
            references: 'public.profiles(id)'
          },
          {
            foreignKey: 'death_verification_verifier_id_fkey'
            references: 'auth.users(id)'
          },
        ]
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          is_read: boolean
          read_at: string | null
          action_url: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          type: string
          title: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'notifications_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      audit_logs: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          actor_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKey: 'audit_logs_user_id_fkey'
            references: 'public.profiles(id)'
          },
          {
            foreignKey: 'audit_logs_actor_id_fkey'
            references: 'auth.users(id)'
          },
        ]
      }

      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          description: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'activity_logs_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      admin_users: {
        Row: {
          id: string
          user_id: string
          role: string
          permissions: Json
          granted_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          permissions?: Json
          granted_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          permissions?: Json
          granted_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKey: 'admin_users_user_id_fkey'
            references: 'auth.users(id)'
          },
          {
            foreignKey: 'admin_users_granted_by_fkey'
            references: 'auth.users(id)'
          },
        ]
      }

      vault_folders: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          parent_folder_id: string | null
          sort_order: number
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          icon?: string | null
          parent_folder_id?: string | null
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          parent_folder_id?: string | null
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'vault_folders_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      vault_items: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          item_type: string
          encrypted_data: string | null
          file_url: string | null
          file_size: number | null
          mime_type: string | null
          thumbnail_url: string | null
          notes: string | null
          tags: string[] | null
          is_starred: boolean
          sort_order: number
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          folder_id?: string | null
          name: string
          title: string
          item_type: string
          encrypted_data?: string | null
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          thumbnail_url?: string | null
          notes?: string | null
          tags?: string[] | null
          is_starred?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          item_type?: string
          encrypted_data?: string | null
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          thumbnail_url?: string | null
          notes?: string | null
          tags?: string[] | null
          is_starred?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKey: 'vault_items_user_id_fkey'
            references: 'public.profiles(id)'
          },
          {
            foreignKey: 'vault_items_folder_id_fkey'
            references: 'public.vault_folders(id)'
          },
        ]
      }

      verification_requests: {
        Row: {
          id: string
          user_id: string
          status: string
          death_certificate_url: string | null
          government_id_url: string | null
          submitted_at: string | null
          reviewer_id: string | null
          reviewed_at: string | null
          review_notes: string | null
          released_at: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          status?: string
          death_certificate_url?: string | null
          government_id_url?: string | null
          submitted_at?: string | null
          reviewer_id?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          released_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          death_certificate_url?: string | null
          government_id_url?: string | null
          submitted_at?: string | null
          reviewer_id?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          released_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'verification_requests_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      access_grants: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          category: string
          is_granted: boolean
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          contact_id: string
          category: string
          is_granted?: boolean
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          category?: string
          is_granted?: boolean
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          { foreignKey: 'access_grants_user_id_fkey'; references: 'public.profiles(id)' },
          { foreignKey: 'access_grants_contact_id_fkey'; references: 'public.trusted_contacts(id)' },
        ]
      }

      notification_preferences: {
        Row: {
          id: string
          user_id: string
          preferences: Json
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          preferences?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          preferences?: Json
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'notification_preferences_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      login_history: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          user_agent: string | null
          device_type: string | null
          location: string | null
          success: boolean
          metadata: Json
          created_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          location?: string | null
          success?: boolean
          metadata?: Json
          created_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          location?: string | null
          success?: boolean
          metadata?: Json
          created_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'login_history_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }

      security_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          severity: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          event_type: string
          severity?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          severity?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
          deleted_at?: string | null
        }
        Relationships: {
          foreignKey: 'security_events_user_id_fkey'
          references: 'public.profiles(id)'
        }[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

type PublicSchema = Database['public']
type TableName = keyof PublicSchema['Tables']
type RowLevel = PublicSchema['Tables'][TableName]['Row']

export type Tables<T extends TableName> = T extends TableName
  ? PublicSchema['Tables'][T]['Row']
  : never

export type TablesInsert<T extends TableName> = T extends TableName
  ? PublicSchema['Tables'][T]['Insert']
  : never

export type TablesUpdate<T extends TableName> = T extends TableName
  ? PublicSchema['Tables'][T]['Update']
  : never

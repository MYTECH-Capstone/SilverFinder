import { Database } from '../types/supabase'

export type Elder =
  Database['public']['Tables']['elders']['Row']

export type Profile =
  Database['public']['Tables']['profiles']['Row']

export type MissingReportInsert =
  Database['public']['Tables']['missing_reports']['Insert']

export type ElderWithProfile =
  Elder & {
    profiles:
      | Pick<Profile, 'avatar_url'>
      | null
  }
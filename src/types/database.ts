export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      students: {
        Row: {
          id: string
          student_number: string
          first_name: string
          last_name: string
          birth_date: string
          gender: string
          classe_id: string | null
          photo_url: string | null
          address: string | null
          enrollment_date: string
          academic_year_id: string
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      parents: {
        Row: {
          id: string
          student_id: string
          full_name: string
          relationship: string
          phone: string
          email: string | null
          address: string | null
          profession: string | null
          is_primary: boolean
          profile_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['parents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['parents']['Insert']>
      }
      classes: {
        Row: {
          id: string
          name: string
          level: string
          teacher_id: string | null
          academic_year_id: string
          room_id: string | null
          capacity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['classes']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          coefficient: number
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      teachers: {
        Row: {
          id: string
          profile_id: string
          employee_number: string
          full_name: string
          email: string
          phone: string | null
          specialty: string
          avatar_url: string | null
          hire_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>
      }
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          building: string | null
          equipment: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      timetable_slots: {
        Row: {
          id: string
          classe_id: string
          subject_id: string
          teacher_id: string
          room_id: string
          day_of_week: number
          start_time: string
          end_time: string
          academic_year_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['timetable_slots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['timetable_slots']['Insert']>
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          classe_id: string
          academic_year_id: string
          trimester: number
          value: number
          max_value: number
          label: string
          date: string
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
      report_cards: {
        Row: {
          id: string
          student_id: string
          classe_id: string
          academic_year_id: string
          trimester: number
          general_average: number
          rank: number | null
          teacher_comment: string | null
          director_comment: string | null
          is_published: boolean
          generated_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['report_cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['report_cards']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          classe_id: string
          date: string
          status: string
          justification: string | null
          justification_url: string | null
          noted_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      fee_types: {
        Row: {
          id: string
          name: string
          amount: number
          academic_year_id: string
          due_date: string | null
          is_mandatory: boolean
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fee_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fee_types']['Insert']>
      }
      student_fees: {
        Row: {
          id: string
          student_id: string
          fee_type_id: string
          amount_due: number
          amount_paid: number
          status: string
          academic_year_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_fees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['student_fees']['Insert']>
      }
      payments: {
        Row: {
          id: string
          student_fee_id: string
          student_id: string
          amount: number
          payment_date: string
          method: string
          receipt_number: string
          recorded_by: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      homework: {
        Row: {
          id: string
          title: string
          description: string
          subject_id: string
          classe_id: string
          teacher_id: string
          due_date: string
          published_at: string
          attachment_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['homework']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['homework']['Insert']>
      }
      submissions: {
        Row: {
          id: string
          homework_id: string
          student_id: string
          submitted_at: string
          content: string | null
          attachment_url: string | null
          grade: number | null
          feedback: string | null
          corrected_at: string | null
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string
          body: string
          sent_at: string
          read_at: string | null
          is_archived: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          author_id: string
          target_roles: string[]
          published_at: string
          expires_at: string | null
          is_pinned: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          user_name: string
          action: string
          table_name: string
          record_id: string
          changes: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      academic_years: {
        Row: {
          id: string
          label: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['academic_years']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['academic_years']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      candidate_applications: {
        Row: {
          application_date: string
          candidate_id: string
          created_at: string
          id: string
          job_position_id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          application_date?: string
          candidate_id: string
          created_at?: string
          id?: string
          job_position_id: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          application_date?: string
          candidate_id?: string
          created_at?: string
          id?: string
          job_position_id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          current_company: string | null
          current_position: string | null
          email: string
          experience_years: number | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          resume_content: string | null
          resume_url: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          resume_content?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          resume_content?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          ai_feedback: string | null
          communication_score: number | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          interview_phase: string | null
          interview_type: string | null
          overall_score: number | null
          questions: Json | null
          responses: Json | null
          resume_content: string | null
          resume_suggestions: Json | null
          role_focus: string | null
          scheduled_at: string | null
          sentiment_score: number | null
          status: Database["public"]["Enums"]["interview_status"]
          technical_score: number | null
          title: string
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          communication_score?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          interview_phase?: string | null
          interview_type?: string | null
          overall_score?: number | null
          questions?: Json | null
          responses?: Json | null
          resume_content?: string | null
          resume_suggestions?: Json | null
          role_focus?: string | null
          scheduled_at?: string | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["interview_status"]
          technical_score?: number | null
          title: string
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          communication_score?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          interview_phase?: string | null
          interview_type?: string | null
          overall_score?: number | null
          questions?: Json | null
          responses?: Json | null
          resume_content?: string | null
          resume_suggestions?: Json | null
          role_focus?: string | null
          scheduled_at?: string | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["interview_status"]
          technical_score?: number | null
          title?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_positions: {
        Row: {
          created_at: string
          description: string | null
          experience_level: string | null
          id: string
          is_active: boolean | null
          requirements: string[] | null
          salary_range: string | null
          skills_required: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          salary_range?: string | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          salary_range?: string | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcq_questions: {
        Row: {
          category: Database["public"]["Enums"]["mcq_category"]
          correct_answer: string
          created_at: string
          difficulty_level: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["mcq_category"]
          correct_answer: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["mcq_category"]
          correct_answer?: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      mcq_responses: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          is_correct: boolean
          question_id: string | null
          question_text: string
          session_id: string
          time_taken_seconds: number | null
          user_answer: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          is_correct: boolean
          question_id?: string | null
          question_text: string
          session_id: string
          time_taken_seconds?: number | null
          user_answer: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          question_text?: string
          session_id?: string
          time_taken_seconds?: number | null
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mcq_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_sessions: {
        Row: {
          category: Database["public"]["Enums"]["mcq_category"] | null
          completed_at: string | null
          correct_answers: number
          created_at: string
          id: string
          resume_content: string | null
          score: number | null
          session_type: string
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["mcq_category"] | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          resume_content?: string | null
          score?: number | null
          session_type: string
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["mcq_category"] | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          resume_content?: string | null
          score?: number | null
          session_type?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ai_feedback: string | null
          created_at: string
          id: string
          improvements: string[] | null
          missing_skills: string[] | null
          overall_score: number | null
          resume_content: string
          strengths: string[] | null
          target_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          missing_skills?: string[] | null
          overall_score?: number | null
          resume_content: string
          strengths?: string[] | null
          target_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          missing_skills?: string[] | null
          overall_score?: number | null
          resume_content?: string
          strengths?: string[] | null
          target_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      candidate_status: "active" | "hired" | "rejected" | "withdrawn"
      interview_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      mcq_category:
        | "algorithms"
        | "data_structures"
        | "frontend"
        | "backend"
        | "databases"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidate_status: ["active", "hired", "rejected", "withdrawn"],
      interview_status: ["scheduled", "in_progress", "completed", "cancelled"],
      mcq_category: [
        "algorithms",
        "data_structures",
        "frontend",
        "backend",
        "databases",
      ],
    },
  },
} as const

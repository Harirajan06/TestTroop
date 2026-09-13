export type UserRole = 'user' | 'admin';

export type ContestStatus = 
  | 'draft'
  | 'registration_open'
  | 'upcoming'
  | 'testing_live'
  | 'submission_closed'
  | 'results_pending'
  | 'winner_announced'
  | 'completed';

export type ContestType = 'mobile_app' | 'website' | 'web_app' | 'other';

export type SubmissionCategory = 'bug_report' | 'ui_ux' | 'suggestion';

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type ReviewStatus = 'pending' | 'shortlisted' | 'valid' | 'invalid' | 'rejected';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  contest_type: ContestType;
  product_name: string;
  product_url?: string;
  platform: string;
  banner_url?: string;
  prize_amount: number;
  currency: string;
  status: ContestStatus;
  
  registration_start: string;
  registration_end: string;
  contest_start: string;
  contest_end: string;
  submission_deadline: string;
  result_date: string;
  
  testing_instructions: string;
  eligibility_requirements?: string;
  whatsapp_group_url?: string;
  allowed_categories: SubmissionCategory[];
  custom_confirmation_message?: string;
  
  created_by?: string;
  created_at: string;
  updated_at: string;

  registration_count?: number;
  submission_count?: number;
  winner?: ContestWinner;
}

export interface ContestRegistration {
  id: string;
  contest_id: string;
  user_id: string;
  registered_at: string;
  profile?: UserProfile;
  contest?: Contest;
}

export interface Submission {
  id: string;
  contest_id: string;
  user_id: string;
  submitted_at: string;
  profile?: UserProfile;
  bug_reports?: BugReport[];
  ui_feedback?: UIFeedback[];
  suggestions?: Suggestion[];
}

export interface BugReport {
  id: string;
  submission_id: string;
  contest_id: string;
  user_id: string;
  title: string;
  description: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  severity: BugSeverity;
  device_platform: string;
  environment_version?: string;
  screenshot_urls?: string[];
  video_url?: string;
  attachment_urls?: string[];
  created_at: string;
}

export interface UIFeedback {
  id: string;
  submission_id: string;
  contest_id: string;
  user_id: string;
  title: string;
  current_problem: string;
  suggested_improvement: string;
  detailed_explanation?: string;
  screenshot_urls?: string[];
  attachment_urls?: string[];
  created_at: string;
}

export interface Suggestion {
  id: string;
  submission_id: string;
  contest_id: string;
  user_id: string;
  title: string;
  description: string;
  detailed_explanation?: string;
  attachment_urls?: string[];
  created_at: string;
}

export interface ContestReview {
  id: string;
  contest_id: string;
  user_id: string;
  submission_id?: string;
  reviewer_id: string;
  
  bug_quality_score: number;
  coverage_score: number;
  ui_feedback_score: number;
  suggestion_score: number;
  overall_score: number;
  
  review_status: ReviewStatus;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  
  profile?: UserProfile;
}

export interface ContestWinner {
  id: string;
  contest_id: string;
  winner_user_id: string;
  prize_title: string;
  prize_amount: number;
  announcement_headline: string;
  announcement_body: string;
  winning_summary?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  
  winner_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  contest_title?: string;
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  contest_id?: string;
  recipient_filter: 'all_users' | 'registered' | 'submitted' | 'custom';
  template_html: string;
  status: CampaignStatus;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  contest_title?: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  user_id: string;
  email: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  channel: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  action_url?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

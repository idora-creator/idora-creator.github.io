// ===== 数据模型类型定义 =====

export type VillageStatus = 'pending' | 'approved' | 'rejected';

export interface Village {
  id: string;
  name: string;
  province: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
  visitCount: number;
  population: number;
  description: string;
  needs: VillageNeed[];
  /** 已被匹配的实践队伍 ID 列表 */
  matchedTeamIds: string[];
  status: VillageStatus;
  createdAt: string;
}

export interface VillageNeed {
  id: string;
  category: NeedCategory;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'matched' | 'fulfilled';
  createdAt: string;
}

export type NeedCategory =
  | 'education'
  | 'medical'
  | 'agriculture'
  | 'culture'
  | 'environment'
  | 'elderly_care'
  | 'infrastructure'
  | 'digital';

export const NEED_CATEGORY_LABELS: Record<NeedCategory, string> = {
  education: '教育帮扶',
  medical: '医疗卫生',
  agriculture: '农业科技',
  culture: '文化传承',
  environment: '生态环保',
  elderly_care: '养老服务',
  infrastructure: '基础设施',
  digital: '数字乡村',
};

export interface Team {
  id: string;
  name: string;
  university: string;
  memberCount: number;
  skills: string[];
  preferredCategories: NeedCategory[];
  description: string;
  /** 已完成实践次数 */
  completedCount: number;
}

export interface MatchResult {
  teamId: string;
  villageId: string;
  score: number;
  reasons: string[];
  teamName: string;
  villageName: string;
}

export interface PracticePlan {
  title: string;
  villageName: string;
  duration: string;
  objectives: string[];
  activities: PlanActivity[];
  budget: PlanBudget;
  schedule: PlanSchedule[];
}

export interface PlanActivity {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface PlanBudget {
  total: number;
  items: { name: string; amount: number }[];
}

export interface PlanSchedule {
  phase: string;
  days: string;
  tasks: string[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  type?: 'text' | 'match_result' | 'plan' | 'needs_list';
  data?: MatchResult[] | PracticePlan | VillageNeed[];
  timestamp: number;
}

export type AgentModule = 'needs_report' | 'match' | 'plan' | 'create_team' | 'create_village' | 'idle';

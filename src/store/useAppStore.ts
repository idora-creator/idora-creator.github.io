import { create } from 'zustand';
import type { Village, Team, AgentModule, MatchResult, VillageNeed, AgentMessage } from '../types';
import { mockVillages, mockTeams } from '../data/mockData';
import { fetchAllVillages, addVillageNeed, updateNeedStatus, createVillage, updateVillage, deleteVillage, updateVillageStatus } from '../lib/villageService';
import { fetchAllTeams, createTeam, updateTeam, deleteTeam } from '../lib/teamService';

interface AppState {
  // 数据
  villages: Village[];
  teams: Team[];
  dbReady: boolean;

  // UI 状态
  activeModule: AgentModule;
  sidebarOpen: boolean;
  selectedVillageId: string | null;
  selectedTeamId: string | null;

  // Agent 对话
  messages: AgentMessage[];
  agentTyping: boolean;

  // 匹配结果
  matchResults: MatchResult[];

  // Actions
  loadFromDB: () => Promise<void>;
  setActiveModule: (module: AgentModule) => void;
  toggleSidebar: () => void;
  selectVillage: (id: string | null) => void;
  selectTeam: (id: string | null) => void;
  addMessage: (msg: AgentMessage) => void;
  setAgentTyping: (typing: boolean) => void;
  addNeed: (villageId: string, need: VillageNeed) => void;
  addTeam: (team: Team) => Promise<void>;
  addVillage: (village: Village) => Promise<void>;
  approveVillage: (villageId: string) => void;
  rejectVillage: (villageId: string) => void;
  updateVillageAction: (id: string, updates: Partial<Village>) => Promise<void>;
  deleteVillageAction: (id: string) => Promise<void>;
  updateTeamAction: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeamAction: (id: string) => Promise<void>;
  updateNeedStatusAction: (villageId: string, needId: string, status: VillageNeed['status']) => void;
  setMatchResults: (results: MatchResult[]) => void;

  // 派生数据
  getSelectedVillage: () => Village | undefined;
  getApprovedVillages: () => Village[];
  getPendingVillages: () => Village[];
}

let msgId = 0;
function nextMsgId() {
  return `msg_${++msgId}_${Date.now()}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  villages: [],
  teams: [],
  dbReady: false,
  activeModule: 'idle',
  sidebarOpen: true,
  selectedVillageId: null,
  selectedTeamId: null,
  messages: [
    {
      id: nextMsgId(),
      role: 'agent',
      content: '欢迎使用三下乡乡村实践地图智能体平台！我是您的专属助手，可以帮您：\n\n🔍 **查看乡村热力地图** — 了解各地实践队伍到访情况\n📋 **上报乡村需求** — 提交基层真实需求信息\n🎯 **智能匹配** — 为实践队伍找到最合适的服务乡村\n📝 **方案生成** — 一键生成社会实践方案\n👥 **创建队伍** — 注册新的实践团队\n\n请点击左侧功能模块或直接告诉我您的需求！',
      timestamp: Date.now(),
    },
  ],
  agentTyping: false,
  matchResults: [],

  // === 从 Supabase 加载数据 ===
  loadFromDB: async () => {
    try {
      const [villages, teams] = await Promise.all([
        fetchAllVillages(),
        fetchAllTeams(),
      ]);
      if (villages.length > 0) {
        set({ villages, teams, dbReady: true });
        const pendingNeeds = villages.reduce(
          (s, v) => s + v.needs.filter((n) => n.status === 'pending').length, 0
        );
        const gray = villages.filter((v) => v.visitCount === 0).length;
        get().addMessage({
          id: nextMsgId(),
          role: 'agent',
          content: `✅ 数据库连接成功！已加载 **${villages.length}** 个乡村、**${teams.length}** 支队伍、**${pendingNeeds}** 项待解决需求。其中 **${gray}** 个乡村为实践空白区域。`,
          timestamp: Date.now(),
        });
      } else {
        // DB 为空，回退到 Mock 数据
        console.warn('Supabase 返回空数据，使用本地 Mock 数据');
        set({ villages: mockVillages, teams: mockTeams, dbReady: false });
      }
    } catch (err) {
      console.error('Supabase 连接失败，使用本地 Mock 数据', err);
      set({ villages: mockVillages, teams: mockTeams, dbReady: false });
    }
  },

  setActiveModule: (m) => set({ activeModule: m }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectVillage: (id) => set({ selectedVillageId: id }),
  selectTeam: (id) => set({ selectedTeamId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setAgentTyping: (typing) => set({ agentTyping: typing }),
  setMatchResults: (results) => set({ matchResults: results }),

  addNeed: (villageId, need) => {
    // 乐观更新本地状态
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === villageId ? { ...v, needs: [...v.needs, need] } : v
      ),
    }));
    // 异步写入 Supabase
    addVillageNeed(villageId, need).catch((err) =>
      console.error('写入需求失败', err)
    );
  },

  addTeam: async (team) => {
    // 写入 Supabase
    const { dbReady } = get();
    if (dbReady) {
      try {
        await createTeam(team);
      } catch (err) {
        console.error('创建队伍失败', err);
      }
    }
    // 更新本地状态
    set((s) => ({ teams: [...s.teams, team] }));
  },

  updateNeedStatusAction: (villageId, needId, status) => {
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === villageId
          ? { ...v, needs: v.needs.map((n) => (n.id === needId ? { ...n, status } : n)) }
          : v
      ),
    }));
    updateNeedStatus(needId, status).catch((err) =>
      console.error('更新需求状态失败', err)
    );
  },

  addVillage: async (village) => {
    set((s) => ({ villages: [...s.villages, village] }));
    const { dbReady } = get();
    if (dbReady) {
      createVillage(village).catch((err) =>
        console.error('创建村庄失败', err)
      );
    }
  },

  approveVillage: (villageId) => {
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === villageId ? { ...v, status: 'approved' as const } : v
      ),
    }));
    updateVillageStatus(villageId, 'approved').catch((err) =>
      console.error('更新村庄状态失败', err)
    );
  },

  rejectVillage: (villageId) => {
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === villageId ? { ...v, status: 'rejected' as const } : v
      ),
    }));
    updateVillageStatus(villageId, 'rejected').catch((err) =>
      console.error('更新村庄状态失败', err)
    );
  },

  updateVillageAction: async (id, updates) => {
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
    const { dbReady } = get();
    if (dbReady) {
      const payload: {
        name?: string;
        city?: string;
        county?: string;
        lat?: number;
        lng?: number;
        population?: number;
        description?: string;
        needs?: VillageNeed[];
      } = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.county !== undefined) payload.county = updates.county;
      if (updates.lat !== undefined) payload.lat = updates.lat;
      if (updates.lng !== undefined) payload.lng = updates.lng;
      if (updates.population !== undefined) payload.population = updates.population;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.needs !== undefined) payload.needs = updates.needs;
      updateVillage(id, payload).catch((err) =>
        console.error('更新村庄失败', err)
      );
    }
  },

  deleteVillageAction: async (id) => {
    set((s) => ({ villages: s.villages.filter((v) => v.id !== id) }));
    const { dbReady } = get();
    if (dbReady) {
      deleteVillage(id).catch((err) =>
        console.error('删除村庄失败', err)
      );
    }
  },

  updateTeamAction: async (id, updates) => {
    set((s) => ({
      teams: s.teams.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
    const { dbReady } = get();
    if (dbReady) {
      const payload: {
        name?: string;
        university?: string;
        memberCount?: number;
        skills?: string[];
        preferredCategories?: string[];
        description?: string;
        completedCount?: number;
      } = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.university !== undefined) payload.university = updates.university;
      if (updates.memberCount !== undefined) payload.memberCount = updates.memberCount;
      if (updates.skills !== undefined) payload.skills = updates.skills;
      if (updates.preferredCategories !== undefined) payload.preferredCategories = updates.preferredCategories;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.completedCount !== undefined) payload.completedCount = updates.completedCount;
      updateTeam(id, payload).catch((err) =>
        console.error('更新队伍失败', err)
      );
    }
  },

  deleteTeamAction: async (id) => {
    set((s) => ({ teams: s.teams.filter((t) => t.id !== id) }));
    const { dbReady } = get();
    if (dbReady) {
      deleteTeam(id).catch((err) =>
        console.error('删除队伍失败', err)
      );
    }
  },

  getSelectedVillage: () => {
    const { villages, selectedVillageId } = get();
    return villages.find((v) => v.id === selectedVillageId);
  },

  getApprovedVillages: () => {
    return get().villages.filter((v) => v.status === 'approved');
  },

  getPendingVillages: () => {
    return get().villages.filter((v) => v.status === 'pending');
  },
}));

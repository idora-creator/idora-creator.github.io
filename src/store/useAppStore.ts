import { create } from 'zustand';
import type { Village, Team, AgentModule, MatchResult, VillageNeed, AgentMessage } from '../types';
import { mockVillages, mockTeams } from '../data/mockData';
import { fetchAllVillages, addVillageNeed, updateNeedStatus } from '../lib/villageService';
import { fetchAllTeams, createTeam } from '../lib/teamService';

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
  updateNeedStatusAction: (villageId: string, needId: string, status: VillageNeed['status']) => void;
  setMatchResults: (results: MatchResult[]) => void;

  // 派生数据
  getSelectedVillage: () => Village | undefined;
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

  getSelectedVillage: () => {
    const { villages, selectedVillageId } = get();
    return villages.find((v) => v.id === selectedVillageId);
  },
}));

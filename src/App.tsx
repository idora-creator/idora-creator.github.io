import { useEffect, Component, type ReactNode } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Layout/Sidebar';
import HeatMap from './components/Map/HeatMap';
import AgentPanel from './components/Agent/AgentPanel';
import Dashboard from './components/Dashboard/Dashboard';
import VillageDetail from './components/Dashboard/VillageDetail';
import NeedsReport from './components/Modules/NeedsReport/NeedsReport';
import MatchMaker from './components/Modules/MatchMaker/MatchMaker';
import PlanGenerator from './components/Modules/PlanGenerator/PlanGenerator';
import CreateTeam from './components/Modules/CreateTeam/CreateTeam';
import CreateVillage from './components/Modules/CreateVillage/CreateVillage';
import './App.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#e53e3e', background: '#fff', minHeight: '100vh' }}>
          <h2>程序崩溃</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#718096', marginTop: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ModuleContent() {
  const activeModule = useAppStore((s) => s.activeModule);
  switch (activeModule) {
    case 'needs_report': return <NeedsReport />;
    case 'match': return <MatchMaker />;
    case 'plan': return <PlanGenerator />;
    case 'create_team': return <CreateTeam />;
    case 'create_village': return <CreateVillage />;
    default: return null;
  }
}

function MobileBottomNav() {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const items = [
    { key: 'idle' as const, icon: '🗺️', label: '地图' },
    { key: 'needs_report' as const, icon: '📋', label: '需求' },
    { key: 'match' as const, icon: '🎯', label: '匹配' },
    { key: 'plan' as const, icon: '📝', label: '方案' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`nav-btn ${activeModule === item.key ? 'active' : ''}`}
          onClick={() => setActiveModule(item.key)}
        >
          <span className="nav-btn-icon">{item.icon}</span>
          <span className="nav-btn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const loadFromDB = useAppStore((s) => s.loadFromDB);

  // 启动时从 Supabase 加载数据
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // 手机端锁定 sidebar 为关闭状态
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  }, []);

  return (
    <ErrorBoundary>
    <div className="app-layout">
      {/* 侧边栏 (桌面端常驻, 手机端抽屉) */}
      <Sidebar />

      {/* 主区域 */}
      <main className="main-area">
        <div className={`map-section ${activeModule !== 'idle' ? 'with-module' : ''}`}>
          <HeatMap />
          {activeModule === 'idle' && (
            <>
              <Dashboard />
              <VillageDetail />
            </>
          )}
        </div>

        {/* 模块面板 */}
        {activeModule !== 'idle' && (
          <div className="module-overlay">
            <div className="module-overlay-header">
              <button className="module-back-btn" onClick={() => setActiveModule('idle')}>
                ✕ 关闭
              </button>
            </div>
            <ModuleContent />
          </div>
        )}

        {/* 移动端底部导航 */}
        <MobileBottomNav />

        {/* 移动端智能体 FAB 按钮 */}
        <button
          className="mobile-agent-fab"
          onClick={() => {
            const panel = document.querySelector('.agent-section');
            panel?.classList.toggle('mobile-open');
          }}
        >
          💬
        </button>
      </main>

      {/* 智能体面板 (桌面端侧栏, 手机端底部弹出) */}
      <div className="agent-section">
        <div className="agent-section-inner">
          <div className="mobile-agent-header">
            <span>🤖 地图智能体</span>
            <button
              className="mobile-agent-close"
              onClick={() => {
                const panel = document.querySelector('.agent-section');
                panel?.classList.remove('mobile-open');
              }}
            >
              ✕
            </button>
          </div>
          <AgentPanel />
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

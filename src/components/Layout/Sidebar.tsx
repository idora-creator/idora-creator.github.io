import { useAppStore } from '../../store/useAppStore';
import type { AgentModule } from '../../types';
import './Sidebar.css';

const modules: { key: AgentModule; icon: string; label: string; desc: string }[] = [
  { key: 'needs_report', icon: '📋', label: '需求上报', desc: '基层需求在线提交' },
  { key: 'match', icon: '🎯', label: '智能匹配', desc: '队伍与乡村精准匹配' },
  { key: 'plan', icon: '📝', label: '方案生成', desc: '实践方案辅助生成' },
  { key: 'create_village', icon: '🏘️', label: '登记村庄', desc: '提交未覆盖的村庄信息' },
];

export default function Sidebar() {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const selectVillage = useAppStore((s) => s.selectVillage);
  const addMessage = useAppStore((s) => s.addMessage);
  const villages = useAppStore((s) => s.villages);

  const approved = villages.filter((v) => v.status === 'approved' || !v.status);
  let pendingNeedsCount = 0;
  let grayCount = 0;
  for (const v of approved) {
    if (v.visitCount === 0) grayCount++;
    for (const n of v.needs) {
      if (n.status === 'pending') pendingNeedsCount++;
    }
  }

  function handleModuleClick(key: AgentModule) {
    setActiveModule(key);
    // 手机端关闭抽屉
    if (window.innerWidth <= 768) {
      useAppStore.setState({ sidebarOpen: false });
    }
    if (key === 'create_team') {
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: '已切换到**👥 创建队伍**模块。请填写队伍信息注册新实践团队，注册后即可参与智能匹配。',
        timestamp: Date.now(),
      });
    } else if (key === 'create_village') {
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: '已切换到**🏘️ 登记村庄**模块。请填写未覆盖的村庄信息，提交后需管理员审核通过，才会上线到地图。',
        timestamp: Date.now(),
      });
    } else if (key === 'manage_teams') {
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: '已切换到**📋 队伍管理**模块。可查看、编辑或删除已注册的实践队伍信息。',
        timestamp: Date.now(),
      });
    } else if (key === 'manage_villages') {
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: '已切换到**📂 村庄管理**模块。可审核村庄申请、编辑信息或删除村庄。',
        timestamp: Date.now(),
      });
    } else {
      const mod = modules.find((m) => m.key === key);
      if (mod) {
        addMessage({
          id: `msg_${Date.now()}`,
          role: 'agent',
          content: `已切换到**${mod.label}**模块。${mod.desc}，请按提示操作或直接告诉我您的需求。`,
          timestamp: Date.now(),
        });
      }
    }
  }

  function handleMapClick() {
    setActiveModule('idle');
    selectVillage(null);
    if (window.innerWidth <= 768) {
      useAppStore.setState({ sidebarOpen: false });
    }
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🗺️ 当前为地图浏览模式。\n\n可点击地图上的圆点查看乡村详情。\n- **色块越亮** = 实践队伍到访频次越高\n- **灰色标记** = 实践空白区域，急需关注\n\n当前共有 **${pendingNeedsCount}** 项待解决需求分布在 **${grayCount}** 个尚未有实践队伍到访的乡村。`,
      timestamp: Date.now(),
    });
  }

  return (
    <>
      {/* 手机端汉堡菜单按钮 */}
      <button className="hamburger-btn" onClick={toggleSidebar} aria-label="菜单">
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* 手机端遮罩层 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? '◀' : '▶'}
        </div>

        <div className="sidebar-content">
          <div className="sidebar-brand">
            <div className="brand-icon">🌾</div>
            {sidebarOpen && (
              <>
                <h1 className="brand-title">三下乡实践地图</h1>
                <p className="brand-subtitle">乡村实践智能体平台</p>
              </>
            )}
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item map-btn ${activeModule === 'idle' ? 'active' : ''}`}
              onClick={handleMapClick}
            >
              <span className="nav-icon">🗺️</span>
              {sidebarOpen && <span className="nav-label">地图总览</span>}
            </button>

            <div className="nav-divider" />

            {modules.map((m) => (
              <button
                key={m.key}
                className={`nav-item ${activeModule === m.key ? 'active' : ''}`}
                onClick={() => handleModuleClick(m.key)}
              >
                <span className="nav-icon">{m.icon}</span>
                {sidebarOpen && (
                  <div className="nav-text">
                    <span className="nav-label">{m.label}</span>
                    <span className="nav-desc">{m.desc}</span>
                  </div>
                )}
                {m.key === 'needs_report' && pendingNeedsCount > 0 && (
                  <span className="nav-badge">{pendingNeedsCount}</span>
                )}
              </button>
            ))}

            <div className="nav-divider" />

            <button
              className={`nav-item create-team-btn ${activeModule === 'create_team' ? 'active' : ''}`}
              onClick={() => handleModuleClick('create_team')}
            >
              <span className="nav-icon">👥</span>
              {sidebarOpen && (
                <div className="nav-text">
                  <span className="nav-label">创建队伍</span>
                  <span className="nav-desc">注册新实践团队</span>
                </div>
              )}
            </button>

            <button
              className={`nav-item ${activeModule === 'manage_teams' ? 'active' : ''}`}
              onClick={() => handleModuleClick('manage_teams')}
            >
              <span className="nav-icon">📋</span>
              {sidebarOpen && (
                <div className="nav-text">
                  <span className="nav-label">队伍管理</span>
                  <span className="nav-desc">编辑与删除队伍</span>
                </div>
              )}
            </button>

            <button
              className={`nav-item ${activeModule === 'manage_villages' ? 'active' : ''}`}
              onClick={() => handleModuleClick('manage_villages')}
            >
              <span className="nav-icon">📂</span>
              {sidebarOpen && (
                <div className="nav-text">
                  <span className="nav-label">村庄管理</span>
                  <span className="nav-desc">审核与编辑村庄</span>
                </div>
              )}
            </button>
          </nav>

          {sidebarOpen && (
            <div className="sidebar-stats">
              <div className="stat-mini">
                <div className="stat-mini-value">{approved.length}</div>
                <div className="stat-mini-label">覆盖乡村</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value highlight">{grayCount}</div>
                <div className="stat-mini-label">实践空白</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value pending">{pendingNeedsCount}</div>
                <div className="stat-mini-label">待解决需求</div>
              </div>
            </div>
          )}

          {sidebarOpen && (
            <div className="sidebar-footer">
              <div className="footer-info">
                <span>三下乡 · 乡村振兴</span>
                <span className="footer-ver">v1.0</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

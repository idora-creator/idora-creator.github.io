import { useAppStore } from '../../store/useAppStore';
import { getHeatColor } from '../../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const villages = useAppStore((s) => s.villages);
  const teamsCount = useAppStore((s) => s.teams.length);
  const selectVillage = useAppStore((s) => s.selectVillage);
  const approveVillage = useAppStore((s) => s.approveVillage);
  const rejectVillage = useAppStore((s) => s.rejectVillage);
  const addMessage = useAppStore((s) => s.addMessage);

  const approved = villages.filter((v) => v.status === 'approved');
  const pending = villages.filter((v) => v.status === 'pending');

  let grayCount = 0;
  let pendingNeeds = 0;

  for (const v of approved) {
    if (v.visitCount === 0) grayCount++;
    for (const n of v.needs) {
      if (n.status === 'pending') pendingNeeds++;
    }
  }

  const hotList = approved.filter((v) => v.visitCount >= 15).sort((a, b) => b.visitCount - a.visitCount);
  const grayList = approved.filter((v) => v.visitCount === 0).sort((a, b) => a.name.localeCompare(b.name));

  function handleApprove(vId: string, vName: string) {
    approveVillage(vId);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✅ 村庄「**${vName}**」已通过审核，已上线到地图。`,
      timestamp: Date.now(),
    });
  }

  function handleReject(vId: string, vName: string) {
    rejectVillage(vId);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `❌ 村庄「**${vName}**」未通过审核。`,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="dashboard-overlay">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-value">{approved.length}</div>
          <div className="stat-card-label">覆盖乡村</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-card-value">{grayCount}</div>
          <div className="stat-card-label">实践空白区域</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-value">{pendingNeeds}</div>
          <div className="stat-card-label">待解决需求</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{teamsCount}</div>
          <div className="stat-card-label">注册实践队</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="overlay-panels" style={{ marginBottom: 12 }}>
          <div className="overlay-panel approval-panel" style={{ maxWidth: '100%', flex: '1 1 100%' }}>
            <div className="panel-header">
              <span className="panel-icon">⏳</span>
              <span className="panel-title">待审核村庄</span>
              <span className="panel-badge" style={{ background: '#ed8936', color: '#fff' }}>{pending.length}个</span>
            </div>
            <div className="panel-body approval-body">
              {pending.map((v) => (
                <div key={v.id} className="approval-row">
                  <div className="approval-info">
                    <span className="approval-name">{v.name}</span>
                    <span className="approval-loc">{v.province} {v.city} {v.county}</span>
                    <span className="approval-pop">人口{v.population}人</span>
                    {v.needs.length > 0 && (
                      <span className="approval-needs">{v.needs.length}项需求</span>
                    )}
                  </div>
                  <div className="approval-actions">
                    <button className="approve-btn" onClick={() => handleApprove(v.id, v.name)}>通过</button>
                    <button className="reject-btn" onClick={() => handleReject(v.id, v.name)}>拒绝</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overlay-panels">
        <div className="overlay-panel hot-panel">
          <div className="panel-header">
            <span className="panel-icon">🔥</span>
            <span className="panel-title">热门到访区域</span>
            <span className="panel-badge">{hotList.length}个</span>
          </div>
          <div className="panel-body">
            {hotList.slice(0, 5).map((v) => (
              <div key={v.id} className="panel-item" onClick={() => selectVillage(v.id)}>
                <span className="item-name">{v.name}</span>
                <span className="item-loc">{v.province}</span>
                <span className="item-count" style={{ background: getHeatColor(v.visitCount) }}>
                  {v.visitCount}次
                </span>
              </div>
            ))}
            {hotList.length === 0 && <div className="panel-empty">暂无数据</div>}
            <div className="panel-tip">
              💡 建议引导新队伍避开以上热门区域
            </div>
          </div>
        </div>

        <div className="overlay-panel gray-panel">
          <div className="panel-header">
            <span className="panel-icon">📍</span>
            <span className="panel-title">实践缺口推荐</span>
            <span className="panel-badge urgent">{grayList.length}个</span>
          </div>
          <div className="panel-body">
            {grayList.slice(0, 5).map((v) => (
              <div key={v.id} className="panel-item" onClick={() => selectVillage(v.id)}>
                <span className="item-name">{v.name}</span>
                <span className="item-loc">{v.province}</span>
                <span className="item-needs-count">
                  {v.needs.filter((n) => n.status === 'pending').length}项需求
                </span>
              </div>
            ))}
            {grayList.length === 0 && <div className="panel-empty">暂无数据</div>}
            <div className="panel-tip urgent">
              ⚡ 以上乡村从未有实践队伍到访，急需关注
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

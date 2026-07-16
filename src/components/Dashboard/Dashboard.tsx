import { useAppStore } from '../../store/useAppStore';
import { getHeatColor } from '../../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  // 选取稳定原始数据，避免派生新对象导致无限渲染
  const villages = useAppStore((s) => s.villages);
  const teamsCount = useAppStore((s) => s.teams.length);
  const selectVillage = useAppStore((s) => s.selectVillage);

  // 以下在组件体内计算，是局部变量，不会触发重渲染
  const totalVillages = villages.length;

  let grayCount = 0;
  let totalNeeds = 0;
  let pendingNeeds = 0;
  const hotList = [];
  const grayList = [];

  for (const v of villages) {
    if (v.visitCount === 0) grayCount++;
    for (const n of v.needs) {
      totalNeeds++;
      if (n.status === 'pending') pendingNeeds++;
    }
  }

  for (const v of villages) {
    if (v.visitCount >= 15) hotList.push(v);
    if (v.visitCount === 0) grayList.push(v);
  }
  hotList.sort((a, b) => b.visitCount - a.visitCount);
  grayList.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="dashboard-overlay">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-value">{totalVillages}</div>
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
            <div className="panel-tip urgent">
              ⚡ 以上乡村从未有实践队伍到访，急需关注
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

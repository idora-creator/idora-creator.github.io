import { useAppStore } from '../../store/useAppStore';
import { NEED_CATEGORY_LABELS } from '../../types';
import { getHeatColor, getVisitLabel } from '../../data/mockData';
import './VillageDetail.css';

export default function VillageDetail() {
  const village = useAppStore((s) => s.getSelectedVillage());
  const selectVillage = useAppStore((s) => s.selectVillage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  if (!village) return null;

  return (
    <div className="village-detail-panel">
      <button className="close-btn" onClick={() => selectVillage(null)}>✕</button>

      <div className="vd-header">
        <h2>{village.name}</h2>
        <span className="vd-badge" style={{ background: getHeatColor(village.visitCount) }}>
          {getVisitLabel(village.visitCount)}
        </span>
      </div>

      <div className="vd-meta">
        <div className="vd-meta-item">
          <span className="meta-label">位置</span>
          <span className="meta-value">{village.province} {village.city} {village.county}</span>
        </div>
        <div className="vd-meta-row">
          <div className="vd-meta-item">
            <span className="meta-label">人口</span>
            <span className="meta-value">{village.population}人</span>
          </div>
          <div className="vd-meta-item">
            <span className="meta-label">历史到访</span>
            <span className="meta-value">{village.visitCount}次</span>
          </div>
        </div>
      </div>

      <p className="vd-desc">{village.description}</p>

      {/* 需求列表 */}
      {village.needs.length > 0 && (
        <div className="vd-section">
          <h4>
            📋 乡村需求
            <span className="section-count">{village.needs.length}</span>
          </h4>
          <div className="vd-needs-list">
            {village.needs.map((need) => (
              <div key={need.id} className={`vd-need-card ${need.urgency}`}>
                <div className="vd-need-header">
                  <span className="vd-need-cat">{NEED_CATEGORY_LABELS[need.category]}</span>
                  <span className={`vd-need-urgency ${need.urgency}`}>
                    {need.urgency === 'high' ? '紧急' : need.urgency === 'medium' ? '一般' : '不急'}
                  </span>
                  <span className={`vd-need-status ${need.status}`}>
                    {need.status === 'pending' ? '待匹配' : need.status === 'matched' ? '已匹配' : '已完成'}
                  </span>
                </div>
                <div className="vd-need-title">{need.title}</div>
                <div className="vd-need-desc">{need.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 行动建议 */}
      <div className="vd-actions">
        {village.visitCount === 0 && (
          <div className="vd-callout urgent">
            ⚡ 该村为<b>实践空白区域</b>，从未有高校实践队伍到访，急需关注！
          </div>
        )}
        {village.visitCount >= 15 && (
          <div className="vd-callout warning">
            💡 该村为<b>热门到访区域</b>，建议优先考虑其他存在实践缺口的乡村。
          </div>
        )}
        <div className="vd-action-btns">
          <button onClick={() => setActiveModule('needs_report')}>
            📋 上报新需求
          </button>
          <button onClick={() => setActiveModule('match')}>
            🎯 查找匹配队伍
          </button>
          <button onClick={() => setActiveModule('plan')}>
            📝 生成实践方案
          </button>
        </div>
      </div>
    </div>
  );
}

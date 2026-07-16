import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { Village, NeedCategory, VillageNeed } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import { getHeatColor, getVisitLabel } from '../../../data/mockData';
import './ManageVillages.css';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

const ALL_CATEGORIES: NeedCategory[] = [
  'education', 'medical', 'agriculture', 'culture',
  'environment', 'elderly_care', 'infrastructure', 'digital',
];

export default function ManageVillages() {
  const villages = useAppStore((s) => s.villages);
  const updateVillageAction = useAppStore((s) => s.updateVillageAction);
  const deleteVillageAction = useAppStore((s) => s.deleteVillageAction);
  const approveVillage = useAppStore((s) => s.approveVillage);
  const rejectVillage = useAppStore((s) => s.rejectVillage);
  const addMessage = useAppStore((s) => s.addMessage);
  const selectVillage = useAppStore((s) => s.selectVillage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const [filter, setFilter] = useState<FilterTab>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
    county: '',
    lat: '',
    lng: '',
    population: '',
    description: '',
  });
  const [editNeeds, setEditNeeds] = useState<VillageNeed[]>([]);
  const [needTitle, setNeedTitle] = useState('');
  const [needDesc, setNeedDesc] = useState('');
  const [needCat, setNeedCat] = useState<NeedCategory>('education');
  const [needUrgency, setNeedUrgency] = useState<'high' | 'medium' | 'low'>('medium');

  const filtered = villages.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const counts = {
    all: villages.length,
    pending: villages.filter((v) => v.status === 'pending').length,
    approved: villages.filter((v) => v.status === 'approved').length,
    rejected: villages.filter((v) => v.status === 'rejected').length,
  };

  function startEdit(v: Village) {
    setEditingId(v.id);
    setEditForm({
      name: v.name,
      city: v.city,
      county: v.county,
      lat: String(v.lat),
      lng: String(v.lng),
      population: String(v.population),
      description: v.description,
    });
    setEditNeeds(v.needs.map((n) => ({ ...n })));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function addNeedItem() {
    const t = needTitle.trim();
    if (!t) return;
    const newNeed: VillageNeed = {
      id: `n_edit_${Date.now()}_${editNeeds.length}`,
      category: needCat,
      title: t,
      description: needDesc.trim(),
      urgency: needUrgency,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setEditNeeds([...editNeeds, newNeed]);
    setNeedTitle('');
    setNeedDesc('');
    setNeedCat('education');
    setNeedUrgency('medium');
  }

  function removeNeed(i: number) {
    setEditNeeds(editNeeds.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!editingId || !editForm.name || !editForm.city || !editForm.county) return;
    const lat = parseFloat(editForm.lat);
    const lng = parseFloat(editForm.lng);
    const population = parseInt(editForm.population, 10);
    await updateVillageAction(editingId, {
      name: editForm.name,
      city: editForm.city,
      county: editForm.county,
      lat: isNaN(lat) ? undefined : lat,
      lng: isNaN(lng) ? undefined : lng,
      population: isNaN(population) ? undefined : population,
      description: editForm.description,
      needs: editNeeds,
    });
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✏️ 村庄「**${editForm.name}**」信息已更新。`,
      timestamp: Date.now(),
    });
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    await deleteVillageAction(id);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🗑️ 村庄「**${name}**」已删除。`,
      timestamp: Date.now(),
    });
    setDeleteConfirmId(null);
  }

  function handleApprove(id: string, name: string) {
    approveVillage(id);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✅ 村庄「**${name}**」已通过审核。`,
      timestamp: Date.now(),
    });
  }

  function handleReject(id: string, name: string) {
    rejectVillage(id);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `❌ 村庄「**${name}**」未通过审核。`,
      timestamp: Date.now(),
    });
  }

  function VillageCard({ village }: { village: Village }) {
    const isEditing = editingId === village.id;
    const isExpanded = expandedId === village.id;
    const isConfirming = deleteConfirmId === village.id;
    const isPending = village.status === 'pending';

    if (isEditing) {
      return (
        <div className="mgmt-card editing">
          <div className="form-group">
            <label>村庄名称 <span className="required">*</span></label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>城市 <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>县/区 <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.county}
                onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>人口</label>
              <input
                type="number"
                value={editForm.population}
                onChange={(e) => setEditForm({ ...editForm, population: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>纬度</label>
              <input
                type="text"
                value={editForm.lat}
                onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>经度</label>
              <input
                type="text"
                value={editForm.lng}
                onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>简介</label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div className="form-section">
            <h4>需求管理</h4>
            <div className="need-edit-entry">
              <div className="form-row-3">
                <div className="form-group">
                  <label>类别</label>
                  <select value={needCat} onChange={(e) => setNeedCat(e.target.value as NeedCategory)}>
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{NEED_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>紧急度</label>
                  <div className="urgency-toggles">
                    {(['high', 'medium', 'low'] as const).map((u) => (
                      <button
                        key={u} type="button"
                        className={`urgency-chip ${u} ${needUrgency === u ? 'active' : ''}`}
                        onClick={() => setNeedUrgency(u)}
                      >
                        {{ high: '高', medium: '中', low: '低' }[u]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>标题</label>
                  <input
                    type="text"
                    value={needTitle}
                    onChange={(e) => setNeedTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNeedItem(); } }}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>描述</label>
                  <input
                    type="text"
                    value={needDesc}
                    onChange={(e) => setNeedDesc(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNeedItem(); } }}
                  />
                </div>
                <button type="button" className="add-need-btn" onClick={addNeedItem}>
                  添加
                </button>
              </div>
            </div>
            {editNeeds.length > 0 && (
              <div className="need-list">
                {editNeeds.map((n, i) => (
                  <div key={n.id} className="need-chip-row">
                    <span className={`need-urgency-dot ${n.urgency}`} />
                    <span className="need-chip-cat">{NEED_CATEGORY_LABELS[n.category]}</span>
                    <span className="need-chip-title">{n.title}</span>
                    <button type="button" className="need-remove-btn" onClick={() => removeNeed(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mgmt-card-actions">
            <button className="save-btn" onClick={handleSave}>保存</button>
            <button className="cancel-btn" onClick={cancelEdit}>取消</button>
          </div>
        </div>
      );
    }

    if (isConfirming) {
      return (
        <div className="mgmt-card confirming">
          <p>确定要删除村庄「<strong>{village.name}</strong>」吗？相关需求和匹配记录也将一并删除，此操作不可撤销。</p>
          <div className="mgmt-card-actions">
            <button className="delete-confirm-btn" onClick={() => handleDelete(village.id, village.name)}>确认删除</button>
            <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>取消</button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`mgmt-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setExpandedId(isExpanded ? null : village.id)}
      >
        <div className="mgmt-card-header">
          <div className="mgmt-card-title">
            <div className="mgmt-card-name-row">
              <span className="mgmt-card-name">{village.name}</span>
              <span
                className="mgmt-status-badge"
                style={{
                  background: village.status === 'approved' ? '#c6f6d5' : village.status === 'pending' ? '#fefcbf' : '#fed7d7',
                  color: village.status === 'approved' ? '#276749' : village.status === 'pending' ? '#975a16' : '#9b2c2c',
                }}
              >
                {village.status === 'approved' ? '已通过' : village.status === 'pending' ? '待审核' : '已拒绝'}
              </span>
            </div>
            <span className="mgmt-card-loc">{village.province} {village.city} {village.county}</span>
          </div>
          <div className="mgmt-card-meta">
            <span className="meta-chip">{village.population}人</span>
            <span
              className="meta-chip"
              style={{ background: getHeatColor(village.visitCount), color: '#fff' }}
            >
              {getVisitLabel(village.visitCount)}
            </span>
            <span className="meta-chip">{village.needs.length}项需求</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mgmt-card-body">
            {village.description && <p className="mgmt-card-desc">{village.description}</p>}
            {village.needs.length > 0 && (
              <div className="mgmt-needs-list">
                {village.needs.map((n) => (
                  <div key={n.id} className="mgmt-need-item">
                    <span className={`need-urgency-dot ${n.urgency}`} />
                    <span className="need-chip-cat">{NEED_CATEGORY_LABELS[n.category]}</span>
                    <span className="need-chip-title">{n.title}</span>
                    <span className={`need-status-tag ${n.status}`}>
                      {n.status === 'pending' ? '待匹配' : n.status === 'matched' ? '已匹配' : '已完成'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mgmt-card-actions" onClick={(e) => e.stopPropagation()}>
          {isPending && (
            <>
              <button className="approve-btn" onClick={() => handleApprove(village.id, village.name)}>✅ 通过</button>
              <button className="reject-btn" onClick={() => handleReject(village.id, village.name)}>❌ 拒绝</button>
            </>
          )}
          <button className="edit-btn" onClick={() => startEdit(village)}>✏️ 编辑</button>
          <button className="view-map-btn" onClick={() => { selectVillage(village.id); setActiveModule('idle'); }}>🗺️ 地图</button>
          <button className="delete-btn" onClick={() => setDeleteConfirmId(village.id)}>🗑️ 删除</button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-panel manage-villages">
      <div className="module-header">
        <h2>🏘️ 村庄管理</h2>
        <p className="module-subtitle">管理乡村信息，审核登记申请</p>
      </div>

      <div className="mgmt-filter-tabs">
        {([
          { key: 'all' as const, label: '全部' },
          { key: 'pending' as const, label: '待审核' },
          { key: 'approved' as const, label: '已通过' },
          { key: 'rejected' as const, label: '已拒绝' },
        ]).map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => { setFilter(tab.key); setExpandedId(null); }}
          >
            {tab.label}
            <span className="tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="mgmt-actions-bar">
        <button className="create-link-btn" onClick={() => setActiveModule('create_village')}>
          + 登记新村庄
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="mgmt-empty">
          <div className="empty-icon">🏘️</div>
          <p>{filter === 'pending' ? '没有待审核的村庄' : filter === 'rejected' ? '没有被拒绝的村庄' : '暂无村庄数据'}</p>
        </div>
      ) : (
        <div className="mgmt-list">
          {filtered.map((v) => (
            <VillageCard key={v.id} village={v} />
          ))}
        </div>
      )}
    </div>
  );
}

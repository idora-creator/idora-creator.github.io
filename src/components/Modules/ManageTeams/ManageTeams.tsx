import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { NeedCategory, Team } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import './ManageTeams.css';

const ALL_CATEGORIES: NeedCategory[] = [
  'education', 'medical', 'agriculture', 'culture',
  'environment', 'elderly_care', 'infrastructure', 'digital',
];

export default function ManageTeams() {
  const teams = useAppStore((s) => s.teams);
  const updateTeamAction = useAppStore((s) => s.updateTeamAction);
  const deleteTeamAction = useAppStore((s) => s.deleteTeamAction);
  const addMessage = useAppStore((s) => s.addMessage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    university: '',
    memberCount: 8,
    description: '',
  });
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [editCats, setEditCats] = useState<NeedCategory[]>([]);

  function startEdit(t: Team) {
    setEditingId(t.id);
    setEditForm({
      name: t.name,
      university: t.university,
      memberCount: t.memberCount,
      description: t.description,
    });
    setEditSkills([...t.skills]);
    setEditCats([...t.preferredCategories]);
    setSkillInput('');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !editSkills.includes(s)) {
      setEditSkills([...editSkills, s]);
      setSkillInput('');
    }
  }

  function removeSkill(s: string) {
    setEditSkills(editSkills.filter((x) => x !== s));
  }

  function toggleCat(cat: NeedCategory) {
    setEditCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave() {
    if (!editingId || !editForm.name || !editForm.university) return;
    await updateTeamAction(editingId, {
      name: editForm.name,
      university: editForm.university,
      memberCount: editForm.memberCount,
      skills: editSkills,
      preferredCategories: editCats,
      description: editForm.description,
    });
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✏️ 队伍「**${editForm.name}**」信息已更新。`,
      timestamp: Date.now(),
    });
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    await deleteTeamAction(id);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🗑️ 队伍「**${name}**」已删除。`,
      timestamp: Date.now(),
    });
    setDeleteConfirmId(null);
  }

  function TeamCard({ team }: { team: Team }) {
    const isEditing = editingId === team.id;
    const isExpanded = expandedId === team.id;
    const isConfirming = deleteConfirmId === team.id;

    if (isEditing) {
      return (
        <div className="mgmt-card editing">
          <div className="form-group">
            <label>队伍名称 <span className="required">*</span></label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>所属院校 <span className="required">*</span></label>
            <input
              type="text"
              value={editForm.university}
              onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>成员人数: <strong>{editForm.memberCount}人</strong></label>
            <input
              type="range"
              min={3} max={30}
              value={editForm.memberCount}
              onChange={(e) => setEditForm({ ...editForm, memberCount: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>队伍简介</label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>技能标签</label>
            <div className="skill-input-row">
              <input
                type="text"
                placeholder="输入技能后点添加"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button type="button" className="add-skill-btn" onClick={addSkill}>+</button>
            </div>
            {editSkills.length > 0 && (
              <div className="skill-tags-display">
                {editSkills.map((s) => (
                  <span key={s} className="skill-tag-removable" onClick={() => removeSkill(s)}>
                    {s} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>偏好服务领域</label>
            <div className="category-grid">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat} type="button"
                  className={`category-chip ${editCats.includes(cat) ? 'active' : ''}`}
                  onClick={() => toggleCat(cat)}
                >
                  {NEED_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
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
          <p>确定要删除队伍「<strong>{team.name}</strong>」吗？此操作不可撤销。</p>
          <div className="mgmt-card-actions">
            <button className="delete-confirm-btn" onClick={() => handleDelete(team.id, team.name)}>确认删除</button>
            <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>取消</button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`mgmt-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setExpandedId(isExpanded ? null : team.id)}
      >
        <div className="mgmt-card-header">
          <div className="mgmt-card-title">
            <span className="mgmt-card-name">{team.name}</span>
            <span className="mgmt-card-uni">{team.university}</span>
          </div>
          <div className="mgmt-card-meta">
            <span className="meta-chip">{team.memberCount}人</span>
            <span className="meta-chip">完成{team.completedCount}次</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mgmt-card-body">
            {team.description && <p className="mgmt-card-desc">{team.description}</p>}
            {team.skills.length > 0 && (
              <div className="mgmt-tags">
                {team.skills.map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            )}
            {team.preferredCategories.length > 0 && (
              <div className="mgmt-tags">
                {team.preferredCategories.map((c) => (
                  <span key={c} className="pref-tag">{NEED_CATEGORY_LABELS[c]}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mgmt-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="edit-btn" onClick={() => startEdit(team)}>✏️ 编辑</button>
          <button className="delete-btn" onClick={() => setDeleteConfirmId(team.id)}>🗑️ 删除</button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-panel manage-teams">
      <div className="module-header">
        <h2>👥 队伍管理</h2>
        <p className="module-subtitle">查看、编辑或删除已注册的实践队伍 ({teams.length}支)</p>
      </div>

      <div className="mgmt-actions-bar">
        <button className="create-link-btn" onClick={() => setActiveModule('create_team')}>
          + 创建新队伍
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="mgmt-empty">
          <div className="empty-icon">👥</div>
          <p>暂无注册队伍</p>
          <button onClick={() => setActiveModule('create_team')}>去创建</button>
        </div>
      ) : (
        <div className="mgmt-list">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

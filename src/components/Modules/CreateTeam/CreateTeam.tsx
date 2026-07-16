import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { NeedCategory, Team } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import './CreateTeam.css';

const ALL_CATEGORIES: NeedCategory[] = [
  'education', 'medical', 'agriculture', 'culture',
  'environment', 'elderly_care', 'infrastructure', 'digital',
];

export default function CreateTeam() {
  const addMessage = useAppStore((s) => s.addMessage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const [form, setForm] = useState({
    name: '',
    university: '',
    memberCount: 8,
    description: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [selectedCats, setSelectedCats] = useState<NeedCategory[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills([...selectedSkills, s]);
      setSkillInput('');
    }
  }

  function removeSkill(s: string) {
    setSelectedSkills(selectedSkills.filter((x) => x !== s));
  }

  function toggleCat(cat: NeedCategory) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.university || selectedCats.length === 0) return;

    const store = useAppStore.getState();
    const newTeam: Team = {
      id: `t_custom_${Date.now()}`,
      name: form.name,
      university: form.university,
      memberCount: form.memberCount,
      skills: selectedSkills,
      preferredCategories: selectedCats,
      description: form.description || `${form.university} ${form.name}`,
      completedCount: 0,
    };

    store.addTeam(newTeam);

    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🎉 队伍「**${newTeam.name}**」创建成功！\n\n- 所属院校：${newTeam.university}\n- 成员人数：${newTeam.memberCount}人\n- 技能标签：${selectedSkills.join('、') || '暂无'}\n- 偏好领域：${selectedCats.map((c) => NEED_CATEGORY_LABELS[c]).join('、')}\n\n现在可以前往**智能匹配**模块，为这支队伍寻找最合适的实践乡村！`,
      timestamp: Date.now(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', university: '', memberCount: 8, description: '' });
      setSelectedSkills([]);
      setSkillInput('');
      setSelectedCats([]);
      setActiveModule('idle');
    }, 2000);
  }

  if (submitted) {
    return (
      <div className="module-panel create-team">
        <div className="submit-success">
          <div className="success-icon">🎉</div>
          <h3>队伍创建成功！</h3>
          <p>可在智能匹配中为队伍匹配合适的乡村</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-panel create-team">
      <div className="module-header">
        <h2>👥 创建实践队伍</h2>
        <p className="module-subtitle">注册新的大学生社会实践团队，参与乡村服务匹配</p>
      </div>

      <form className="team-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>队伍名称 <span className="required">*</span></label>
          <input
            type="text"
            placeholder="例如：粤北支农先锋队"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>所属院校 <span className="required">*</span></label>
          <input
            type="text"
            placeholder="例如：中山大学"
            value={form.university}
            onChange={(e) => setForm({ ...form, university: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>成员人数: <strong>{form.memberCount}人</strong></label>
            <input
              type="range"
              min={3}
              max={30}
              value={form.memberCount}
              onChange={(e) => setForm({ ...form, memberCount: Number(e.target.value) })}
              className="days-slider"
            />
            <div className="slider-labels">
              <span>3人</span><span>15人</span><span>30人</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>队伍简介</label>
          <textarea
            rows={3}
            placeholder="描述队伍的专业背景、实践经验和主要方向..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>技能标签</label>
          <div className="skill-input-row">
            <input
              type="text"
              placeholder="输入技能后点添加（如：支教、义诊）"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" className="add-skill-btn" onClick={addSkill}>+</button>
          </div>
          {selectedSkills.length > 0 && (
            <div className="skill-tags-display">
              {selectedSkills.map((s) => (
                <span key={s} className="skill-tag-removable" onClick={() => removeSkill(s)}>
                  {s} ✕
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>偏好服务领域 <span className="required">*</span></label>
          <div className="category-grid">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCats.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCat(cat)}
              >
                {NEED_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          创建队伍
        </button>
      </form>
    </div>
  );
}

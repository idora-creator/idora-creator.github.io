import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { VillageNeed, NeedCategory } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import './NeedsReport.css';

const CATEGORIES: NeedCategory[] = [
  'education', 'medical', 'agriculture', 'culture',
  'environment', 'elderly_care', 'infrastructure', 'digital',
];

export default function NeedsReport() {
  const villages = useAppStore((s) => s.villages.filter((v) => v.status === 'approved'));
  const addNeed = useAppStore((s) => s.addNeed);
  const addMessage = useAppStore((s) => s.addMessage);

  const [form, setForm] = useState({
    villageId: '',
    category: '' as NeedCategory | '',
    title: '',
    description: '',
    urgency: 'medium' as 'high' | 'medium' | 'low',
    reporter: '',
    contact: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedVillage = villages.find((v) => v.id === form.villageId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.villageId || !form.category || !form.title || !form.description) return;

    const newNeed: VillageNeed = {
      id: `n_${Date.now()}`,
      category: form.category as NeedCategory,
      title: form.title,
      description: form.description,
      urgency: form.urgency,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addNeed(form.villageId, newNeed);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✅ 需求「${form.title}」已成功上报至 **${selectedVillage?.name}**！\n\n系统已将该需求纳入智能匹配队列，当有合适的实践团队时，将自动为您推送匹配通知。您也可以在"智能匹配"模块中主动查找匹配团队。`,
      timestamp: Date.now(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ villageId: '', category: '', title: '', description: '', urgency: 'medium', reporter: '', contact: '' });
    }, 2500);
  }

  if (submitted) {
    return (
      <div className="module-panel needs-report">
        <div className="submit-success">
          <div className="success-icon">✅</div>
          <h3>需求上报成功！</h3>
          <p>您的需求已进入系统匹配队列</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-panel needs-report">
      <div className="module-header">
        <h2>📋 乡村基层需求上报</h2>
        <p className="module-subtitle">提交未被满足的乡村真实需求，引导实践资源精准投放</p>
      </div>

      <form className="needs-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>目标乡村 <span className="required">*</span></label>
          <select
            value={form.villageId}
            onChange={(e) => setForm({ ...form, villageId: e.target.value })}
            required
          >
            <option value="">请选择乡村</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.province} {v.city}
                {v.visitCount === 0 ? ' [实践空白]' : ` [${v.visitCount}次到访]`}
              </option>
            ))}
          </select>
        </div>

        {selectedVillage && selectedVillage.needs.length > 0 && (
          <div className="existing-needs">
            <div className="existing-title">该村现有需求 ({selectedVillage.needs.length})：</div>
            {selectedVillage.needs.map((n) => (
              <div key={n.id} className={`existing-need-tag ${n.status}`}>
                [{NEED_CATEGORY_LABELS[n.category]}] {n.title}
                <span className={`status-tag ${n.status}`}>
                  {n.status === 'pending' ? '待匹配' : n.status === 'matched' ? '已匹配' : '已完成'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>需求类别 <span className="required">*</span></label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${form.category === cat ? 'active' : ''}`}
                onClick={() => setForm({ ...form, category: cat })}
              >
                {NEED_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>需求标题 <span className="required">*</span></label>
          <input
            type="text"
            placeholder="例如：村小学急需英语支教教师"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>详细描述 <span className="required">*</span></label>
          <textarea
            rows={4}
            placeholder="请详细描述需求背景、现状和期望得到的帮助..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>紧急程度</label>
            <div className="urgency-group">
              {(['high', 'medium', 'low'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`urgency-chip ${level} ${form.urgency === level ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, urgency: level })}
                >
                  {level === 'high' ? '🔴 紧急' : level === 'medium' ? '🟡 一般' : '🟢 不急'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>上报人姓名</label>
            <input
              type="text"
              placeholder="选填"
              value={form.reporter}
              onChange={(e) => setForm({ ...form, reporter: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>联系方式</label>
            <input
              type="text"
              placeholder="手机号 / 微信（选填）"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          提交需求 → 进入智能匹配
        </button>
      </form>
    </div>
  );
}

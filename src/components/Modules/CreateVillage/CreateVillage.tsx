import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { Village, NeedCategory } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import './CreateVillage.css';

const ALL_CATEGORIES: NeedCategory[] = [
  'education', 'medical', 'agriculture', 'culture',
  'environment', 'elderly_care', 'infrastructure', 'digital',
];

export default function CreateVillage() {
  const addVillage = useAppStore((s) => s.addVillage);
  const addMessage = useAppStore((s) => s.addMessage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const [form, setForm] = useState({
    name: '',
    province: '广东省',
    city: '',
    county: '',
    lat: '',
    lng: '',
    population: '',
    description: '',
    contactName: '',
    contactPhone: '',
  });
  const [needTitle, setNeedTitle] = useState('');
  const [needDesc, setNeedDesc] = useState('');
  const [needCat, setNeedCat] = useState<NeedCategory>('education');
  const [needUrgency, setNeedUrgency] = useState<'high' | 'medium' | 'low'>('medium');
  const [needs, setNeeds] = useState<{ category: NeedCategory; title: string; description: string; urgency: 'high' | 'medium' | 'low' }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function addNeedItem() {
    const t = needTitle.trim();
    if (!t) return;
    setNeeds([...needs, { category: needCat, title: t, description: needDesc.trim(), urgency: needUrgency }]);
    setNeedTitle('');
    setNeedDesc('');
    setNeedCat('education');
    setNeedUrgency('medium');
  }

  function removeNeed(i: number) {
    setNeeds(needs.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    const population = parseInt(form.population, 10);
    if (!form.name || !form.city || !form.county || isNaN(lat) || isNaN(lng)) return;

    const now = new Date().toISOString().slice(0, 10);
    const newVillage: Village = {
      id: `v_custom_${Date.now()}`,
      name: form.name,
      province: form.province,
      city: form.city,
      county: form.county,
      lat,
      lng,
      visitCount: 0,
      population: isNaN(population) ? 0 : population,
      description: form.description || `${form.city}${form.county} ${form.name}`,
      needs: needs.map((n, i) => ({
        id: `n_custom_${Date.now()}_${i}`,
        category: n.category,
        title: n.title,
        description: n.description,
        urgency: n.urgency,
        status: 'pending' as const,
        createdAt: now,
      })),
      matchedTeamIds: [],
      status: 'pending' as const,
      createdAt: now,
    };

    addVillage(newVillage);

    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `📍 村庄「**${newVillage.name}**」已提交，等待审核。\n\n- 位置：${newVillage.province} ${newVillage.city} ${newVillage.county}\n- 人口：${newVillage.population}人\n- 提交需求：${newVillage.needs.length}项\n${form.contactName ? `- 联系人：${form.contactName} (${form.contactPhone || '未填写'})\n` : ''}\n管理员审核通过后，该村庄将出现在地图上。`,
      timestamp: Date.now(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', province: '广东省', city: '', county: '', lat: '', lng: '', population: '', description: '', contactName: '', contactPhone: '' });
      setNeeds([]);
      setActiveModule('idle');
    }, 2500);
  }

  if (submitted) {
    return (
      <div className="module-panel create-village">
        <div className="submit-success">
          <div className="success-icon">⏳</div>
          <h3>村庄信息已提交</h3>
          <p>管理员审核通过后将展现在地图上</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-panel create-village">
      <div className="module-header">
        <h2>🏘️ 登记新村庄</h2>
        <p className="module-subtitle">提交未覆盖的村庄信息，审核通过后将纳入实践地图</p>
      </div>

      <form className="village-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>村庄名称 <span className="required">*</span></label>
          <input
            type="text"
            placeholder="例如：榕树村"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>省份 <span className="required">*</span></label>
            <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>城市 <span className="required">*</span></label>
            <input type="text" placeholder="例如：梅州市" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>县/区 <span className="required">*</span></label>
            <input type="text" placeholder="例如：大埔县" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} required />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>纬度 <span className="required">*</span></label>
            <input type="text" placeholder="例如：23.35" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>经度 <span className="required">*</span></label>
            <input type="text" placeholder="例如：113.50" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>人口</label>
            <input type="number" placeholder="例如：1500" value={form.population} onChange={(e) => setForm({ ...form, population: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>村庄简介</label>
          <textarea
            rows={3}
            placeholder="描述村庄的基本情况、产业特色、主要困难..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="form-section">
          <h4>需求申报</h4>
          <p className="form-hint">填写村庄最迫切需要解决的各类需求（可添加多条）</p>

          <div className="need-entry">
            <div className="form-row-3">
              <div className="form-group">
                <label>需求类别</label>
                <select value={needCat} onChange={(e) => setNeedCat(e.target.value as NeedCategory)}>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{NEED_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>紧急程度</label>
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
                <label>需求标题</label>
                <input
                  type="text"
                  placeholder="例如：留守儿童课后辅导"
                  value={needTitle}
                  onChange={(e) => setNeedTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNeedItem(); } }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>需求描述</label>
                <input
                  type="text"
                  placeholder="简要描述具体需要什么帮助..."
                  value={needDesc}
                  onChange={(e) => setNeedDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNeedItem(); } }}
                />
              </div>
              <button type="button" className="add-need-btn" onClick={addNeedItem}>
                添加需求
              </button>
            </div>
          </div>

          {needs.length > 0 && (
            <div className="need-list">
              {needs.map((n, i) => (
                <div key={i} className="need-chip-row">
                  <span className={`need-urgency-dot ${n.urgency}`} />
                  <span className="need-chip-cat">{NEED_CATEGORY_LABELS[n.category]}</span>
                  <span className="need-chip-title">{n.title}</span>
                  {n.description && <span className="need-chip-desc">{n.description}</span>}
                  <button type="button" className="need-remove-btn" onClick={() => removeNeed(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h4>联系人信息（选填，用于审核沟通）</h4>
          <div className="form-row-2">
            <div className="form-group">
              <label>联系人姓名</label>
              <input type="text" placeholder="村委或申报人姓名" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>联系电话</label>
              <input type="text" placeholder="手机号码" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          提交审核
        </button>
      </form>
    </div>
  );
}

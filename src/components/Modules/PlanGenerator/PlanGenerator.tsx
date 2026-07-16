import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { PracticePlan } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import { getHeatColor, getVisitLabel } from '../../../data/mockData';
import { generatePlanWithAI } from '../../../lib/chatService';
import './PlanGenerator.css';

export default function PlanGenerator() {
  const villages = useAppStore((s) => s.villages.filter((v) => v.status === 'approved'));
  const teams = useAppStore((s) => s.teams);
  const addMessage = useAppStore((s) => s.addMessage);

  const [villageId, setVillageId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [days, setDays] = useState(5);
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedVillage = villages.find((v) => v.id === villageId);
  const selectedTeam = teams.find((t) => t.id === teamId);

  async function handleGenerate() {
    if (!villageId || !teamId || !selectedVillage || !selectedTeam) return;
    setGenerating(true);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🤖 正在为**${selectedTeam.name}**生成赴**${selectedVillage.name}**的${days}天实践方案，请稍候...`,
      timestamp: Date.now(),
    });

    const result = await generatePlanWithAI(selectedVillage, selectedTeam, days);
    setGenerating(false);
    setPlan(result);
    setGenerated(true);

    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `✅ 方案生成完毕！\n\n📝 **${result.title}**\n- 🎯 ${result.objectives.length}项实践目标\n- 📅 ${result.activities.length}天详细日程\n- 💰 ¥${result.budget.total.toLocaleString()} 经费预算\n- 📊 ${result.schedule.length}阶段规划\n\n下方查看完整方案，可按需打印导出。`,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="module-panel plan-generator">
      <div className="module-header">
        <h2>📝 社会实践方案辅助生成</h2>
        <p className="module-subtitle">DeepSeek AI 驱动，基于乡村真实需求与团队特点智能生成</p>
      </div>

      <div className="plan-input-section">
        <div className="form-group">
          <label>目标乡村</label>
          <select value={villageId} onChange={(e) => { setVillageId(e.target.value); setGenerated(false); }}>
            <option value="">请选择乡村</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.province} {v.city}
                {v.visitCount === 0 ? ' ★实践空白' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedVillage && (
          <div className="village-context">
            <span className="context-badge" style={{ background: getHeatColor(selectedVillage.visitCount) }}>
              {getVisitLabel(selectedVillage.visitCount)}
            </span>
            <span>{selectedVillage.description}</span>
            <div className="context-needs">
              {selectedVillage.needs.filter((n) => n.status === 'pending').map((n) => (
                <span key={n.id} className={`context-need-tag ${n.urgency}`}>
                  {NEED_CATEGORY_LABELS[n.category]}: {n.title}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>实践团队</label>
          <select value={teamId} onChange={(e) => { setTeamId(e.target.value); setGenerated(false); }}>
            <option value="">请选择团队</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name} — {t.university}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>实践天数: <strong>{days}天</strong></label>
            <input
              type="range" min={3} max={14} value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="days-slider"
            />
            <div className="slider-labels"><span>3天</span><span>7天</span><span>14天</span></div>
          </div>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={!villageId || !teamId || generating}
        >
          {generating ? '⏳ AI 正在生成方案...' : '🤖 AI 智能生成实践方案'}
        </button>
      </div>

      {generated && plan && (
        <div className="plan-result">
          <div className="plan-actions">
            <span className="ai-badge">🤖 DeepSeek 生成</span>
            <button className="export-btn" onClick={() => window.print()}>🖨️ 打印/导出方案</button>
          </div>

          <div className="plan-document">
            <h1 className="plan-title">{plan.title}</h1>
            <div className="plan-meta">
              <span>📍 {plan.villageName}</span>
              <span>⏱️ {plan.duration}</span>
              <span>💰 预算: ¥{plan.budget.total.toLocaleString()}</span>
            </div>

            <section className="plan-section">
              <h3>🎯 实践目标</h3>
              <ol>
                {plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ol>
            </section>

            <section className="plan-section">
              <h3>📅 日程安排</h3>
              <div className="activity-table">
                <div className="activity-header">
                  <span>日期</span><span>上午</span><span>下午</span><span>晚间</span>
                </div>
                {plan.activities.map((a) => (
                  <div key={a.day} className="activity-row">
                    <span className="day-badge">第{a.day}天</span>
                    <span>{a.morning}</span>
                    <span>{a.afternoon}</span>
                    <span>{a.evening}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="plan-section">
              <h3>💰 经费预算</h3>
              <table className="budget-table">
                <thead><tr><th>项目</th><th>金额</th></tr></thead>
                <tbody>
                  {plan.budget.items.map((item, i) => (
                    <tr key={i}><td>{item.name}</td><td>¥{item.amount.toLocaleString()}</td></tr>
                  ))}
                  <tr className="total-row"><td><strong>合计</strong></td><td><strong>¥{plan.budget.total.toLocaleString()}</strong></td></tr>
                </tbody>
              </table>
            </section>

            <section className="plan-section">
              <h3>📊 阶段规划</h3>
              {plan.schedule.map((s, i) => (
                <div key={i} className="schedule-phase">
                  <div className="phase-header">
                    <span className="phase-name">{s.phase}</span>
                    <span className="phase-time">{s.days}</span>
                  </div>
                  <ul>{s.tasks.map((t, j) => <li key={j}>{t}</li>)}</ul>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { MatchResult } from '../../../types';
import { NEED_CATEGORY_LABELS } from '../../../types';
import { getHeatColor, getVisitLabel } from '../../../data/mockData';
import './MatchMaker.css';

// 智能匹配算法
function computeMatch(teamId: string, villageId: string): MatchResult | null {
  const store = useAppStore.getState();
  const team = store.teams.find((t) => t.id === teamId);
  const village = store.villages.find((v) => v.id === villageId);
  if (!team || !village) return null;

  const reasons: string[] = [];
  let score = 0;

  // 1. 需求类别与团队偏好匹配 (核心权重, 50分)
  const pendingCategories = new Set(village.needs.filter((n) => n.status === 'pending').map((n) => n.category));
  const matchedCategories = team.preferredCategories.filter((c) => pendingCategories.has(c));
  const categoryScore = pendingCategories.size > 0
    ? (matchedCategories.length / pendingCategories.size) * 50
    : 25; // 无待解决需求时给基础分

  score += categoryScore;
  if (matchedCategories.length > 0) {
    reasons.push(`团队偏好类别与${matchedCategories.length}项乡村需求匹配：${matchedCategories.map((c) => NEED_CATEGORY_LABELS[c]).join('、')}`);
  }

  // 2. 实践缺口加权 (鼓励去低频区域, 30分)
  const gapScore = village.visitCount === 0 ? 30
    : village.visitCount <= 3 ? 24
    : village.visitCount <= 7 ? 18
    : village.visitCount <= 14 ? 10
    : 2;
  score += gapScore;
  if (village.visitCount === 0) {
    reasons.push('该村为"实践空白"区域，前往可产生更大社会影响力');
  } else if (village.visitCount <= 7) {
    reasons.push(`该村访问频次低(${village.visitCount}次)，实践资源仍有较大缺口`);
  } else if (village.visitCount >= 15) {
    reasons.push(`⚠️ 该村为高频到访区域(${village.visitCount}次)，建议考虑其他更需要帮助的乡村`);
  }

  // 3. 需求紧急度加权 (20分)
  const highUrgencyCount = village.needs.filter((n) => n.status === 'pending' && n.urgency === 'high').length;
  const urgencyScore = Math.min(20, highUrgencyCount * 8 + village.needs.filter((n) => n.status === 'pending' && n.urgency === 'medium').length * 3);
  score += urgencyScore;
  if (highUrgencyCount > 0) {
    reasons.push(`该村有${highUrgencyCount}项高紧急度需求亟待解决`);
  }

  return {
    teamId: team.id,
    villageId: village.id,
    score: Math.round(score),
    reasons,
    teamName: team.name,
    villageName: village.name,
  };
}

export default function MatchMaker() {
  const teams = useAppStore((s) => s.teams);
  const villages = useAppStore((s) => s.villages.filter((v) => v.status === 'approved'));
  const selectVillage = useAppStore((s) => s.selectVillage);
  const addMessage = useAppStore((s) => s.addMessage);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [strategy, setStrategy] = useState<'balanced' | 'gap_first' | 'need_first'>('gap_first');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  function handleMatch() {
    if (!selectedTeamId) return;

    const allResults = villages
      .map((v) => computeMatch(selectedTeamId, v.id))
      .filter((r): r is MatchResult => r !== null)
      .sort((a, b) => {
        if (strategy === 'gap_first') {
          const aV = villages.find((v) => v.id === a.villageId)!;
          const bV = villages.find((v) => v.id === b.villageId)!;
          const gapDiff = aV.visitCount - bV.visitCount;
          if (Math.abs(gapDiff) > 3) return gapDiff;
        }
        if (strategy === 'need_first') {
          const aV = villages.find((v) => v.id === a.villageId)!;
          const bV = villages.find((v) => v.id === b.villageId)!;
          const aUrgent = aV.needs.filter((n) => n.status === 'pending' && n.urgency === 'high').length;
          const bUrgent = bV.needs.filter((n) => n.status === 'pending' && n.urgency === 'high').length;
          if (aUrgent !== bUrgent) return bUrgent - aUrgent;
        }
        return b.score - a.score;
      });

    setResults(allResults);
    setHasSearched(true);

    const top3 = allResults.slice(0, 3);
    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: `🔍 已为**${selectedTeam?.name}**完成智能匹配！\n\n共扫描 ${villages.length} 个乡村，推荐结果按${strategy === 'gap_first' ? '"实践缺口优先"' : strategy === 'need_first' ? '"需求紧急度优先"' : '"综合匹配"'}策略排序。\n\n🏆 **Top 3 推荐：**\n${top3.map((r, i) => `${i + 1}. **${r.villageName}** — 匹配度 ${r.score}分`).join('\n')}\n\n请在结果面板中查看详细信息。`,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="module-panel match-maker">
      <div className="module-header">
        <h2>🎯 实践队伍与乡村智能匹配</h2>
        <p className="module-subtitle">基于需求契合度、实践缺口与紧急程度的多维匹配引擎</p>
      </div>

      <div className="match-input-section">
        <div className="form-group">
          <label>选择实践队伍</label>
          <select
            value={selectedTeamId}
            onChange={(e) => { setSelectedTeamId(e.target.value); setHasSearched(false); setResults([]); }}
          >
            <option value="">请选择队伍</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.university}) — {t.memberCount}人
              </option>
            ))}
          </select>
        </div>

        {selectedTeam && (
          <div className="team-preview">
            <div className="team-preview-header">
              <span className="team-name">{selectedTeam.name}</span>
              <span className="team-uni">{selectedTeam.university}</span>
            </div>
            <p className="team-desc">{selectedTeam.description}</p>
            <div className="team-tags">
              {selectedTeam.skills.map((s) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
              {selectedTeam.preferredCategories.map((c) => (
                <span key={c} className="pref-tag">{NEED_CATEGORY_LABELS[c]}</span>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>匹配策略</label>
          <div className="strategy-group">
            {([
              { key: 'gap_first', label: '🧭 实践缺口优先', desc: '优先推荐访问频次低的乡村' },
              { key: 'need_first', label: '🚨 需求紧急度优先', desc: '优先推荐高紧急度需求的乡村' },
              { key: 'balanced', label: '⚖️ 综合匹配', desc: '综合评分，兼顾多方因素' },
            ] as const).map((s) => (
              <button
                key={s.key}
                type="button"
                className={`strategy-chip ${strategy === s.key ? 'active' : ''}`}
                onClick={() => setStrategy(s.key)}
              >
                <span className="strategy-label">{s.label}</span>
                <span className="strategy-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="match-btn"
          onClick={handleMatch}
          disabled={!selectedTeamId}
        >
          🔍 开始智能匹配
        </button>
      </div>

      {hasSearched && (
        <div className="match-results">
          <h3>
            匹配结果 ({results.length} 个乡村)
            {strategy === 'gap_first' && ' — 按实践缺口排序'}
            {strategy === 'need_first' && ' — 按需求紧急度排序'}
            {strategy === 'balanced' && ' — 按综合评分排序'}
          </h3>

          {results.length === 0 ? (
            <div className="no-results">未找到匹配的乡村</div>
          ) : (
            <div className="result-list">
              {results.map((r, idx) => {
                const village = villages.find((v) => v.id === r.villageId)!;
                return (
                  <div
                    key={r.villageId}
                    className={`result-card ${idx < 3 ? 'top-recommend' : ''}`}
                    onClick={() => selectVillage(r.villageId)}
                  >
                    <div className="result-rank">
                      {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                    </div>
                    <div className="result-body">
                      <div className="result-header">
                        <span className="result-village">{r.villageName}</span>
                        <span
                          className="result-badge"
                          style={{ background: getHeatColor(village.visitCount) }}
                        >
                          {getVisitLabel(village.visitCount)}
                        </span>
                        <span className="result-score">{r.score}分</span>
                      </div>
                      <div className="result-location">
                        {village.province} {village.city} · 人口{village.population}人
                      </div>
                      <div className="result-reasons">
                        {r.reasons.map((reason, i) => (
                          <div key={i} className="reason-item">
                            {reason.startsWith('⚠️') ? '⚠️ ' : '✓ '}
                            {reason}
                          </div>
                        ))}
                      </div>
                      <div className="result-needs">
                        {village.needs.filter((n) => n.status === 'pending').map((n) => (
                          <span key={n.id} className={`need-chip ${n.urgency}`}>
                            {NEED_CATEGORY_LABELS[n.category]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { AgentMessage } from '../../types';
import { chatWithAI } from '../../lib/chatService';
import './AgentPanel.css';

export default function AgentPanel() {
  const messages = useAppStore((s) => s.messages);
  const agentTyping = useAppStore((s) => s.agentTyping);
  const addMessage = useAppStore((s) => s.addMessage);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const setAgentTyping = useAppStore((s) => s.setAgentTyping);
  const villages = useAppStore((s) => s.villages);
  const teams = useAppStore((s) => s.teams);

  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: AgentMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');

    // 关键词快速切换到对应模块
    const lower = text.toLowerCase();
    if (lower.includes('匹配') || lower.includes('推荐')) setActiveModule('match');
    if (lower.includes('需求') || lower.includes('上报')) setActiveModule('needs_report');
    if (lower.includes('方案') || lower.includes('计划')) setActiveModule('plan');
    if (lower.includes('地图') || lower.includes('总览')) setActiveModule('idle');

    // 调用 DeepSeek AI
    setAgentTyping(true);
    const reply = await chatWithAI(text, villages, teams);
    setAgentTyping(false);

    addMessage({
      id: `msg_${Date.now()}`,
      role: 'agent',
      content: reply,
      timestamp: Date.now(),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderMessage(msg: AgentMessage) {
    const isAgent = msg.role === 'agent';
    return (
      <div key={msg.id} className={`message ${isAgent ? 'agent' : 'user'}`}>
        {isAgent && <div className="msg-avatar">🤖</div>}
        <div className="msg-bubble">
          <div className="msg-content" dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br/>')
          }} />
          <div className="msg-time">
            {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {!isAgent && <div className="msg-avatar user-avatar">👤</div>}
      </div>
    );
  }

  return (
    <div className="agent-panel">
      <div className="agent-header">
        <span className="agent-header-icon">🤖</span>
        <div>
          <h3>DeepSeek 智能体</h3>
          <p>AI驱动 · 乡村实践智能咨询</p>
        </div>
      </div>

      <div className="agent-messages">
        {messages.map(renderMessage)}
        {agentTyping && (
          <div className="message agent">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="agent-input-area">
        <div className="quick-actions">
          {['推荐乡村', '上报需求', '生成方案', '创建队伍', '登记村庄'].map((action) => (
            <button
              key={action}
              className="quick-chip"
              onClick={() => {
                setInput(action);
                inputRef.current?.focus();
              }}
            >
              {action}
            </button>
          ))}
        </div>
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder="输入消息，DeepSeek 为您服务..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

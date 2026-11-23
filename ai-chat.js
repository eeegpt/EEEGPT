(function () {
  if (window.__eeegptAiLoaded) return;
  window.__eeegptAiLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .ai-fab-btn {
      position: fixed;
      right: 16px;
      bottom: 82px;
      z-index: 950;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 16px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #06449e, #0d6efd);
      color: #ffffff;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 8px 22px rgba(6, 68, 158, 0.38);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .ai-fab-btn:active { transform: scale(0.95); }
    .ai-fab-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #4fd18b;
      box-shadow: 0 0 8px #4fd18b;
    }
    .ai-chat-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(3px);
      display: none;
      align-items: flex-end;
      justify-content: center;
    }
    .ai-chat-backdrop.open { display: flex; }
    .ai-chat-sheet {
      width: 100%;
      max-width: 520px;
      height: 82vh;
      max-height: 680px;
      background: #f8fafc;
      border-radius: 20px 20px 0 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.25);
    }
    .ai-chat-head {
      background: linear-gradient(135deg, #06449e, #0b5ed7);
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .ai-chat-head h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
    }
    .ai-chat-head small {
      display: block;
      font-size: 11px;
      opacity: 0.88;
      margin-top: 2px;
    }
    .ai-head-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ai-icon-btn {
      background: rgba(255, 255, 255, 0.16);
      border: none;
      color: #ffffff;
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .ai-chat-msgs {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ai-msg {
      max-width: 86%;
      padding: 10px 13px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.55;
      word-wrap: break-word;
    }
    .ai-msg.user {
      align-self: flex-end;
      background: #06449e;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .ai-msg.bot {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .ai-msg.bot code {
      background: #f1f5f9;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12px;
    }
    .ai-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 14px 10px;
    }
    .ai-chip {
      background: #e0ecff;
      color: #06449e;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      padding: 6px 11px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
    }
    .ai-chat-form {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
    }
    .ai-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 13.5px;
      font-family: inherit;
      outline: none;
      background: #f8fafc;
      color: #0f172a;
    }
    .ai-chat-input:focus { border-color: #06449e; background: #ffffff; }
    .ai-send-btn {
      background: #06449e;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .ai-send-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    @media print {
      .ai-fab-btn, .ai-chat-backdrop { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'ai-fab-btn';
  fab.innerHTML = '<span class="ai-fab-dot"></span><span>Ask EEEGPT AI</span>';

  const backdrop = document.createElement('div');
  backdrop.className = 'ai-chat-backdrop';
  backdrop.innerHTML = `
    <div class="ai-chat-sheet" role="dialog" aria-label="EEEGPT AI Assistant">
      <div class="ai-chat-head">
        <div>
          <h3>🤖 EEEGPT AI Assistant</h3>
          <small>BNBC 2020 • RSC • NFPA • IEC (বাংলা / English)</small>
        </div>
        <div class="ai-head-actions">
          <button type="button" class="ai-icon-btn" id="aiClearBtn">Clear</button>
          <button type="button" class="ai-icon-btn" id="aiCloseBtn">✕</button>
        </div>
      </div>
      <div class="ai-chat-msgs" id="aiChatMsgs"></div>
      <div class="ai-chips" id="aiQuickChips">
        <button type="button" class="ai-chip">১৫ kW মোটরের কেবল ও ব্রেকার সাইজ কত?</button>
        <button type="button" class="ai-chip">BNBC অনুযায়ী আর্থিং রেজিস্ট্যান্স কত?</button>
        <button type="button" class="ai-chip">RSC অডিটে প্যানেল সেফটির মেইন পয়েন্ট কী?</button>
      </div>
      <form class="ai-chat-form" id="aiChatForm">
        <input class="ai-chat-input" id="aiChatInput" type="text" placeholder="BNBC, RSC বা ইলেকট্রিক্যাল প্রশ্ন লিখুন..." autocomplete="off">
        <button class="ai-send-btn" id="aiSendBtn" type="submit">Send</button>
      </form>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(backdrop);

  const msgsEl = document.getElementById('aiChatMsgs');
  const chipsEl = document.getElementById('aiQuickChips');
  const formEl = document.getElementById('aiChatForm');
  const inputEl = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const closeBtn = document.getElementById('aiCloseBtn');
  const clearBtn = document.getElementById('aiClearBtn');

  let history = [];
  let isSending = false;

  function formatText(text) {
    const escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'ai-msg ' + (role === 'user' ? 'user' : 'bot');
    div.innerHTML = formatText(text);
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return div;
  }

  function resetChat() {
    history = [];
    msgsEl.innerHTML = '';
    chipsEl.style.display = 'flex';
    addMessage('bot', 'আসসালামু আলাইকুম! আমি **EEEGPT AI**। BNBC 2020, RSC, NFPA, IEC, কেবল সাইজিং বা যেকোনো ইলেকট্রিক্যাল ও অটোমেশন প্রশ্ন বাংলায় বা ইংরেজিতে জিজ্ঞেস করুন।');
  }

  async function sendQuestion(text) {
    const q = String(text || '').trim();
    if (!q || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    chipsEl.style.display = 'none';
    inputEl.value = '';

    addMessage('user', q);
    const loadingEl = addMessage('bot', 'উত্তর তৈরি হচ্ছে...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not get response');

      loadingEl.innerHTML = formatText(data.reply);
      history.push({ role: 'user', text: q });
      history.push({ role: 'model', text: data.reply });
    } catch (err) {
      loadingEl.innerHTML = formatText('⚠️ দুঃখিত, উত্তর আনা যায়নি: ' + err.message);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }
  }

  fab.addEventListener('click', () => {
    backdrop.classList.add('open');
    setTimeout(() => inputEl.focus(), 120);
  });
  closeBtn.addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
  clearBtn.addEventListener('click', resetChat);
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    sendQuestion(inputEl.value);
  });
  chipsEl.querySelectorAll('.ai-chip').forEach((btn) => {
    btn.addEventListener('click', () => sendQuestion(btn.textContent));
  });

  // Hide AI button inside full-screen Simulation Lab
  const simPage = document.getElementById('simulationLabPage');
  if (simPage && window.MutationObserver) {
    const syncFabVisibility = () => {
      fab.style.display = simPage.classList.contains('active') ? 'none' : 'flex';
    };
    new MutationObserver(syncFabVisibility).observe(simPage, { attributes: true, attributeFilter: ['class'] });
  }

  resetChat();
})();
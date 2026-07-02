/* ========================================================================
   CASABOT — Widget de suporte por IA (Groq API)
   Uso: definir window.CASABOT_CONTEXT antes de incluir este script.
   ======================================================================== */
(function(){

const STORAGE_KEY = 'casafacil_groq_api_key';
const MODEL = 'llama-3.3-70b-versatile';
const ctx = window.CASABOT_CONTEXT || {
  greeting: "Olá! Sou o CasaBot, o assistente da CasaFácil. Como posso ajudar?",
  systemPrompt: "És o CasaBot, assistente virtual da CasaFácil, uma plataforma imobiliária angolana. Responde sempre em português de Angola, de forma breve, calorosa e prática.",
  quickReplies: ["Como funciona a CasaFácil?", "Preciso de ajuda"]
};

/* ---------- CSS ---------- */
const style = document.createElement('style');
style.textContent = `
  #casabot-launcher{
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:#10202F; color:#F7F4EE; border:none; border-radius:30px;
    padding:14px 20px 14px 16px; display:flex; align-items:center; gap:10px;
    box-shadow:0 14px 34px rgba(16,32,47,0.35); cursor:pointer;
    font-family:'Inter',sans-serif; font-size:0.88rem; font-weight:600;
    transition:transform 0.2s;
  }
  #casabot-launcher:hover{ transform:translateY(-2px); }
  #casabot-launcher .cb-dot{width:8px; height:8px; border-radius:50%; background:#C99A3B;}
  #casabot-launcher svg{width:20px; height:20px; color:#E3C481;}
  #casabot-launcher.hide{display:none;}

  #casabot-panel{
    position:fixed; bottom:24px; right:24px; z-index:9999;
    width:380px; max-width:calc(100vw - 32px); height:560px; max-height:calc(100vh - 48px);
    background:#F7F4EE; border-radius:14px; box-shadow:0 30px 70px rgba(16,32,47,0.4);
    display:none; flex-direction:column; overflow:hidden;
    font-family:'Inter',sans-serif; color:#10202F;
  }
  #casabot-panel.show{display:flex;}

  #casabot-header{
    background:#10202F; color:#F7F4EE; padding:16px 18px; display:flex; align-items:center; justify-content:space-between;
  }
  #casabot-header .cb-title{display:flex; align-items:center; gap:10px; font-weight:600; font-size:0.98rem; font-family:'Fraunces',serif;}
  #casabot-header .cb-avatar{
    width:34px; height:34px; border-radius:50%; background:#C99A3B; color:#10202F;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  #casabot-header .cb-avatar svg{width:17px; height:17px;}
  #casabot-header .cb-sub{font-size:0.72rem; color:rgba(247,244,238,0.55); font-weight:400; font-family:'Inter',sans-serif;}
  #casabot-header-btns{display:flex; gap:6px;}
  #casabot-header button{background:rgba(247,244,238,0.1); border:none; color:#F7F4EE; width:30px; height:30px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;}
  #casabot-header button:hover{background:rgba(247,244,238,0.2);}
  #casabot-header button svg{width:15px; height:15px;}

  #casabot-messages{flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:12px;}
  .cb-msg{max-width:85%; padding:11px 14px; border-radius:12px; font-size:0.87rem; line-height:1.5;}
  .cb-msg.bot{background:#fff; border:1px solid rgba(16,32,47,0.1); align-self:flex-start; border-bottom-left-radius:3px;}
  .cb-msg.user{background:#10202F; color:#F7F4EE; align-self:flex-end; border-bottom-right-radius:3px;}
  .cb-msg.typing{background:#fff; border:1px solid rgba(16,32,47,0.1); align-self:flex-start; display:flex; gap:4px; padding:14px;}
  .cb-typing-dot{width:6px; height:6px; border-radius:50%; background:#9AA8B0; animation:cb-bounce 1.2s infinite;}
  .cb-typing-dot:nth-child(2){animation-delay:0.15s;}
  .cb-typing-dot:nth-child(3){animation-delay:0.3s;}
  @keyframes cb-bounce{0%,60%,100%{transform:translateY(0); opacity:0.4;} 30%{transform:translateY(-4px); opacity:1;}}

  .cb-quick{display:flex; flex-wrap:wrap; gap:6px; padding:0 18px 12px;}
  .cb-quick button{
    background:#fff; border:1px solid rgba(16,32,47,0.14); color:#10202F; font-size:0.78rem;
    padding:7px 12px; border-radius:20px; cursor:pointer; transition:border-color 0.2s, background 0.2s;
  }
  .cb-quick button:hover{border-color:#C99A3B; background:rgba(201,154,59,0.08);}

  #casabot-inputbar{border-top:1px solid rgba(16,32,47,0.1); padding:12px; display:flex; gap:8px; background:#fff;}
  #casabot-input{
    flex:1; border:1px solid rgba(16,32,47,0.15); border-radius:24px; padding:11px 16px; font-size:0.86rem;
    font-family:inherit; resize:none; max-height:80px;
  }
  #casabot-input:focus{outline:none; border-color:#C99A3B;}
  #casabot-send{
    background:#C99A3B; color:#10202F; border:none; width:40px; height:40px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  #casabot-send:hover{background:#E3C481;}
  #casabot-send svg{width:17px; height:17px;}
  #casabot-send:disabled{opacity:0.4; cursor:not-allowed;}

  #casabot-settings{
    position:absolute; inset:0; background:#F7F4EE; display:none; flex-direction:column; padding:20px; z-index:2;
  }
  #casabot-settings.show{display:flex;}
  #casabot-settings h3{font-family:'Fraunces',serif; font-size:1.05rem; margin-bottom:6px;}
  #casabot-settings p{font-size:0.8rem; color:#6B7B86; margin-bottom:16px; line-height:1.5;}
  #casabot-settings input{
    width:100%; padding:11px 14px; border:1px solid rgba(16,32,47,0.15); border-radius:6px; font-size:0.85rem; margin-bottom:12px;
  }
  #casabot-settings a{color:#C99A3B; font-weight:600;}
  #casabot-settings .cb-save{background:#10202F; color:#F7F4EE; border:none; padding:11px; border-radius:6px; font-weight:600; font-size:0.85rem; cursor:pointer;}
  #casabot-settings .cb-back{background:none; border:none; color:#6B7B86; font-size:0.8rem; margin-top:10px; cursor:pointer; text-align:left;}

  @media (max-width:460px){
    #casabot-panel{ width:calc(100vw - 24px); right:12px; bottom:12px; height:calc(100vh - 24px); }
    #casabot-launcher{ right:16px; bottom:16px; }
  }
`;
document.head.appendChild(style);

/* ---------- HTML ---------- */
const launcher = document.createElement('button');
launcher.id = 'casabot-launcher';
launcher.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  <span>CasaBot</span><span class="cb-dot"></span>
`;
document.body.appendChild(launcher);

const panel = document.createElement('div');
panel.id = 'casabot-panel';
panel.innerHTML = `
  <div id="casabot-header">
    <div class="cb-title">
      <div class="cb-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
      <div>CasaBot<div class="cb-sub">${ctx.headerSub || 'Assistente CasaFácil'}</div></div>
    </div>
    <div id="casabot-header-btns">
      <button id="casabot-settings-btn" title="Configurar API"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>
      <button id="casabot-close-btn" title="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  </div>
  <div style="position:relative; flex:1; display:flex; flex-direction:column; min-height:0;">
    <div id="casabot-settings">
      <h3>Ligar à API da Groq</h3>
      <p>O CasaBot usa a API da Groq para responder. Cole a sua chave de API abaixo — fica guardada apenas neste dispositivo. Pode obter uma chave gratuita em <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a>.</p>
      <input type="password" id="casabot-key-input" placeholder="gsk_...">
      <button class="cb-save" id="casabot-key-save">Guardar e continuar</button>
      <button class="cb-back" id="casabot-settings-back">← Voltar à conversa</button>
    </div>
    <div id="casabot-messages"></div>
    <div class="cb-quick" id="casabot-quick"></div>
    <div id="casabot-inputbar">
      <textarea id="casabot-input" rows="1" placeholder="Escreva a sua pergunta..."></textarea>
      <button id="casabot-send"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>
    </div>
  </div>
`;
document.body.appendChild(panel);

/* ---------- State ---------- */
let history = [];
// Prioridade: chave definida em window.CASABOT_CONTEXT.groqApiKey (configurada pelo dono
// do site, ex. em firebase-config.js ou noutro script) > chave guardada pelo visitante.
let apiKey = (ctx.groqApiKey && ctx.groqApiKey.trim()) || localStorage.getItem(STORAGE_KEY) || '';
const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);

const messagesEl = document.getElementById('casabot-messages');
const quickEl = document.getElementById('casabot-quick');
const inputEl = document.getElementById('casabot-input');
const sendBtn = document.getElementById('casabot-send');
const settingsPanel = document.getElementById('casabot-settings');

function addMessage(role, text){
  const div = document.createElement('div');
  div.className = 'cb-msg ' + (role === 'user' ? 'user' : 'bot');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping(){
  const div = document.createElement('div');
  div.className = 'cb-msg typing';
  div.id = 'casabot-typing';
  div.innerHTML = '<span class="cb-typing-dot"></span><span class="cb-typing-dot"></span><span class="cb-typing-dot"></span>';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function hideTyping(){
  const t = document.getElementById('casabot-typing');
  if(t) t.remove();
}

function renderQuickReplies(){
  quickEl.innerHTML = '';
  (ctx.quickReplies || []).forEach(q=>{
    const b = document.createElement('button');
    b.textContent = q;
    b.addEventListener('click', ()=>{ inputEl.value = q; sendMessage(); });
    quickEl.appendChild(b);
  });
}

async function sendMessage(){
  const text = inputEl.value.trim();
  if(!text) return;

  if(!apiKey){
    settingsPanel.classList.add('show');
    return;
  }

  inputEl.value = '';
  addMessage('user', text);
  history.push({role:'user', content:text});
  quickEl.innerHTML = '';
  showTyping();
  sendBtn.disabled = true;

  try{
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {role:'system', content: ctx.systemPrompt},
          ...history.slice(-12)
        ],
        temperature: 0.6,
        max_tokens: 500
      })
    });

    if(!res.ok){
      const errBody = await res.text();
      throw new Error('HTTP ' + res.status + ': ' + errBody.slice(0,200));
    }

    const data = await res.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : 'Desculpe, não consegui processar a resposta.';
    hideTyping();
    addMessage('bot', reply);
    history.push({role:'assistant', content:reply});
    logConversationTurn(text, reply);
  } catch(err){
    hideTyping();
    if(String(err.message).includes('401')){
      addMessage('bot', 'A chave de API da Groq parece inválida. Pode verificar em Configurações (ícone de engrenagem).');
    } else {
      addMessage('bot', 'Não consegui ligar ao serviço agora. Verifique a sua ligação à internet ou tente novamente em instantes.');
    }
    console.error('CasaBot error:', err);
  } finally {
    sendBtn.disabled = false;
  }
}

/* Regista a troca de mensagens no Firestore (não bloqueia a conversa se falhar) */
function logConversationTurn(userText, botText){
  try{
    if(window.CASAFACIL_FIREBASE_READY && window.db){
      window.db.collection('casabot_conversas').add({
        sessionId,
        pagina: window.location.pathname,
        userText, botText,
        userId: (window.CASAFACIL_CURRENT_USER && window.CASAFACIL_CURRENT_USER.uid) || null,
        criadoEm: window.fbTimestamp ? window.fbTimestamp() : new Date().toISOString()
      }).catch(()=>{ /* silencioso: o chat continua a funcionar mesmo sem log */ });
    }
  } catch(e){ /* Firebase pode não estar carregado nesta página; ignorar */ }
}

/* ---------- Events ---------- */
launcher.addEventListener('click', ()=>{
  panel.classList.add('show');
  launcher.classList.add('hide');
  if(messagesEl.children.length === 0){
    addMessage('bot', ctx.greeting);
    renderQuickReplies();
  }
  inputEl.focus();
});
document.getElementById('casabot-close-btn').addEventListener('click', ()=>{
  panel.classList.remove('show');
  launcher.classList.remove('hide');
});
document.getElementById('casabot-settings-btn').addEventListener('click', ()=>{
  document.getElementById('casabot-key-input').value = apiKey;
  settingsPanel.classList.add('show');
});
document.getElementById('casabot-settings-back').addEventListener('click', ()=>{
  settingsPanel.classList.remove('show');
});
document.getElementById('casabot-key-save').addEventListener('click', ()=>{
  const val = document.getElementById('casabot-key-input').value.trim();
  if(val){
    apiKey = val;
    localStorage.setItem(STORAGE_KEY, val);
  }
  settingsPanel.classList.remove('show');
  if(messagesEl.children.length === 0){
    addMessage('bot', ctx.greeting);
    renderQuickReplies();
  }
});
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});
inputEl.addEventListener('input', ()=>{
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
});

/* Open settings automatically the very first time if no key saved yet */
if(!apiKey){
  // don't force-open; user opens chat first, then gets prompted on first send
}

})();

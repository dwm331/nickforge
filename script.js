const API = 'https://nickforge-api.smallnavel.workers.dev';

const JOBS = {
  mmorpg:  ['劍士', '法師', '弓手', '盜賊', '牧師', '騎士', '召喚師', '舞者', '格鬥家'],
  moba:    ['上單', '打野', '中單', 'ADC', '輔助', '坦克', '刺客', '射手'],
  fps:     ['狙擊手', '突擊手', '醫療兵', '工兵', '隊長', '偵察兵', '爆破手'],
  sandbox: ['建築師', '探索者', '礦工', '農夫', '獵人', '工匠', '冒險者'],
  card:    ['控場手', '爆發手', '資源手', '節奏手', '奶媽', '快攻手'],
};

const state = {
  gameType: 'mmorpg',
  job:      null,
  style:    null,
  elements: [],
  length:   'short',
};

// ── Session Token 管理 ────────────────────────────────────────
let sessionToken  = null;
let refreshTimer  = null;

async function fetchSession(turnstileToken) {
  try {
    const res = await fetch(`${API}/auth`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ turnstileToken }),
    });
    if (!res.ok) return;
    const { sessionToken: tok, expiresIn } = await res.json();
    sessionToken = tok;

    // 在過期前 30 秒靜默刷新：reset Turnstile → 觸發新 callback
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (typeof turnstile !== 'undefined') turnstile.reset();
    }, (expiresIn - 30) * 1000);

    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = '🎲 Generate 生成';
  } catch (e) {
    console.warn('Session 初始化失敗', e);
  }
}

// Turnstile callback（Cloudflare 驗完自動呼叫）
function onTurnstileReady(token) { fetchSession(token); }

// 頁面載入後主動 poll，不依賴 callback 是否有觸發
async function pollTurnstileToken() {
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 200));
    if (sessionToken) return; // callback 已先處理完
    if (typeof turnstile === 'undefined') continue;
    const token = turnstile.getResponse();
    if (token) { await fetchSession(token); return; }
  }
}

// ── Render ───────────────────────────────────────────────────

function renderIds(ids) {
  const grid = document.getElementById('idGrid');
  grid.innerHTML = ids.map(id => `
    <div class="id-card" data-id="${escapeAttr(id)}" onclick="copyId(this)">
      <span class="id-text">${escapeHtml(id)}</span>
      <span class="copy-label">複製</span>
    </div>
  `).join('');
  document.getElementById('results').hidden = false;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(s) {
  return s.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function copyId(card) {
  const text = card.dataset.id;
  navigator.clipboard.writeText(text).then(() => {
    card.classList.add('copied');
    card.querySelector('.copy-label').textContent = '已複製 ✓';
    setTimeout(() => {
      card.classList.remove('copied');
      card.querySelector('.copy-label').textContent = '複製';
    }, 1500);
  });
}

function showLoading(on) {
  const btn = document.getElementById('generateBtn');
  btn.textContent = on ? '⏳ 生成中...' : '🎲 Generate 生成';
  btn.disabled    = on;
}

// ── API Call ─────────────────────────────────────────────────

async function fetchIds() {
  const params = new URLSearchParams({
    gameType: state.gameType,
    job:      state.job   || '',
    style:    state.style || '',
    length:   state.length,
    elements: state.elements.join(','),
  });

  const res = await fetch(`${API}?${params}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sessionToken }),
  });

  if (res.status === 403) {
    // Session 過期，重新驗
    sessionToken = null;
    if (typeof turnstile !== 'undefined') turnstile.reset();
    throw new Error('Session 已過期，請稍候自動刷新');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { ids } = await res.json();
  return ids;
}

async function doGenerate() {
  if (!sessionToken) { alert('驗證尚未完成，請稍候'); return; }
  showLoading(true);
  try {
    const ids = await fetchIds();
    renderIds(ids);
  } catch (e) {
    alert(e.message || '生成失敗，請稍後再試 🙏');
    console.error(e);
  } finally {
    showLoading(false);
  }
}

// ── Chip Init ────────────────────────────────────────────────

function renderJobs(gameType) {
  const container = document.getElementById('jobClass');
  const jobs = JOBS[gameType] || [];
  container.innerHTML = jobs.map((j, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-value="${j}">${j}</button>`
  ).join('');
  state.job = jobs[0] || null;

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.job = chip.dataset.value;
    });
  });
}

function initSingleSelect(containerId, key) {
  const container = document.getElementById(containerId);
  const active = container.querySelector('.chip.active');
  if (active) state[key] = active.dataset.value;

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[key] = chip.dataset.value;
    });
  });
}

function initSingleSelectOptional(containerId, key) {
  const container = document.getElementById(containerId);
  state[key] = null;

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const alreadyActive = chip.classList.contains('active');
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      if (!alreadyActive) {
        chip.classList.add('active');
        state[key] = chip.dataset.value;
      } else {
        state[key] = null;
      }
    });
  });
}

function initMultiSelect(containerId, key) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const val = chip.dataset.value;
      if (chip.classList.contains('active')) {
        if (!state[key].includes(val)) state[key].push(val);
      } else {
        state[key] = state[key].filter(v => v !== val);
      }
    });
  });
}

// ── Boot ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderJobs('mmorpg');
  initSingleSelect('gameType', 'gameType');
  initSingleSelect('length', 'length');
  initSingleSelectOptional('style', 'style');
  initMultiSelect('elements', 'elements');

  document.getElementById('gameType').querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => renderJobs(chip.dataset.value));
  });

  // 按鈕先 disable，等 Session 拿到才啟用
  document.getElementById('generateBtn').disabled = true;

  document.getElementById('generateBtn').addEventListener('click', doGenerate);
  document.getElementById('rerollBtn').addEventListener('click', doGenerate);

  // 頁面載入後主動嘗試拿 token（不等 callback）
  pollTurnstileToken();
});

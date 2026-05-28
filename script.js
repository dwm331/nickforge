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

// ── Session Token ─────────────────────────────────────────────
let sessionToken = null;

// Turnstile 驗證成功後 Cloudflare 自動呼叫此 function
function onTurnstileReady(turnstileToken) {
  clearTimeout(turnstileTimeout);
  fetch(`${API}/auth`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ turnstileToken }),
  })
  .then(r => r.ok ? r.json() : Promise.reject(r.status))
  .then(({ sessionToken: tok }) => {
    sessionToken = tok;
    const btn = document.getElementById('generateBtn');
    btn.disabled = false;
    btn.textContent = '🎲 Generate 生成';
  })
  .catch(() => showRetry());
}

let turnstileTimeout = null;

function showRetry() {
  const btn = document.getElementById('generateBtn');
  btn.disabled = false;
  btn.textContent = '🔄 驗證失敗，點我重試';
  btn.onclick = () => {
    btn.disabled = true;
    btn.textContent = '⏳ 安全驗證中...';
    btn.onclick = null;
    btn.addEventListener('click', doGenerate);
    if (typeof turnstile !== 'undefined') turnstile.reset();
    startTurnstileTimeout();
  };
  btn.removeEventListener('click', doGenerate);
}

function startTurnstileTimeout() {
  clearTimeout(turnstileTimeout);
  turnstileTimeout = setTimeout(() => {
    if (!sessionToken) showRetry();
  }, 15000); // 15 秒還沒驗完就顯示重試
}

// ── Render ────────────────────────────────────────────────────
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
  navigator.clipboard.writeText(card.dataset.id).then(() => {
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

// ── API Call ──────────────────────────────────────────────────
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
    // Session 過期，重設 Turnstile 讓使用者重新驗
    sessionToken = null;
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('generateBtn').textContent = '🎲 Generate 生成';
    if (typeof turnstile !== 'undefined') turnstile.reset();
    throw new Error('驗證已過期，請重新完成驗證後再試');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { ids } = await res.json();
  return ids;
}

async function doGenerate() {
  showLoading(true);
  try {
    const ids = await fetchIds();
    renderIds(ids);
  } catch (e) {
    alert(e.message || '生成失敗，請稍後再試 🙏');
  } finally {
    showLoading(false);
  }
}

// ── Chip Init ─────────────────────────────────────────────────
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

// ── 篩選摺疊 ─────────────────────────────────────────────────
function toggleFilters() {
  const content = document.getElementById('filtersContent');
  const btn     = document.getElementById('filtersToggle');
  const isOpen  = !content.classList.contains('collapsed');
  content.classList.toggle('collapsed', isOpen);
  btn.textContent = isOpen ? '▼ 展開篩選' : '▲ 收合篩選';
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderJobs('mmorpg');
  initSingleSelect('gameType', 'gameType');
  initSingleSelect('length', 'length');
  initSingleSelectOptional('style', 'style');
  initMultiSelect('elements', 'elements');

  document.getElementById('gameType').querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => renderJobs(chip.dataset.value));
  });

  // 等 Turnstile 驗完才 enable，15秒 timeout 顯示重試
  document.getElementById('generateBtn').disabled = true;
  document.getElementById('generateBtn').addEventListener('click', doGenerate);
  document.getElementById('rerollBtn').addEventListener('click', doGenerate);
  startTurnstileTimeout();
});

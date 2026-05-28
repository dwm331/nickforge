// ── Word Banks ──────────────────────────────────────────────

const JOBS = {
  mmorpg:  ['劍士', '法師', '弓手', '盜賊', '牧師', '騎士', '召喚師', '舞者', '格鬥家'],
  moba:    ['上單', '打野', '中單', 'ADC', '輔助', '坦克', '刺客', '射手'],
  fps:     ['狙擊手', '突擊手', '醫療兵', '工兵', '隊長', '偵察兵', '爆破手'],
  sandbox: ['建築師', '探索者', '礦工', '農夫', '獵人', '工匠', '冒險者'],
  card:    ['控場手', '爆發手', '資源手', '節奏手', '奶媽', '快攻手'],
};

const BANKS = {
  celebrity: {
    names: ['周杰倫', '蔡依林', '林俊傑', '五月天', '張學友', '劉德華', '王力宏',
            '陳奕迅', '鄧紫棋', '李榮浩', '周興哲', '魏如萱', '盧廣仲', '告五人', '田馥甄'],
    en:    ['Jay', 'Jolin', 'JJ', 'Eason', 'GEM', 'Mayday', 'Will'],
    suffix: ['本人', '打', '系', 'Fan', '粉絲', '替身'],
  },
  anime: {
    zh: ['鳴人', '悟空', '路飛', '柯南', '娜美', '劍八', '一護', '炭治郎',
         '禰豆子', '艾倫', '利威爾', '零二', '雷姆', '艾米莉亞', '九尾'],
    en: ['Naruto', 'Goku', 'Luffy', 'Conan', 'Ichigo', 'Levi', 'Zero2', 'Rem'],
    suffix: ['系', '迷', 'Fan', '控'],
  },
  pun: {
    phrases: ['不是外掛', '隊友的鍋', '沒有準星', '已讀不殺', '係金ㄟ',
              '其實不會', '假掰', '本人很會', '菜得有點美', '沒在怕的',
              '超厲害的', '不要踢我', '我真的不會', '其實是高手', '路人甲'],
    short:   ['假掰', '係金ㄟ', '菜雞', '路人', 'GGWP', '不會打', '沒在怕'],
  },
  english: {
    cool:   ['rain', 'void', 'nova', 'echo', 'zero', 'storm', 'frost', 'blaze',
             'shadow', 'drift', 'arc', 'pulse', 'ghost', 'rogue', 'blade',
             'apex', 'dusk', 'dawn', 'crest', 'vale', 'flux', 'peak', 'shard'],
    prefix: ['xX', 'The', 'Pro', 'iAm', 'Dark', 'Neo'],
    suffix: ['GG', 'xx', '666', 'XD', 'gg', 'YT'],
  },
  japanese: {
    words:  ['Yami', 'Hikari', 'Kage', 'Sora', 'Akira', 'Ryu', 'Hana', 'Tsuki',
             'Kaze', 'Yuki', 'Kumo', 'Tora', 'Kami', 'Shiro', 'Kuro', 'Aoi',
             'Oni', 'Mizu', 'Hoshi', 'Kiri'],
    kanji:  ['闇', '光', '影', '空', '龍', '花', '月', '風', '雪', '虎', '神', '蒼'],
    particle: ['no', 'wa', 'ga', 'kun', 'chan'],
  },
};

const STYLE_MODS = {
  cool:   { pre: ['Dark', 'Shadow', 'Zero', 'Neo', 'Void'], post: [] },
  cute:   { pre: [], post: ['owo', 'QQ', '仔', '寶', '呦', '~'] },
  funny:  { pre: ['假的', '不會打的', '其實很菜的'], post: ['der', '啦'] },
  lowkey: { pre: [], post: [] },
};

// ── State ────────────────────────────────────────────────────

const state = {
  gameType: 'mmorpg',
  job:      null,
  style:    null,
  elements: [],
  length:   'short',
};

// ── Helpers ──────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cap  = (s)   => s.charAt(0).toUpperCase() + s.slice(1);

// ── ID Generation ────────────────────────────────────────────

function buildId(element) {
  const len = state.length;

  switch (element) {
    case 'celebrity': {
      const b = BANKS.celebrity;
      if (len === 'short')  return pick(b.en);
      if (len === 'medium') return pick(b.names).slice(-2) + pick(b.suffix);
      return pick(b.names) + pick(['不會打', '打' + (state.job || ''), '系的' + (state.job || '法師')]);
    }

    case 'anime': {
      const b = BANKS.anime;
      if (len === 'short')  return pick(b.en);
      if (len === 'medium') return pick(b.en) + pick(['_GG', 'xD', '666', cap(pick(b.en))]);
      return pick(b.zh) + '系的' + (state.job || pick(['法師', '戰士', '刺客']));
    }

    case 'pun': {
      const b = BANKS.pun;
      if (len === 'short')  return pick(b.short);
      if (len === 'medium') return pick(b.phrases).slice(0, 5);
      return pick(b.phrases);
    }

    case 'english': {
      const b = BANKS.english;
      if (len === 'short') {
        return cap(pick(b.cool));
      }
      if (len === 'medium') {
        const flip = Math.random();
        if (flip < 0.33) return pick(b.prefix) + cap(pick(b.cool));
        if (flip < 0.66) return cap(pick(b.cool)) + cap(pick(b.cool));
        return cap(pick(b.cool)) + pick(b.suffix);
      }
      return pick(b.prefix) + cap(pick(b.cool)) + cap(pick(b.cool)) + pick(b.suffix);
    }

    case 'japanese': {
      const b = BANKS.japanese;
      if (len === 'short')  return pick(b.words);
      if (len === 'medium') return pick(b.words) + pick(b.words);
      return pick(b.kanji) + pick(b.words) + pick(b.particle);
    }

    default:
      return cap(pick(BANKS.english.cool));
  }
}

function applyStyle(id) {
  if (!state.style) return id;
  const mods = STYLE_MODS[state.style];
  if (!mods) return id;

  // lowkey: just lowercase
  if (state.style === 'lowkey') return id.toLowerCase();

  const r = Math.random();
  if (mods.pre.length && r < 0.4)  return pick(mods.pre) + id;
  if (mods.post.length && r < 0.8) return id + pick(mods.post);
  return id;
}

function generateOne() {
  const pool = state.elements.length > 0 ? state.elements
    : ['celebrity', 'anime', 'pun', 'english', 'japanese'];
  const element = pick(pool);
  return applyStyle(buildId(element));
}

function generateBatch() {
  const results = [];
  const seen    = new Set();
  let attempts  = 0;

  while (results.length < 8 && attempts < 120) {
    const id = generateOne();
    if (id && id.length >= 2 && !seen.has(id)) {
      results.push(id);
      seen.add(id);
    }
    attempts++;
  }
  return results;
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

  const doGenerate = () => renderIds(generateBatch());
  document.getElementById('generateBtn').addEventListener('click', doGenerate);
  document.getElementById('rerollBtn').addEventListener('click', doGenerate);
});

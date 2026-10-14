Screens.crash = {
  state: {
    running: false,
    crashed: false,
    multiplier: 1.00,
    crashPoint: 0,
    bet: 0,
    hasBet: false,
    cashedOut: false,
    cashedAt: 0,
    timer: null,
    countdown: 0,
    countdownTimer: null,
  },

  render(app) {
    const s = State.data.crash;
    if (!s.lastGames) s.lastGames = [];

    app.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">🚀 Краш</h2>

      <div class="crash-history" id="crashHistory"></div>

      <div class="crash-display">
        <div class="crash-multiplier" id="crashMultiplier">1.00x</div>
        <div style="color:var(--text-dim);font-size:12px;margin-top:8px;" id="crashStatus">
          Сделай ставку и запусти ракету
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:var(--text-dim);">
          <span>Твоя ставка</span>
          <span id="betDisplay">${Utils.formatMoney(this.state.bet || 0)}</span>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
          <button class="btn btn-outline" data-bet="500" style="flex:1;padding:8px;">500</button>
          <button class="btn btn-outline" data-bet="1000" style="flex:1;padding:8px;">1 000</button>
          <button class="btn btn-outline" data-bet="5000" style="flex:1;padding:8px;">5 000</button>
          <button class="btn btn-outline" data-bet="10000" style="flex:1;padding:8px;">10 000</button>
          <button class="btn btn-outline" data-bet="half" style="flex:1;padding:8px;">½</button>
          <button class="btn btn-outline" data-bet="double" style="flex:1;padding:8px;">×2</button>
        </div>
        <div class="action-row" style="margin-top:0;">
          <button class="btn btn-gold" id="crashStartBtn" style="flex:2;">🚀 Старт</button>
          <button class="btn btn-success" id="crashCashBtn" style="flex:1;" disabled>💵 Забрать</button>
        </div>
      </div>

      <div class="card" style="font-size:12px;color:var(--text-dim);line-height:1.5;">
        <b style="color:var(--text);">Как играть:</b><br>
        1. Поставь сумму и нажми «Старт».<br>
        2. Множитель растёт от 1.00x.<br>
        3. Успей нажать «Забрать» до того, как ракета взорвётся.<br>
        4. Выигрыш = ставка × множитель.
      </div>
    `;

    this.renderHistory();
    this.bindControls();
    this.refreshButtons();
  },

  bindControls() {
    document.querySelectorAll('[data-bet]').forEach(btn => {
      btn.onclick = () => {
        if (this.state.running) return;
        const val = btn.dataset.bet;
        if (val === 'half') this.state.bet = Math.floor(this.state.bet / 2);
        else if (val === 'double') this.state.bet = Math.min(this.state.bet * 2, State.data.balance);
        else this.state.bet = (this.state.bet || 0) + parseInt(val);
        if (this.state.bet > State.data.balance) this.state.bet = State.data.balance;
        if (this.state.bet < 0) this.state.bet = 0;
        document.getElementById('betDisplay').textContent = Utils.formatMoney(this.state.bet);
        this.refreshButtons();
      };
    });

    document.getElementById('crashStartBtn').onclick = () => this.startRound();
    document.getElementById('crashCashBtn').onclick = () => this.cashOut();
  },

  refreshButtons() {
    const startBtn = document.getElementById('crashStartBtn');
    const cashBtn = document.getElementById('crashCashBtn');
    if (!startBtn || !cashBtn) return;

    if (this.state.running) {
      startBtn.disabled = true;
      startBtn.textContent = '🚀 Летит...';
      cashBtn.disabled = this.state.cashedOut;
      cashBtn.textContent = this.state.cashedOut ? '✓ Забрано' : '💵 Забрать';
    } else {
      startBtn.disabled = this.state.bet <= 0 || this.state.bet > State.data.balance;
      startBtn.textContent = '🚀 Старт';
      cashBtn.disabled = true;
      cashBtn.textContent = '💵 Забрать';
    }
  },

  renderHistory() {
    const hist = State.data.crash.lastGames || [];
    const el = document.getElementById('crashHistory');
    if (!el) return;
    el.innerHTML = hist.slice(0, 12).map(v => {
      let cls = 'low';
      if (v >= 10) cls = 'high';
      else if (v >= 2) cls = 'mid';
      return `<span class="${cls}">${v.toFixed(2)}x</span>`;
    }).join('') || '<span style="color:var(--text-dim);font-size:12px;">Пока пусто</span>';
  },

  // генерация точки краха по распределению (как в реальных крашах)
  generateCrashPoint() {
    // 3% мгновенный краш на 1.00
    if (Math.random() < 0.03) return 1.00;
    // остальное — по формуле 0.99 / (1 - r)
    const r = Math.random();
    const point = Math.max(1.01, 0.99 / (1 - r));
    return Math.min(point, 100);
  },

  startRound() {
    if (this.state.running) return;
    const bet = this.state.bet;
    if (bet <= 0) { Utils.toast('Поставь сумму'); return; }
    if (bet > State.data.balance) { Utils.toast('Недостаточно средств'); return; }

    State.changeBalance(-bet);

    this.state.running = true;
    this.state.crashed = false;
    this.state.cashedOut = false;
    this.state.cashedAt = 0;
    this.state.multiplier = 1.00;
    this.state.crashPoint = this.generateCrashPoint();
    this.state.hasBet = true;

    const multEl = document.getElementById('crashMultiplier');
    const statusEl = document.getElementById('crashStatus');
    multEl.textContent = '1.00x';
    multEl.classList.remove('crashed');
    statusEl.textContent = '🚀 Ракета летит...';

    this.refreshButtons();

    // старт: 500 мс подготовка
    setTimeout(() => {
      this.tick();
    }, 400);
  },

  tick() {
    if (!this.state.running) return;
    const start = Date.now();
    const tickMs = 50;

    const loop = () => {
      if (!this.state.running) return;

      const elapsed = (Date.now() - start) / 1000;
      // чем дальше — тем медленнее растёт
      const m = Math.pow(1.06, elapsed * 10);
      this.state.multiplier = m;

      if (m >= this.state.crashPoint) {
        this.crash();
        return;
      }

      const multEl = document.getElementById('crashMultiplier');
      if (multEl) multEl.textContent = m.toFixed(2) + 'x';

      if (this.state.cashedOut) {
        const statusEl = document.getElementById('crashStatus');
        if (statusEl) statusEl.textContent = `✅ Забрано на ${this.state.cashedAt.toFixed(2)}x`;
      }

      this.state.timer = setTimeout(loop, tickMs);
    };
    loop();
  },

  cashOut() {
    if (!this.state.running || this.state.crashed || this.state.cashedOut) return;
    const mult = this.state.multiplier;
    const win = Math.round(this.state.bet * mult);
    State.changeBalance(win);
    State.data.earned += win;
    this.state.cashedOut = true;
    this.state.cashedAt = mult;
    Utils.toast(`💵 Забрано ${Utils.formatMoney(win)} на ${mult.toFixed(2)}x`);
    this.refreshButtons();
  },

  crash() {
    this.state.running = false;
    this.state.crashed = true;
    clearTimeout(this.state.timer);

    const multEl = document.getElementById('crashMultiplier');
    const statusEl = document.getElementById('crashStatus');
    if (multEl) {
      multEl.textContent = this.state.crashPoint.toFixed(2) + 'x';
      multEl.classList.add('crashed');
    }

    let historyRecord = this.state.crashPoint;

    if (this.state.cashedOut) {
      if (statusEl) statusEl.textContent = `Взрыв на ${this.state.crashPoint.toFixed(2)}x — ты успел забрать на ${this.state.cashedAt.toFixed(2)}x`;
    } else {
      if (statusEl) statusEl.textContent = `💥 Взрыв на ${this.state.crashPoint.toFixed(2)}x — ставка потеряна`;
      State.addHistory({ type: 'crash_loss', number: 'CRASH', price: -this.state.bet, rarity: this.state.crashPoint.toFixed(2) + 'x' });
    }

    if (this.state.cashedOut) {
      const win = Math.round(this.state.bet * this.state.cashedAt);
      State.addHistory({ type: 'crash_win', number: 'CRASH', price: win, rarity: this.state.cashedAt.toFixed(2) + 'x' });
    }

    // добавить в историю краша
    if (!Array.isArray(State.data.crash.lastGames)) State.data.crash.lastGames = [];
    State.data.crash.lastGames.unshift(historyRecord);
    if (State.data.crash.lastGames.length > 30) State.data.crash.lastGames.length = 30;
    State.save();
    this.renderHistory();

    this.refreshButtons();

    // сбросить ставку после раунда
    setTimeout(() => {
      this.state.bet = 0;
      const betEl = document.getElementById('betDisplay');
      if (betEl) betEl.textContent = Utils.formatMoney(0);
      this.refreshButtons();
    }, 800);
  },
};
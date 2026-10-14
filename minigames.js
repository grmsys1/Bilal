const MiniGameUpgrade = {
  render(app) {
    Screens.home.restoreUpgrade();
    app.innerHTML = Screens.home.renderUpgrade();
    Screens.home.bindUpgrade();
  },
};

const MiniGameRoulette = {
  prizes: [
    { value: 1000, chance: 40 },
    { value: 5000, chance: 25 },
    { value: 25000, chance: 20 },
    { value: 100000, chance: 10 },
    { value: 500000, chance: 5 },
  ],
  pending: null,
  timer: null,

  render(app) {
    this.restorePending();
    const freeAvailable = State.data.minigames.roulette.lastFreeDate !== new Date().toLocaleDateString('en-CA');
    app.innerHTML = `
      <section class="card minigame-card">
        <h3>🎡 Рулетка</h3>
        <p>Один бесплатный прокрут в день, затем ${Utils.formatMoney(10000)}.</p>
        <div class="roulette-wheel ${this.pending && !this.pending.completed ? 'spinning' : ''}" id="rouletteWheel">
          ${this.pending && !this.pending.completed ? 'КРУТИМ' : '🎡'}
        </div>
        <div class="prize-list">${this.prizes.map(prize => `
          <div class="prize-item"><b>${Utils.formatMoney(prize.value)}</b><small>${prize.chance}%</small></div>
        `).join('')}</div>
        ${this.pending && !this.pending.completed
          ? '<button class="btn btn-outline" id="skipRoulette" style="width:100%;">⏭ Скип</button>'
          : `<button class="btn btn-gold" id="spinRoulette" style="width:100%;">${freeAvailable ? 'Бесплатный прокрут' : `Крутить · ${Utils.formatMoney(10000)}`}</button>`}
        ${this.pending?.message ? `<div class="game-result">${this.pending.message}</div>` : ''}
      </section>
      ${Screens.minigames.historyMarkup('roulette')}
    `;
    const spin = app.querySelector('#spinRoulette');
    if (spin) spin.onclick = () => this.start();
    const skip = app.querySelector('#skipRoulette');
    if (skip) skip.onclick = () => this.finish(true);
  },

  start() {
    if (this.pending && !this.pending.completed) return;
    const state = State.data.minigames.roulette;
    const today = new Date().toLocaleDateString('en-CA');
    const free = state.lastFreeDate !== today;
    if (!free && State.data.balance < 10000) {
      Utils.toast('Недостаточно средств для прокрута');
      return;
    }
    const roll = Math.random() * 100;
    let edge = 0;
    const prize = this.prizes.find(item => {
      edge += item.chance;
      return roll < edge;
    }) || this.prizes[0];
    const duration = this.animationDuration(3000);
    this.pending = { id: Utils.uid(), prize: prize.value, startedAt: Date.now(), duration };
    state.pending = { ...this.pending };
    if (free) state.lastFreeDate = today;
    else State.changeBalance(-10000, false);
    State.save();
    if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
  },

  restorePending() {
    const saved = State.data.minigames.roulette.pending;
    if (!this.pending && saved) this.pending = { ...saved };
    if (this.pending && !this.pending.completed && !this.timer) {
      const remaining = Math.max(0, this.pending.duration - (Date.now() - this.pending.startedAt));
      this.timer = setTimeout(() => this.finish(false), remaining);
    }
  },

  finish(skipped) {
    if (!this.pending || this.pending.completed) return;
    clearTimeout(this.timer);
    this.timer = null;
    const prize = this.pending.prize;
    State.changeBalance(prize, false);
    State.data.earned += prize;
    State.addMinigameHistory('roulette', { id: this.pending.id, prize, won: true }, false);
    State.addHistory({ id: this.pending.id, type: 'roulette', number: 'Рулетка', price: prize, rarity: 'Приз' }, false);
    State.data.minigames.roulette.pending = null;
    State.recordAction('roulette');
    State.notify(`🎡 Рулетка: выигрыш ${Utils.formatMoney(prize)}`);
    this.pending = { completed: true, message: `${skipped ? '⏭ ' : ''}Выигрыш: ${Utils.formatMoney(prize)}` };
    if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
  },

  animationDuration(base) {
    const mode = State.data.settings.animation;
    return mode === 'off' ? 0 : mode === 'short' ? Math.round(base / 2) : base;
  },
};

const MiniGameCases = {
  cases: [
    { id: 'bronze', name: 'Бронзовый', price: 5000, weights: [60, 25, 10, 4, 1, 0, 0] },
    { id: 'silver', name: 'Серебряный', price: 25000, weights: [30, 35, 22, 10, 3, 0, 0] },
    { id: 'gold', name: 'Золотой', price: 100000, weights: [10, 25, 30, 22, 10, 3, 0] },
  ],
  pending: null,
  timer: null,

  render(app) {
    this.restorePending();
    app.innerHTML = `
      <section class="card minigame-card">
        <h3>📦 Кейсы</h3>
        <p>Перед открытием показаны шансы редкости.</p>
        <div class="case-grid">
          ${this.cases.map(item => `
            <button class="case-card" data-case="${item.id}" ${this.pending && !this.pending.completed ? 'disabled' : ''}>
              <span>📦</span><b>${item.name}</b><strong>${Utils.formatMoney(item.price)}</strong>
              <small>${this.rarityChances(item)}</small>
            </button>
          `).join('')}
        </div>
        ${this.pending && !this.pending.completed ? `
          <div class="case-animation ${this.pending.completed ? 'exploded' : 'shaking'}">${this.pending.completed ? '💥' : '📦'}</div>
          <button class="btn btn-outline" id="skipCase" style="width:100%;">⏭ Скип</button>
        ` : ''}
        ${this.pending?.completed ? `<div class="case-animation exploded">💥</div><div class="game-result">${this.pending.message}</div>` : ''}
      </section>
      ${Screens.minigames.historyMarkup('cases')}
    `;
    app.querySelectorAll('[data-case]').forEach(button => {
      button.onclick = () => this.open(button.dataset.case);
    });
    const skip = app.querySelector('#skipCase');
    if (skip) skip.onclick = () => this.finish(true);
  },

  rarityChances(box) {
    return CONFIG.RARITIES.map((rarity, index) => box.weights[index]
      ? `${rarity.name} ${box.weights[index]}%`
      : '').filter(Boolean).join(' · ');
  },

  open(id) {
    if (this.pending && !this.pending.completed) return;
    const box = this.cases.find(item => item.id === id);
    if (!box) return;
    if (State.data.balance < box.price) {
      Utils.toast('Недостаточно средств');
      return;
    }
    const rarityRoll = Math.random() * 100;
    let threshold = 0;
    let rarity = CONFIG.RARITIES[0];
    for (let index = 0; index < box.weights.length; index++) {
      threshold += box.weights[index];
      if (rarityRoll < threshold) {
        rarity = CONFIG.RARITIES[index];
        break;
      }
    }
    const country = State.data.roaming.selectedCountry
      ? CONFIG.COUNTRIES.find(item => item.code === State.data.roaming.selectedCountry)
      : null;
    const selectedCountry = country || Utils.pick(CONFIG.COUNTRIES);
    const digits = Generator.generateDigits(selectedCountry, rarity);
    const result = {
      id: Utils.uid(),
      country: selectedCountry.code,
      countryName: selectedCountry.name,
      flag: selectedCountry.flag,
      dial: selectedCountry.dial,
      digits,
      formatted: Utils.formatNumber(selectedCountry.dial, digits),
      rarity: rarity.key,
      rarityName: rarity.name,
      rarityCls: rarity.cls,
      price: Generator.price(digits, rarity, selectedCountry, State.data.roaming.simClass),
      operator: Utils.pick(selectedCountry.operators),
      date: Date.now(),
    };
    const duration = this.animationDuration(1500);
    this.pending = { id: result.id, box: box.name, result, completed: false, startedAt: Date.now(), duration };
    State.data.minigames.cases.pending = { ...this.pending };
    State.changeBalance(-box.price, false);
    State.save();
    if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
  },

  restorePending() {
    const saved = State.data.minigames.cases.pending;
    if (!this.pending && saved) this.pending = { ...saved };
    if (this.pending && !this.pending.completed && !this.timer) {
      const remaining = Math.max(0, this.pending.duration - (Date.now() - this.pending.startedAt));
      this.timer = setTimeout(() => this.finish(false), remaining);
    }
  },

  finish(skipped) {
    if (!this.pending || this.pending.completed) return;
    clearTimeout(this.timer);
    this.timer = null;
    const { result, box, id } = this.pending;
    const alreadySettled = State.data.minigames.cases.history.some(item => item.id === id);
    if (!alreadySettled) {
      if (!State.data.collection.some(item => item.id === result.id)) State.addToCollection(result, false);
      State.data.opened++;
      if (!State.data.profile.bestFind || result.price > State.data.profile.bestFind.price) {
        State.data.profile.bestFind = { formatted: result.formatted, price: result.price, rarity: result.rarityName };
      }
      State.addMinigameHistory('cases', {
        id, box, number: result.formatted, price: result.price, rarity: result.rarityName, won: true,
      }, false);
      State.addHistory({
        id, type: 'case', number: result.formatted, price: result.price, rarity: result.rarityName,
      }, false);
    }
    State.data.minigames.cases.pending = null;
    if (!alreadySettled) State.recordAction('case');
    else State.save();
    if (!alreadySettled) Screens.profile.checkAchievements();
    this.pending.completed = true;
    this.pending.message = `${skipped ? '⏭ ' : ''}${result.flag} ${result.formatted} · ${result.rarityName} · ${Utils.formatMoney(result.price)}`;
    State.notify(`📦 Кейс открыт: ${result.rarityName}`);
    if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
  },

  animationDuration(base) {
    const mode = State.data.settings.animation;
    return mode === 'off' ? 0 : mode === 'short' ? Math.round(base / 2) : base;
  },
};

const MiniGameGuess = {
  game: null,

  render(app) {
    if (!this.game) this.game = { current: Utils.random(0, 9), streak: 0, finished: false, message: '' };
    app.innerHTML = `
      <section class="card minigame-card guess-game">
        <h3>🎯 Угадай цифру</h3>
        <p>Угадай, будет следующая цифра больше или меньше. Нужно 5 верных подряд.</p>
        <div class="guess-card ${this.game.flipping ? 'flipping' : ''}">${this.game.current}</div>
        <div class="guess-streak">Верно подряд: ${this.game.streak} / 5</div>
        ${this.game.finished
          ? `<div class="game-result">${this.game.message}</div><button class="btn btn-gold" id="restartGuess" style="width:100%;">Играть ещё</button>`
          : `<div class="action-row"><button class="btn btn-outline" id="guessLower">⬇️ Меньше</button><button class="btn btn-gold" id="guessHigher">⬆️ Больше</button></div>`}
      </section>
      ${Screens.minigames.historyMarkup('guess')}
    `;
    app.querySelector('#guessLower')?.addEventListener('click', () => this.guess('lower'));
    app.querySelector('#guessHigher')?.addEventListener('click', () => this.guess('higher'));
    app.querySelector('#restartGuess')?.addEventListener('click', () => {
      this.game = null;
      if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
    });
  },

  guess(direction) {
    if (!this.game || this.game.finished || this.game.flipping) return;
    const next = Utils.random(0, 9);
    const correct = direction === 'higher' ? next > this.game.current : next < this.game.current;
    this.game.current = next;
    this.game.flipping = true;
    setTimeout(() => {
      if (correct) {
        this.game.streak++;
        if (this.game.streak === 5) this.finish(true);
      } else {
        this.finish(false);
      }
      this.game.flipping = false;
      if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
    }, State.data.settings.animation === 'off' ? 0 : State.data.settings.animation === 'short' ? 120 : 350);
    if (Screens.minigames.isVisible()) this.render(document.getElementById('minigameContent'));
  },

  finish(won) {
    this.game.finished = true;
    this.game.message = won ? `🎉 Победа! +${Utils.formatMoney(25000)}` : 'Не угадал. Попробуй ещё раз!';
    if (won) {
      State.changeBalance(25000);
      State.data.earned += 25000;
      State.notify('🎯 Угадай цифру: +25 000 ₽');
    }
    State.recordAction('guess');
    State.addMinigameHistory('guess', { won, streak: this.game.streak, number: this.game.current, reward: won ? 25000 : 0 });
    State.addHistory({ type: 'guess', number: `Угадай цифру · серия ${this.game.streak}`, price: won ? 25000 : 0, rarity: won ? 'Победа' : 'Попытка' });
    Screens.profile.checkAchievements();
  },
};

const MiniGameMosaic = {
  board: null,
  moves: 0,
  finished: false,
  message: '',

  render(app) {
    if (!this.board) this.resetBoard();
    app.innerHTML = `
      <section class="card minigame-card">
        <h3>🧩 Мозаика</h3>
        <p>Собери пятнашки по порядку за 200 ходов.</p>
        <div class="mosaic-board">
          ${this.board.map((tile, index) => `
            <button class="mosaic-tile ${tile === 0 ? 'empty' : ''}" data-tile-index="${index}" ${this.finished ? 'disabled' : ''}>
              ${tile || ''}
            </button>
          `).join('')}
        </div>
        <div class="guess-streak">Ходов: ${this.moves} / 200</div>
        ${this.message ? `<div class="game-result">${this.message}</div>` : ''}
        <button class="btn btn-outline" id="shuffleMosaic" style="width:100%;">Перемешать заново</button>
      </section>
      ${Screens.minigames.historyMarkup('mosaic')}
    `;
    app.querySelectorAll('[data-tile-index]').forEach(button => {
      button.onclick = () => this.move(Number(button.dataset.tileIndex));
    });
    app.querySelector('#shuffleMosaic').onclick = () => {
      this.resetBoard();
      this.render(document.getElementById('app'));
    };
  },

  resetBoard() {
    this.board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let previousEmpty = -1;
    for (let step = 0; step < 80; step++) {
      const empty = this.board.indexOf(0);
      const candidates = this.neighbors(empty).filter(index => index !== previousEmpty);
      const next = Utils.pick(candidates);
      [this.board[empty], this.board[next]] = [this.board[next], this.board[empty]];
      previousEmpty = empty;
    }
    this.moves = 0;
    this.finished = false;
    this.message = '';
  },

  neighbors(index) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return [
      row > 0 ? index - 3 : -1,
      row < 2 ? index + 3 : -1,
      col > 0 ? index - 1 : -1,
      col < 2 ? index + 1 : -1,
    ].filter(value => value >= 0);
  },

  move(index) {
    if (this.finished) return;
    const empty = this.board.indexOf(0);
    if (!this.neighbors(empty).includes(index)) return;
    [this.board[empty], this.board[index]] = [this.board[index], this.board[empty]];
    this.moves++;
    if (this.board.every((tile, position) => tile === (position === 8 ? 0 : position + 1))) {
      this.finish(true);
    } else if (this.moves >= 200) {
      this.finish(false);
    }
    this.render(document.getElementById('app'));
  },

  finish(won) {
    this.finished = true;
    this.message = won ? '🎉 Мозаика собрана! +40 000 ₽ и 🔑 ключ' : 'Лимит ходов исчерпан. Перемешай и попробуй ещё.';
    if (won) {
      State.changeBalance(40000);
      State.data.earned += 40000;
      State.data.cosmetics.keys++;
      State.notify('🧩 Победа в мозаике: +40 000 ₽ и ключ!');
    }
    State.recordAction('mosaic');
    State.addMinigameHistory('mosaic', { won, moves: this.moves, reward: won ? 40000 : 0 });
    State.addHistory({ type: 'mosaic', number: `Мозаика · ${this.moves} ходов`, price: won ? 40000 : 0, rarity: won ? 'Победа' : 'Попытка' });
    Screens.profile.checkAchievements();
  },
};

Screens.minigames = {
  activeTab: 'upgrade',
  games: {
    upgrade: MiniGameUpgrade,
    roulette: MiniGameRoulette,
    cases: MiniGameCases,
    guess: MiniGameGuess,
    mosaic: MiniGameMosaic,
  },
  tabs: [
    { id: 'upgrade', label: '🎰 Апгрейд' },
    { id: 'roulette', label: '🎡 Рулетка' },
    { id: 'cases', label: '📦 Кейсы' },
    { id: 'guess', label: '🎯 Угадай' },
    { id: 'mosaic', label: '🧩 Мозаика' },
  ],

  render(app) {
    if (!this.games[this.activeTab]) this.activeTab = 'upgrade';
    app.innerHTML = `
      <h2>🎮 Мини-игры</h2>
      <div class="minigame-tabs">
        ${this.tabs.map(tab => `
          <button class="minigame-tab ${this.activeTab === tab.id ? 'active' : ''}" data-minigame-tab="${tab.id}">${tab.label}</button>
        `).join('')}
      </div>
      <div id="minigameContent"></div>
    `;
    app.querySelectorAll('[data-minigame-tab]').forEach(button => {
      button.onclick = () => {
        this.activeTab = button.dataset.minigameTab;
        this.render(app);
      };
    });
    const content = app.querySelector('#minigameContent');
    this.games[this.activeTab].render(content);
  },

  isVisible() {
    return document.querySelector('.bottom-nav button.active')?.dataset.screen === 'minigames';
  },

  historyMarkup(name) {
    const history = State.data.minigames[name]?.history || [];
    if (!history.length) return '';
    return `
      <section class="card minigame-history">
        <h3>Последние раунды</h3>
        ${history.slice(0, 20).map(item => `
          <div class="minigame-history-row">
            <span>${this.describeRound(name, item)}</span>
            <small>${new Date(item.date).toLocaleString('ru-RU')}</small>
          </div>
        `).join('')}
      </section>
    `;
  },

  describeRound(name, item) {
    if (name === 'roulette') return `Рулетка · ${Utils.formatMoney(item.prize)}`;
    if (name === 'cases') return `${item.box} · ${item.number} · ${item.rarity}`;
    if (name === 'guess') return `Угадай цифру · серия ${item.streak} · ${item.won ? 'победа' : 'мимо'}`;
    if (name === 'mosaic') return `Мозаика · ${item.moves} ходов · ${item.won ? 'победа' : 'не собрана'}`;
    if (name === 'upgrade') return `Апгрейд · ${item.number} · ${item.won ? 'успех' : 'сгорел'}`;
    return 'Раунд';
  },
};

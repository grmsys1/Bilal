Screens.home = {
  current: null,
  rolling: false,
  rollTimers: [],
  upgrade: null,

  render(app) {
    this.restoreUpgrade();
    const roam = State.data.roaming;
    const countryInfo = roam.selectedCountry
      ? CONFIG.COUNTRIES.find(c => c.code === roam.selectedCountry)
      : null;
    const roamText = countryInfo
      ? `${countryInfo.flag} ${countryInfo.name}`
      : '🌍 Любая страна';
    const cost = Generator.spinCost(roam.selectedCountry || 'RU', roam.simClass);

    app.innerHTML = `
      <div class="card-slot" id="cardSlot">
        <div class="placeholder" style="color:var(--text-dim);text-align:center;">
          <div style="font-size:40px;">📱</div>
          Нажми «Крутить номер»,<br>чтобы получить новый
        </div>
      </div>
      <div class="action-row">
        <button class="btn btn-gold" id="spinBtn">🎰 Крутить · ${Utils.formatMoney(cost)}</button>
      </div>
      <div style="margin-top:10px;text-align:center;color:var(--text-dim);font-size:12px;">
        Роуминг: ${roamText} · Класс: ${Screens.roaming.simClassName(roam.simClass)}
      </div>
      ${this.renderUpgrade()}
    `;
    document.getElementById('spinBtn').onclick = () => this.spin();
    if (this.current && !this.rolling) this.showNumber(this.current);
    this.bindUpgrade();
  },

  renderUpgrade() {
    const items = State.data.collection || [];
    const multipliers = [
      { value: 1.2, chance: 85 },
      { value: 1.5, chance: 75 },
      { value: 2, chance: 60 },
      { value: 3, chance: 45 },
      { value: 5, chance: 30 },
      { value: 10, chance: 15 },
      { value: 25, chance: 6 },
      { value: 50, chance: 3 },
      { value: 100, chance: 1 },
    ];
    const isRunning = this.upgrade?.status === 'running';
    const resultClass = this.upgrade?.status === 'result'
      ? this.upgrade.won ? 'has-win' : 'has-loss'
      : '';

    return `
      <section class="upgrade-panel card ${isRunning ? 'is-running' : resultClass}">
        <h2>🎰 Апгрейд номера</h2>
        <p class="upgrade-description">Улучши номер из коллекции. При неудаче он сгорит.</p>
        <label class="upgrade-field">
          Номер
          <select id="upgradeNumber" ${isRunning ? 'disabled' : ''}>
            ${items.length
              ? items.map(item => `
                <option value="${item.id}">${item.formatted} · ${Utils.formatMoney(item.price)}</option>
              `).join('')
              : '<option value="">Коллекция пуста</option>'}
          </select>
        </label>
        <label class="upgrade-field">
          Множитель и шанс
          <select id="upgradeMultiplier" ${isRunning ? 'disabled' : ''}>
            ${multipliers.map(item => `
              <option value="${item.value}">${item.value}× · ${item.chance}%</option>
            `).join('')}
          </select>
        </label>
        <div class="upgrade-wheel ${isRunning ? 'is-spinning' : ''}" id="upgradeWheel" aria-live="polite">
          ${isRunning ? 'КРУТИМ' : 'ЗОЛОТО'}
        </div>
        ${isRunning
          ? '<button class="btn btn-outline" id="skipUpgradeBtn" style="width:100%;">⏭ Скип</button>'
          : `<button class="btn btn-gold" id="upgradeBtn" style="width:100%;" ${items.length ? '' : 'disabled'}>✨ Улучшить номер</button>`}
        ${this.upgrade?.status === 'result'
          ? `<div class="upgrade-result ${this.upgrade.won ? 'is-win' : 'is-loss'}">${this.upgrade.message}</div>`
          : ''}
      </section>
    `;
  },

  bindUpgrade() {
    const button = document.getElementById('upgradeBtn');
    if (button) button.onclick = () => this.startUpgrade();
    const skipButton = document.getElementById('skipUpgradeBtn');
    if (skipButton) skipButton.onclick = () => this.finishUpgrade(true);
  },

  spin() {
    if (this.rolling) return;
    const roam = State.data.roaming;
    const countryCode = roam.selectedCountry || Utils.pick(CONFIG.COUNTRIES).code;
    const cost = Generator.spinCost(countryCode, roam.simClass);
    if (State.data.balance < cost) {
      Utils.toast('Недостаточно средств');
      return;
    }
    State.changeBalance(-cost);
    const num = Generator.generate(countryCode, roam.simClass);
    this.current = num;
    if (!State.data.profile.bestFind || num.price > State.data.profile.bestFind.price) {
      State.data.profile.bestFind = { formatted: num.formatted, price: num.price, rarity: num.rarityName };
    }
    State.recordAction('spin');
    State.save();
    this.startRoll(num);
  },

  startRoll(num) {
    const slot = document.getElementById('cardSlot');
    if (!slot) return;
    this.rolling = true;
    const animationMode = State.data.settings.animation;
    if (animationMode === 'off') {
      this.rolling = false;
      this.showNumber(num);
      return;
    }
    const baseDuration = ['legendary', 'mythic', 'premium_elite'].includes(num.rarity) ? 2000 : 1500;
    const duration = animationMode === 'short' ? Math.round(baseDuration / 2) : baseDuration;
    const digitReels = num.digits.split('').map((digit, index) => {
      const finalIndex = 20 + Number(digit);
      const startIndex = finalIndex + 12 + Utils.random(0, 8);
      const delay = Math.floor(index * duration / Math.max(num.digits.length, 1));
      const reel = Array.from({ length: 60 }, (_, i) => i % 10).join('<br>');
      return `
        <span class="digit-reel">
          <span class="digit-reel-track" data-target="${finalIndex}" data-start="${startIndex}"
                style="transition-duration:${Math.max(250, duration - delay)}ms;transition-delay:${delay}ms;">${reel}</span>
        </span>
      `;
    });
    const numberParts = [];
    for (let i = 0; i < digitReels.length; i += 3) {
      numberParts.push(digitReels.slice(i, i + 3).join(''));
    }
    slot.innerHTML = `
      <div class="country-label">${num.flag} ${num.countryName} · ${num.operator}</div>
      <div class="number-display number-reels ${num.rarityCls}" aria-label="${num.formatted}">
        <span class="dial-prefix">${num.dial}</span>
        ${numberParts.map((part, index) => `
          ${index ? '<span class="number-separator"> </span>' : ''}
          <span class="digit-group">${part}</span>
        `).join('')}
      </div>
      <button class="btn btn-outline" id="skipRollBtn" style="margin-top:12px;">⏭ Показать сразу</button>
    `;
    const animateReels = () => {
      slot.querySelectorAll('.digit-reel-track').forEach(track => {
        track.style.transform = `translateY(-${track.dataset.start * 1.4}em)`;
        requestAnimationFrame(() => {
          track.style.transform = `translateY(-${track.dataset.target * 1.4}em)`;
        });
      });
    };
    requestAnimationFrame(animateReels);
    document.getElementById('skipRollBtn').onclick = () => this.finishRoll();
    this.rollTimers.push(setTimeout(() => this.finishRoll(), duration + 100));
  },

  finishRoll() {
    this.rollTimers.forEach(timer => clearTimeout(timer));
    this.rollTimers = [];
    this.rolling = false;
    if (this.current) this.showNumber(this.current);
  },

  showNumber(num) {
    const slot = document.getElementById('cardSlot');
    if (!slot) return;
    slot.innerHTML = `
      <div class="country-label">${num.flag} ${num.countryName} · ${num.operator}</div>
      <div class="number-display ${num.rarityCls} number-reveal">${num.formatted}</div>
      <div class="${num.rarityCls} rarity-reveal" style="font-weight:700;">${num.rarityName}</div>
      <div class="number-price">${Utils.formatMoney(num.price)}</div>
      <div class="action-row" style="width:100%;margin-top:16px;">
        <button class="btn btn-success" id="keepBtn">✓ Оставить</button>
        <button class="btn btn-danger" id="sellBtn">💰 Продать</button>
        <button class="btn btn-gold" id="barterBtn">🤝 Оформить</button>
      </div>
    `;
    document.getElementById('keepBtn').onclick = () => this.keep();
    document.getElementById('sellBtn').onclick = () => this.sell();
    document.getElementById('barterBtn').onclick = () => this.barter();
  },

  startUpgrade() {
    if (this.upgrade?.status === 'running') return;
    const numberId = document.getElementById('upgradeNumber')?.value;
    const multiplier = Number(document.getElementById('upgradeMultiplier')?.value);
    const source = State.data.collection.find(item => item.id === numberId);
    const options = [
      { value: 1.2, chance: 85 }, { value: 1.5, chance: 75 },
      { value: 2, chance: 60 }, { value: 3, chance: 45 },
      { value: 5, chance: 30 }, { value: 10, chance: 15 },
      { value: 25, chance: 6 }, { value: 50, chance: 3 },
      { value: 100, chance: 1 },
    ];
    const option = options.find(item => item.value === multiplier);
    if (!source || !option) {
      Utils.toast('Выбери номер и множитель');
      return;
    }

    const won = Math.random() * 100 < option.chance;
    let upgraded = null;
    if (won) {
      upgraded = Generator.generate(source.country, State.data.roaming.simClass);
      upgraded.price = Math.round(source.price * multiplier);
    }
    this.upgrade = {
      status: 'running',
      sourceId: source.id,
      multiplier,
      won,
      upgraded,
      startedAt: Date.now(),
      duration: State.data.settings.animation === 'off' ? 0 : State.data.settings.animation === 'short' ? 1200 : 3000,
      id: Utils.uid(),
      message: '',
      timer: null,
    };
    State.data.minigames.upgrade.pending = {
      status: 'running',
      sourceId: this.upgrade.sourceId,
      multiplier: this.upgrade.multiplier,
      won: this.upgrade.won,
      upgraded: this.upgrade.upgraded,
      startedAt: this.upgrade.startedAt,
      duration: this.upgrade.duration,
      id: this.upgrade.id,
    };
    State.save();
    this.renderUpgradeHost();
    this.scheduleUpgradeFinish();
  },

  restoreUpgrade() {
    const pending = State.data.minigames.upgrade.pending;
    if (!this.upgrade && pending?.status === 'running') {
      this.upgrade = { ...pending, message: '', timer: null };
    }
    this.scheduleUpgradeFinish();
  },

  scheduleUpgradeFinish() {
    if (!this.upgrade || this.upgrade.status !== 'running' || this.upgrade.timer) return;
    const elapsed = Date.now() - this.upgrade.startedAt;
    const remaining = Math.max(0, this.upgrade.duration - elapsed);
    this.upgrade.timer = setTimeout(() => this.finishUpgrade(false), remaining);
  },

  finishUpgrade(skipped) {
    if (!this.upgrade || this.upgrade.status !== 'running') return;
    clearTimeout(this.upgrade.timer);
    const attempt = this.upgrade;
    const source = State.data.collection.find(item => item.id === attempt.sourceId);
    if (!source) {
      this.upgrade = null;
      State.data.minigames.upgrade.pending = null;
      State.save();
      Utils.toast('Номер для апгрейда больше не найден');
      if (this.isVisible()) this.render(document.getElementById('app'));
      return;
    }

    State.removeFromCollection(source.id, false);
    if (attempt.won) {
      State.addToCollection(attempt.upgraded, false);
      if (!State.data.profile.bestFind || attempt.upgraded.price > State.data.profile.bestFind.price) {
        State.data.profile.bestFind = {
          formatted: attempt.upgraded.formatted,
          price: attempt.upgraded.price,
          rarity: attempt.upgraded.rarityName,
        };
      }
      attempt.message = `✨ Успех! ${attempt.upgraded.formatted} · ${Utils.formatMoney(attempt.upgraded.price)}`;
      State.addHistory({
        type: 'upgrade_won',
        number: attempt.upgraded.formatted,
        price: attempt.upgraded.price,
        rarity: attempt.upgraded.rarityName,
      }, false);
    } else {
      attempt.message = `💥 Неудача — ${source.formatted} сгорел`;
      State.addHistory({
        type: 'upgrade_lost',
        number: source.formatted,
        price: source.price,
        rarity: source.rarityName,
      }, false);
    }
    State.addMinigameHistory('upgrade', {
      id: attempt.id,
      number: attempt.upgraded?.formatted || source.formatted,
      won: attempt.won,
      multiplier: attempt.multiplier,
    }, false);
    State.data.minigames.upgrade.pending = null;
    State.recordAction('upgrade');
    Screens.profile.checkAchievements();
    attempt.status = 'result';
    Utils.toast(skipped ? `Результат: ${attempt.message}` : attempt.message);
    this.renderUpgradeHost();
  },

  isVisible() {
    return document.querySelector('.bottom-nav button.active')?.dataset.screen === 'home';
  },

  renderUpgradeHost() {
    if (this.isVisible()) this.render(document.getElementById('app'));
    else if (Screens.minigames?.isVisible()) Screens.minigames.render(document.getElementById('app'));
  },

  keep() {
    if (!this.current) return;
    try {
      // ЯВНО добавляем в коллекцию и сохраняем
      State.data.collection.unshift(this.current);
      State.data.opened = (State.data.opened || 0) + 1;
      State.recordAction('keep');
      State.addXP(5);
      State.levelUpCheck(this.current.price);
      State.addHistory({
        type: 'kept',
        number: this.current.formatted,
        price: this.current.price,
        rarity: this.current.rarityName
      });
      Screens.profile.checkAchievements();
      State.save(); // жёсткое сохранение

      Utils.toast(`✅ Сохранён: ${this.current.formatted}`);
      console.log('Коллекция после сохранения:', State.data.collection);
      this.current = null;
      this.render(document.getElementById('app'));
    } catch (e) {
      console.error('Ошибка при сохранении:', e);
      Utils.toast('Ошибка сохранения — открой консоль');
    }
  },

  sell() {
    if (!this.current) return;
    const price = this.current.price;
    State.changeBalance(price);
    State.data.earned = (State.data.earned || 0) + price;
    State.data.opened = (State.data.opened || 0) + 1;
    State.recordAction('sell');
    State.addXP(3);
    State.addHistory({
      type: 'sold',
      number: this.current.formatted,
      price,
      rarity: this.current.rarityName
    });
    Screens.profile.checkAchievements();
    Utils.toast(`💰 Продано за ${Utils.formatMoney(price)}`);
    this.current = null;
    this.render(document.getElementById('app'));
  },

  barter() {
    if (!this.current) return;
    const factor = 0.8 + Math.random() * 0.6;
    const offer = Math.round(this.current.price * factor / 100) * 100;
    UI.confirm(`Барыга предлагает ${Utils.formatMoney(offer)}. Согласен?`, () => {
      State.changeBalance(offer);
      State.data.earned = (State.data.earned || 0) + offer;
      State.data.opened = (State.data.opened || 0) + 1;
      State.recordAction('sell');
      State.addXP(4);
      State.addHistory({
        type: 'barter',
        number: this.current.formatted,
        price: offer,
        rarity: this.current.rarityName
      });
      Screens.profile.checkAchievements();
      Utils.toast(`🤝 Сделка: +${Utils.formatMoney(offer)}`);
      this.current = null;
      this.render(document.getElementById('app'));
    });
  },
};
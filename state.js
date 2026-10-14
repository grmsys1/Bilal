const State = {
  data: null,

  init() {
    const saved = Utils.load();
    if (saved) {
      this.data = Object.assign(this.defaults(), saved);
      if (!Array.isArray(this.data.collection)) this.data.collection = [];
      if (!Array.isArray(this.data.history)) this.data.history = [];
      if (!Array.isArray(this.data.phones)) this.data.phones = [];
      this.data.settings = Object.assign({
        theme: 'dark', animation: 'full', sounds: true, vibration: true, notifications: true,
      }, this.data.settings || {});
      if (!['full', 'short', 'off'].includes(this.data.settings.animation)) {
        this.data.settings.animation = 'full';
      }
      this.data.roaming = Object.assign({ selectedCountry: null, simClass: 'standard' }, this.data.roaming || {});
      this.data.profile = Object.assign(this.defaultProfile(), this.data.profile || {});
      this.data.profile.id = this.data.profile.id || this.generatePlayerId();
      this.data.profile.registeredAt = this.data.profile.registeredAt || Date.now();
      this.data.profile.achievements = Object.assign({}, this.data.profile.achievements || {});
      const pastFinds = [
        ...this.data.collection,
        ...this.data.history.filter(item => item.number && item.price > 0),
      ];
      pastFinds.forEach(item => {
        if (!this.data.profile.bestFind || item.price > this.data.profile.bestFind.price) {
          this.data.profile.bestFind = { formatted: item.formatted || item.number, price: item.price, rarity: item.rarityName || item.rarity };
        }
      });
      this.data.minigames = Object.assign(this.defaultMinigames(), this.data.minigames || {});
      Object.keys(this.defaultMinigames()).forEach(key => {
        this.data.minigames[key] = Object.assign(this.defaultMinigames()[key], this.data.minigames[key] || {});
        if (!Array.isArray(this.data.minigames[key].history)) this.data.minigames[key].history = [];
        this.data.minigames[key].history = this.data.minigames[key].history.slice(0, 20);
      });
      this.data.rating = Object.assign({ npcs: [], lastUpdate: '' }, this.data.rating || {});
      this.data.friends = Array.isArray(this.data.friends) ? this.data.friends : [];
      this.data.showcase = Array.isArray(this.data.showcase) ? this.data.showcase.slice(0, 3) : [];
      this.data.cosmetics = Object.assign({ cardSkin: 'classic', frame: 'classic', keys: 0 }, this.data.cosmetics || {});
      this.data.taskStats = Object.assign({}, this.data.taskStats || {});
      this.data.notifications = Array.isArray(this.data.notifications) ? this.data.notifications : [];
      this.data.season = Object.assign({ period: '', claimed: [] }, this.data.season || {});
      if (!Array.isArray(this.data.season.claimed)) this.data.season.claimed = [];
      this.ensureDailyQuests();
      this.ensureRating();
      document.documentElement.setAttribute('data-theme', this.data.settings?.theme || 'dark');
      document.documentElement.setAttribute('data-animations', this.data.settings.animation);
      this.save();
    } else {
      this.data = this.defaults();
      this.data.profile.id = this.generatePlayerId();
      this.data.profile.registeredAt = Date.now();
      this.ensureDailyQuests();
      this.ensureRating();
      document.documentElement.setAttribute('data-animations', this.data.settings.animation);
      this.save();
    }
  },

  defaultProfile() {
    return {
      id: '',
      nickname: 'Player',
      avatar: '',
      registeredAt: 0,
      nicknameChangedAt: 0,
      bestFind: null,
      achievements: {},
    };
  },

  generatePlayerId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Utils.random(0, chars.length - 1)]).join('');
    return `CFR-${segment()}-${segment()}`;
  },

  defaultMinigames() {
    return {
      upgrade: { history: [], pending: null },
      roulette: { history: [], lastFreeDate: '', pending: null },
      cases: { history: [], pending: null },
      guess: { history: [] },
      mosaic: { history: [] },
    };
  },

  ensureDailyQuests() {
    const today = new Date().toLocaleDateString('en-CA');
    if (this.data.dailyQuests?.date === today && Array.isArray(this.data.dailyQuests.tasks)) return;
    this.data.dailyQuests = {
      date: today,
      tasks: [
        { id: 'spin', title: 'Выбить 3 номера', action: 'spin', goal: 3, progress: 0, reward: 2500, claimed: false },
        { id: 'keep', title: 'Сохранить 2 номера', action: 'keep', goal: 2, progress: 0, reward: 3000, claimed: false },
        { id: 'sell', title: 'Продать номер', action: 'sell', goal: 1, progress: 0, reward: 3000, claimed: false },
        { id: 'roulette', title: 'Сыграть в рулетку', action: 'roulette', goal: 1, progress: 0, reward: 2500, claimed: false },
        { id: 'case', title: 'Открыть кейс', action: 'case', goal: 1, progress: 0, reward: 3500, claimed: false },
        { id: 'guess', title: 'Сыграть в угадай цифру', action: 'guess', goal: 1, progress: 0, reward: 2500, claimed: false },
        { id: 'upgrade', title: 'Попробовать апгрейд', action: 'upgrade', goal: 1, progress: 0, reward: 4000, claimed: false },
      ],
    };
    this.save();
  },

  ensureRating() {
    const today = new Date().toLocaleDateString('en-CA');
    const names = [
      'GoldenFox', 'LuckyByte', 'NumberKing', 'NeonWolf', 'SilverStar', 'FastDigits',
      'MisterSeven', 'RubyLine', 'NightOwl', 'BigSignal', 'PixelQueen', 'LuckyCat',
      'DigitalAce', 'GoldRush', 'QuietStorm', 'BlueComet', 'RedPanda', 'TopSignal',
      'MoonRider', 'QuickDraw', 'StarCaller', 'NovaLine', 'BlackTiger', 'ZeroHero',
      'BrightMind', 'CoinPilot', 'WildCard', 'SkyNumber', 'IronPixel', 'GoldenBee',
    ];
    if (!Array.isArray(this.data.rating.npcs) || this.data.rating.npcs.length !== 30) {
      this.data.rating.npcs = names.map((name, index) => ({
        id: `NPC-${String(index + 1).padStart(3, '0')}`,
        name,
        avatar: ['🦊', '🐺', '🐱', '🦉', '🐯', '🐼'][index % 6],
        balance: Utils.random(10000, 3000000),
        earned: Utils.random(50000, 10000000),
        bestFind: Utils.random(10000, 1500000),
        collectionValue: Utils.random(50000, 4000000),
        level: Utils.random(1, 120),
        achievementsCount: Utils.random(0, 15),
      }));
      this.data.rating.lastUpdate = today;
      return;
    }
    this.data.rating.npcs.forEach((npc, index) => {
      const template = {
        id: `NPC-${String(index + 1).padStart(3, '0')}`,
        name: `Игрок${index + 1}`,
        avatar: '👤',
        balance: 0,
        earned: 0,
        bestFind: 0,
        collectionValue: 0,
        level: 1,
        achievementsCount: 0,
      };
      Object.keys(template).forEach(key => {
        if (npc[key] === undefined) npc[key] = template[key];
      });
    });
    if (this.data.rating.lastUpdate !== today) {
      this.data.rating.npcs.forEach(npc => {
        npc.earned = Math.max(0, Math.round(npc.earned * (0.9 + Math.random() * 0.2)));
        npc.balance = Math.max(0, Math.round(npc.balance * (0.9 + Math.random() * 0.2)));
        if (Math.random() < 0.35) npc.bestFind = Math.max(npc.bestFind, Utils.random(10000, 2000000));
      });
      this.data.rating.lastUpdate = today;
    }
  },

  defaults() {
    return {
      balance: CONFIG.START_BALANCE,
      level: 1,
      xp: 0,
      opened: 0,
      earned: 0,
      spent: 0,
      collection: [],
      history: [],
      settings: { theme: 'dark', animation: 'full', sounds: true, vibration: true, notifications: true },
      roaming: { selectedCountry: null, simClass: 'standard' },
      crash: { lastGames: [], balance: 0 },
      phones: [],
      lastBonusAt: 0,
      lastDailyAt: 0,
      profile: this.defaultProfile(),
      minigames: this.defaultMinigames(),
      rating: { npcs: [], lastUpdate: '' },
      friends: [],
      showcase: [],
      cosmetics: { cardSkin: 'classic', frame: 'classic', keys: 0 },
      taskStats: {},
      dailyQuests: null,
      notifications: [],
      season: { period: '', claimed: [] },
    };
  },

  save() {
    Utils.save(this.data);
  },

  addHistory(entry, shouldSave) {
    this.data.history.unshift({ ...entry, date: Date.now() });
    if (this.data.history.length > 300) this.data.history.length = 300;
    if (shouldSave !== false) this.save();
  },

  addMinigameHistory(name, entry, shouldSave) {
    if (!this.data.minigames[name]) this.data.minigames[name] = { history: [] };
    this.data.minigames[name].history.unshift({ ...entry, date: Date.now() });
    this.data.minigames[name].history.length = Math.min(this.data.minigames[name].history.length, 20);
    if (shouldSave !== false) this.save();
  },

  recordAction(action, amount, shouldSave) {
    this.data.taskStats[action] = (this.data.taskStats[action] || 0) + (amount || 1);
    const quests = this.data.dailyQuests?.tasks || [];
    quests.forEach(task => {
      if (task.action === action && task.progress < task.goal) {
        task.progress = Math.min(task.goal, task.progress + (amount || 1));
        if (task.progress === task.goal && !task.claimed) this.notify(`🎁 Задание готово: ${task.title}`);
      }
    });
    if (shouldSave !== false) this.save();
  },

  notify(message) {
    const item = { id: Utils.uid(), message, date: Date.now(), read: false };
    this.data.notifications.unshift(item);
    this.data.notifications.length = Math.min(this.data.notifications.length, 50);
    this.save();
    if (this.data.settings.notifications !== false) Utils.toast(message);
  },

  addToCollection(item, shouldSave) {
    this.data.collection.unshift(item);  // новые сверху
    if (shouldSave !== false) this.save();
  },

  removeFromCollection(id, shouldSave) {
    const i = this.data.collection.findIndex(x => x.id === id);
    if (i >= 0) {
      this.data.collection.splice(i, 1);
      if (shouldSave !== false) this.save();
      return true;
    }
    return false;
  },

  changeBalance(delta, shouldSave) {
    this.data.balance += delta;
    if (delta < 0) this.data.spent += -delta;
    if (this.data.balance < CONFIG.LOW_BALANCE_THRESHOLD && this.data.balance >= 0) {
      const now = Date.now();
      if (now - (this.data.lastBonusAt || 0) > 60000) {
        this.data.balance += CONFIG.LOW_BALANCE_BONUS;
        this.data.lastBonusAt = now;
        this.notify(`💸 Бонус за низкий баланс: +${Utils.formatMoney(CONFIG.LOW_BALANCE_BONUS)}`);
      }
    }
    if (this.data.balance < 0) this.data.balance = 0;
    if (shouldSave !== false) this.save();
    UI.updateTopbar();
  },

  levelUpCheck(price) {
    if (price >= CONFIG.LEVEL_PRICE_THRESHOLD && this.data.level < CONFIG.MAX_LEVEL) {
      this.data.level++;
      this.data.xp += 10;
      this.save();
      UI.updateTopbar();
      Utils.toast(`⬆️ Уровень повышен: ${this.data.level}!`);
    }
  },

  addXP(amount) {
    this.data.xp += amount;
    // простая прогрессия: каждые 100 XP — уровень
    while (this.data.xp >= 100 && this.data.level < CONFIG.MAX_LEVEL) {
      this.data.xp -= 100;
      this.data.level++;
      Utils.toast(`⬆️ Уровень повышен: ${this.data.level}!`);
    }
    this.save();
    UI.updateTopbar();
  },

  dailyBonus() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    if (now - (this.data.lastDailyAt || 0) < day) {
      const left = day - (now - this.data.lastDailyAt);
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      Utils.toast(`Следующий бонус через ${h}ч ${m}м`);
      return false;
    }
    const bonus = 5000 + this.data.level * 500;
    this.data.lastDailyAt = now;
    this.changeBalance(bonus);
    this.notify(`🎁 Ежедневный бонус: +${Utils.formatMoney(bonus)}`);
    return true;
  },
};
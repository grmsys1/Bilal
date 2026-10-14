const Generator = {
  // Выбор редкости с учётом класса SIM и страны
  pickRarity(simClassKey) {
    const cls = CONFIG.SIM_CLASSES.find(c => c.key === simClassKey) || CONFIG.SIM_CLASSES[0];
    const boosted = CONFIG.RARITIES.map(r => ({
      ...r,
      weight: r.weight * (r.key === 'common' ? 1 : cls.mult),
    }));
    const total = boosted.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * total;
    for (const r of boosted) {
      roll -= r.weight;
      if (roll <= 0) return r;
    }
    return boosted[0];
  },

  // Генерация цифр номера — чем выше редкость, тем больше паттернов
  generateDigits(country, rarity) {
    const len = country.digits;
    const tier = CONFIG.RARITIES.indexOf(rarity);
    const patternChance = 0.15 + tier * 0.12;

    if (Math.random() < patternChance) {
      const patterns = ['repeat', 'pair', 'mirror', 'sequence', 'tail'];
      const p = Utils.pick(patterns);
      const d = Utils.random(1, 9);

      if (p === 'repeat') {
        return String(d).repeat(len);
      }
      if (p === 'pair') {
        const pair = String(d) + (d % 9 + 1);
        let s = '';
        while (s.length < len) s += pair;
        return s.slice(0, len);
      }
      if (p === 'mirror') {
        const half = Math.ceil(len / 2);
        let h = '';
        for (let i = 0; i < half; i++) h += Utils.random(0, 9);
        return (h + h.split('').reverse().join('')).slice(0, len);
      }
      if (p === 'sequence') {
        let s = '', cur = d;
        for (let i = 0; i < len; i++) { s += cur; cur = cur % 9 + 1; }
        return s;
      }
      if (p === 'tail') {
        const tailLen = Math.min(4 + tier, len);
        const tail = String(d).repeat(tailLen);
        let prefix = '';
        for (let i = 0; i < len - tail.length; i++) prefix += Utils.random(0, 9);
        return (prefix + tail).slice(0, len);
      }
    }

    let s = '';
    for (let i = 0; i < len; i++) s += Utils.random(0, 9);
    return s;
  },

  // Оценка красоты и цены
  score(digits, rarity) {
    let score = 0;
    const counts = {};
    for (const ch of digits) counts[ch] = (counts[ch] || 0) + 1;
    const maxRepeat = Math.max(...Object.values(counts));
    score += maxRepeat * 12;
    for (const ch in counts) if (counts[ch] >= 2) score += 8;
    score += (10 - Object.keys(counts).length) * 5;
    score += CONFIG.RARITIES.indexOf(rarity) * 30;
    return score;
  },

  price(digits, rarity, country, simClassKey) {
    const cls = CONFIG.SIM_CLASSES.find(c => c.key === simClassKey) || CONFIG.SIM_CLASSES[0];
    const s = this.score(digits, rarity);
    const base = country.basePrice + s * 50;
    const price = base * rarity.mult * cls.priceMult;
    return Math.round(price / 100) * 100;
  },

  // Полная генерация
  generate(countryCode, simClassKey) {
    const country = CONFIG.COUNTRIES.find(c => c.code === countryCode) || Utils.pick(CONFIG.COUNTRIES);
    const rarity = this.pickRarity(simClassKey);
    const digits = this.generateDigits(country, rarity);
    const formatted = Utils.formatNumber(country.dial, digits);
    const price = this.price(digits, rarity, country, simClassKey);

    return {
      id: Utils.uid(),
      country: country.code,
      countryName: country.name,
      flag: country.flag,
      dial: country.dial,
      digits,
      formatted,
      rarity: rarity.key,
      rarityName: rarity.name,
      rarityCls: rarity.cls,
      price,
      operator: Utils.pick(country.operators),
      date: Date.now(),
    };
  },

  // Стоимость прокрута для страны с учётом класса
  spinCost(countryCode, simClassKey) {
    const country = CONFIG.COUNTRIES.find(c => c.code === countryCode);
    const cls = CONFIG.SIM_CLASSES.find(c => c.key === simClassKey) || CONFIG.SIM_CLASSES[0];
    if (!country) return 500;
    return Math.round(country.basePrice * cls.priceMult / 10) * 10;
  },
};
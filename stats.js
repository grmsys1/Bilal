Screens.stats = {
  render(app) {
    const history = State.data.history || [];
    const totals = {};
    const rarities = {};
    const countries = {};
    const incomeTypes = new Set([
      'sold', 'barter', 'roulette', 'guess', 'mosaic', 'daily_quest', 'season_reward',
    ]);
    history.forEach(item => {
      if (item.price > 0 && incomeTypes.has(item.type)) totals[item.type] = (totals[item.type] || 0) + item.price;
      if (item.rarity) rarities[item.rarity] = (rarities[item.rarity] || 0) + 1;
    });
    (State.data.collection || []).forEach(item => {
      countries[item.countryName] = (countries[item.countryName] || 0) + 1;
    });
    const maxRevenue = Math.max(1, ...Object.values(totals));
    const maxRarity = Math.max(1, ...Object.values(rarities));
    const recent = history.slice(0, 7).reverse();

    app.innerHTML = `
      <h2>📊 Статистика</h2>
      <div class="profile-stats">
        <div class="stat-box"><b>${Utils.formatMoney(State.data.earned)}</b><small>Всего заработано</small></div>
        <div class="stat-box"><b>${Utils.formatMoney(State.data.spent)}</b><small>Всего потрачено</small></div>
        <div class="stat-box"><b>${State.data.opened}</b><small>Открыто номеров</small></div>
        <div class="stat-box"><b>${State.data.collection.length}</b><small>В коллекции</small></div>
      </div>
      <section class="card chart-card">
        <h3>Доходы по операциям</h3>
        ${Object.keys(totals).length ? Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([label, value]) => `
          <div class="chart-row"><span>${this.escape(label)}</span><div class="chart-track"><i style="width:${value / maxRevenue * 100}%"></i></div><b>${Utils.formatMoney(value)}</b></div>
        `).join('') : '<div class="empty-state">Пока нет доходов</div>'}
      </section>
      <section class="card chart-card">
        <h3>Найденные редкости</h3>
        ${Object.keys(rarities).length ? Object.entries(rarities).sort((a, b) => b[1] - a[1]).map(([label, value]) => `
          <div class="chart-row"><span>${this.escape(label)}</span><div class="chart-track"><i style="width:${value / maxRarity * 100}%"></i></div><b>${value}</b></div>
        `).join('') : '<div class="empty-state">Ещё нет найденных номеров</div>'}
      </section>
      <section class="card chart-card">
        <h3>Страны в коллекции</h3>
        ${Object.keys(countries).length ? Object.entries(countries).sort((a, b) => b[1] - a[1]).map(([label, value]) => `
          <div class="chart-row"><span>${this.escape(label)}</span><div class="chart-track"><i style="width:${value / Math.max(...Object.values(countries)) * 100}%"></i></div><b>${value}</b></div>
        `).join('') : '<div class="empty-state">Коллекция пуста</div>'}
      </section>
      <section class="card chart-card">
        <h3>Последние операции</h3>
        ${recent.length ? recent.map(item => `
          <div class="minigame-history-row"><span>${this.escape(item.number || item.type)}</span><b>${Utils.formatMoney(item.price || 0)}</b></div>
        `).join('') : '<div class="empty-state">История пуста</div>'}
      </section>
    `;
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  },
};

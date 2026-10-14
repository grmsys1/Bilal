Screens.rating = {
  category: 'balance',
  categories: [
    { id: 'balance', label: '💎 Самый богатый' },
    { id: 'earned', label: '💰 Больше всех заработал' },
    { id: 'collectionValue', label: '📱 Лучшая коллекция' },
    { id: 'profileScore', label: '⭐ Лучший профиль' },
  ],

  render(app) {
    State.ensureRating();
    const data = State.data;
    const player = {
      id: data.profile.id,
      name: data.profile.nickname,
      avatar: data.profile.avatar || '👤',
      balance: data.balance,
      earned: data.earned,
      bestFind: data.profile.bestFind?.price || 0,
      collectionValue: data.collection.reduce((sum, item) => sum + (item.price || 0), 0),
      level: data.level,
      achievementsCount: Object.keys(data.profile.achievements).length,
      isPlayer: true,
    };
    const entries = [...data.rating.npcs, player].map(entry => ({
      ...entry,
      profileScore: entry.level * 1000 + entry.achievementsCount * 5000 + entry.bestFind,
    }));
    entries.sort((left, right) => right[this.category] - left[this.category]);
    const category = this.categories.find(item => item.id === this.category);

    app.innerHTML = `
      <h2>🏆 Рейтинг игроков</h2>
      <p class="screen-description">NPC обновляются раз в сутки · ${data.rating.lastUpdate}</p>
      <div class="rating-tabs">
        ${this.categories.map(item => `
          <button class="rating-tab ${item.id === this.category ? 'active' : ''}" data-rating="${item.id}">${item.label}</button>
        `).join('')}
      </div>
      <section class="card rating-board">
        <h3>${category.label}</h3>
        ${entries.map((entry, index) => {
          const medal = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
          const icon = entry.avatar.startsWith('data:') ? `<img src="${entry.avatar}" alt="">` : entry.avatar;
          return `<div class="rating-row ${entry.isPlayer ? 'is-player' : ''}">
            <span class="rating-place">${medal}</span>
            <span class="rating-avatar">${icon}</span>
            <span class="rating-name"><b>${this.escape(entry.name)}</b>${entry.isPlayer ? '<small>Это вы</small>' : ''}</span>
            <strong>${this.formatScore(entry[this.category])}</strong>
          </div>`;
        }).join('')}
      </section>
    `;
    app.querySelectorAll('[data-rating]').forEach(button => {
      button.onclick = () => {
        this.category = button.dataset.rating;
        this.render(app);
      };
    });
  },

  formatScore(value) {
    return this.category === 'profileScore'
      ? Math.round(value).toLocaleString('ru-RU')
      : Utils.formatMoney(value);
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  },
};

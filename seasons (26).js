Screens.seasons = {
  rewards: [
    { level: 1, type: 'money', amount: 5000, label: '5 000 ₽' },
    { level: 2, type: 'money', amount: 15000, label: '15 000 ₽' },
    { level: 3, type: 'key', amount: 1, label: '🔑 Ключ' },
    { level: 4, type: 'money', amount: 40000, label: '40 000 ₽' },
    { level: 5, type: 'money', amount: 100000, label: '100 000 ₽' },
  ],

  render(app) {
    const season = State.data.season;
    const currentPeriod = this.period();
    if (season.period !== currentPeriod) {
      State.data.season = { period: currentPeriod, claimed: [] };
      State.save();
    }
    const points = State.data.opened * 10
      + State.data.minigames.cases.history.length * 5
      + State.data.minigames.roulette.history.length * 5
      + State.data.minigames.mosaic.history.filter(item => item.won).length * 20;
    const level = Math.min(5, Math.floor(points / 20) + 1);
    app.innerHTML = `
      <h2>🏆 Сезонный пропуск</h2>
      <p class="screen-description">Сезон ${currentPeriod} · Прогресс сезонного опыта: ${points} XP</p>
      <section class="card season-banner">
        <h3>Золотой сезон</h3>
        <p>Играй в мини-игры и собирай номера, чтобы открыть награды.</p>
        <div class="season-progress"><span style="width:${Math.min(100, (points % 20) * 5)}%"></span></div>
        <b>Уровень пропуска ${level} / 5</b>
      </section>
      <div class="season-rewards">
        ${this.rewards.map(item => {
          const claimed = season.claimed.includes(item.level);
          const unlocked = level >= item.level;
          return `<article class="card season-reward ${unlocked ? 'unlocked' : ''}">
            <div><b>Уровень ${item.level}</b><small>${item.label}</small></div>
            <button class="btn ${claimed ? 'btn-outline' : 'btn-gold'}" data-season-claim="${item.level}" ${!unlocked || claimed ? 'disabled' : ''}>
              ${claimed ? '✓ Получено' : 'Забрать'}
            </button>
          </article>`;
        }).join('')}
      </div>
    `;
    app.querySelectorAll('[data-season-claim]').forEach(button => {
      button.onclick = () => this.claim(Number(button.dataset.seasonClaim));
    });
  },

  period() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  claim(level) {
    const reward = this.rewards.find(item => item.level === level);
    const season = State.data.season;
    if (!reward || season.claimed.includes(level)) return;
    const points = State.data.opened * 10
      + State.data.minigames.cases.history.length * 5
      + State.data.minigames.roulette.history.length * 5
      + State.data.minigames.mosaic.history.filter(item => item.won).length * 20;
    if (Math.min(5, Math.floor(points / 20) + 1) < level) return;
    season.claimed.push(level);
    if (reward.type === 'money') {
      State.changeBalance(reward.amount);
      State.data.earned += reward.amount;
    } else {
      State.data.cosmetics.keys += reward.amount;
    }
    State.addHistory({ type: 'season_reward', number: `Сезон · уровень ${level}`, price: reward.type === 'money' ? reward.amount : 0, rarity: 'Награда' });
    State.notify(`🏆 Получена сезонная награда: ${reward.label}`);
    this.render(document.getElementById('app'));
  },
};

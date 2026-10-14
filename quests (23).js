Screens.quests = {
  render(app) {
    State.ensureDailyQuests();
    const quests = State.data.dailyQuests.tasks;
    const complete = quests.filter(item => item.claimed).length;
    app.innerHTML = `
      <h2>🎁 Ежедневные задания</h2>
      <p class="screen-description">Обновление ежедневно · Выполнено ${complete} / ${quests.length}</p>
      <div class="quest-list">
        ${quests.map(item => `
          <section class="card quest-row">
            <div class="quest-main">
              <b>${item.title}</b>
              <div class="quest-progress"><span style="width:${Math.min(100, item.progress / item.goal * 100)}%"></span></div>
              <small>${Math.min(item.progress, item.goal)} / ${item.goal} · Награда ${Utils.formatMoney(item.reward)}</small>
            </div>
            ${item.claimed
              ? '<button class="btn btn-outline" disabled>✓ Получено</button>'
              : `<button class="btn ${item.progress >= item.goal ? 'btn-gold' : 'btn-outline'}" data-claim="${item.id}" ${item.progress < item.goal ? 'disabled' : ''}>Забрать</button>`}
          </section>
        `).join('')}
      </div>
    `;
    app.querySelectorAll('[data-claim]').forEach(button => {
      button.onclick = () => this.claim(button.dataset.claim);
    });
  },

  claim(id) {
    const task = State.data.dailyQuests.tasks.find(item => item.id === id);
    if (!task || task.claimed || task.progress < task.goal) return;
    task.claimed = true;
    State.changeBalance(task.reward);
    State.data.earned += task.reward;
    State.addHistory({ type: 'daily_quest', number: task.title, price: task.reward, rarity: 'Награда' });
    State.notify(`🎁 Задание выполнено: +${Utils.formatMoney(task.reward)}`);
    this.render(document.getElementById('app'));
  },
};

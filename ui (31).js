const UI = {
  updateTopbar() {
    document.getElementById('balance').textContent = Utils.formatMoney(State.data.balance);
    document.getElementById('level').textContent = State.data.level;
  },

  setScreen(name) {
    document.querySelectorAll('.bottom-nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === name);
    });
    const app = document.getElementById('app');
    app.innerHTML = '';
    const screen = Screens[name];
    if (screen && screen.render) {
      screen.render(app);
    } else {
      app.innerHTML = `<div class="card"><h2>${name}</h2><p>Экран в разработке</p></div>`;
    }
    if (State.data.settings.animation !== 'off') {
      app.classList.remove('screen-enter');
      void app.offsetWidth;
      app.classList.add('screen-enter');
    }
  },

  openModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.add('show');
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
  },

  confirm(text, onYes, onNo) {
    this.openModal(`
      <h3 style="margin-bottom:12px;">${text}</h3>
      <div class="action-row">
        <button class="btn btn-outline" id="confirmNo">Отмена</button>
        <button class="btn btn-gold" id="confirmYes">Да</button>
      </div>
    `);
    document.getElementById('confirmNo').onclick = () => { this.closeModal(); onNo && onNo(); };
    document.getElementById('confirmYes').onclick = () => { this.closeModal(); onYes && onYes(); };
  },
};

// Реестр экранов
const Screens = {};
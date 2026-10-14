Screens.roaming = {
  render(app) {
    const roam = State.data.roaming;
    app.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">🌍 Роуминг</h2>
      <div style="margin-bottom:10px;display:flex;gap:8px;">
        <button class="btn btn-outline" id="simClassBtn">Сверка: ${this.simClassName(roam.simClass)}</button>
        <button class="btn btn-outline" id="anyBtn">Любая страна</button>
      </div>
      <div class="country-grid" id="countryGrid"></div>
    `;
    this.renderCountries();
    document.getElementById('simClassBtn').onclick = () => this.openSimClassModal();
    document.getElementById('anyBtn').onclick = () => {
      State.data.roaming.selectedCountry = null;
      State.save();
      this.renderCountries();
      Utils.toast('Выбрана случайная страна');
    };
  },

  simClassName(key) {
    const c = CONFIG.SIM_CLASSES.find(x => x.key === key);
    return c ? c.name : 'Стандарт';
  },

  renderCountries() {
    const grid = document.getElementById('countryGrid');
    if (!grid) return;
    const roam = State.data.roaming;
    grid.innerHTML = CONFIG.COUNTRIES.map(c => {
      const cost = Generator.spinCost(c.code, roam.simClass);
      const selected = roam.selectedCountry === c.code;
      return `
        <div class="country-item ${selected ? 'selected' : ''}" data-code="${c.code}">
          <div class="flag">${c.flag}</div>
          <div class="name">${c.name}</div>
          <div class="op">${c.operators[0]}</div>
          <div class="price">${Utils.formatMoney(cost)}</div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.country-item').forEach(el => {
      el.onclick = () => {
        State.data.roaming.selectedCountry = el.dataset.code;
        State.save();
        this.renderCountries();
      };
    });
  },

  openSimClassModal() {
    const roam = State.data.roaming;
    UI.openModal(`
      <h3 style="margin-bottom:12px;color:var(--gold);">Сверка — класс SIM</h3>
      <div id="simClassList">
        ${CONFIG.SIM_CLASSES.map(c => `
          <div class="sim-class-item ${c.key === roam.simClass ? 'selected' : ''}" data-key="${c.key}">
            <b>${c.name}</b>
            <small>${c.desc} · Множитель ×${c.mult}</small>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-outline" style="width:100%;margin-top:12px;" id="simClose">Закрыть</button>
    `);
    document.querySelectorAll('.sim-class-item').forEach(el => {
      el.onclick = () => {
        State.data.roaming.simClass = el.dataset.key;
        State.save();
        UI.closeModal();
        this.render(document.getElementById('app'));
        Utils.toast('Класс SIM: ' + this.simClassName(el.dataset.key));
      };
    });
    document.getElementById('simClose').onclick = () => UI.closeModal();
  },
};
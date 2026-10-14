Screens.collection = {
  selected: new Set(),

  render(app) {
    this.selected = new Set();
    app.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">📁 Коллекция</h2>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button class="btn btn-outline" id="selectAllBtn" style="flex:1;">Выбрать всё</button>
        <button class="btn btn-danger" id="sellSelectedBtn" style="flex:1;">Продать выбранное</button>
      </div>
      <div style="color:var(--text-dim);font-size:12px;margin-bottom:8px;" id="collInfo"></div>
      <div class="coll-grid" id="collGrid"></div>
    `;
    this.renderGrid();
    document.getElementById('selectAllBtn').onclick = () => this.selectAll();
    document.getElementById('sellSelectedBtn').onclick = () => this.sellSelected();
  },

  renderGrid() {
    const grid = document.getElementById('collGrid');
    const info = document.getElementById('collInfo');
    if (!grid) return;

    // ВСЕГДА читаем свежие данные
    const items = State.data.collection || [];
    const total = items.reduce((s, x) => s + x.price, 0);

    console.log('Рендер коллекции, найдено:', items.length);

    if (info) {
      info.textContent = `Всего: ${items.length} · Стоимость: ${Utils.formatMoney(total)}`;
    }

    if (!items.length) {
      grid.innerHTML = '<div style="color:var(--text-dim);grid-column:1/-1;text-align:center;padding:20px;">Пока пусто</div>';
      return;
    }

    grid.innerHTML = items.map(it => `
      <div class="coll-item ${this.selected.has(it.id) ? 'selected' : ''} card-skin-${State.data.cosmetics.cardSkin} frame-${State.data.cosmetics.frame}" data-id="${it.id}">
        <div class="num ${it.rarityCls}">${it.formatted.split(' ').slice(1).join(' ')}</div>
        <div class="rar ${it.rarityCls}">${it.rarityName}</div>
        <div style="font-size:10px;color:var(--gold);margin-top:4px;">${Utils.formatMoney(it.price)}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.coll-item').forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id;
        if (this.selected.has(id)) this.selected.delete(id);
        else this.selected.add(id);
        this.renderGrid();
      };
    });
  },

  selectAll() {
    if (this.selected.size === State.data.collection.length) {
      this.selected.clear();
    } else {
      this.selected = new Set(State.data.collection.map(x => x.id));
    }
    this.renderGrid();
  },

  sellSelected() {
    if (!this.selected.size) {
      Utils.toast('Ничего не выбрано');
      return;
    }
    let total = 0;
    const ids = [...this.selected];
    ids.forEach(id => {
      const item = State.data.collection.find(x => x.id === id);
      if (item) {
        total += item.price;
        State.addHistory({
          type: 'sold',
          number: item.formatted,
          price: item.price,
          rarity: item.rarityName
        });
        State.removeFromCollection(id);
      }
    });
    State.changeBalance(total);
    State.data.earned = (State.data.earned || 0) + total;
    State.recordAction('sell', ids.length);
    Screens.profile.checkAchievements();
    Utils.toast(`💰 Продано на ${Utils.formatMoney(total)}`);
    this.selected.clear();
    this.renderGrid();
  },
};
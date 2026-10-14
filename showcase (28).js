Screens.showcase = {
  render(app) {
    const selected = new Set(State.data.showcase);
    const available = [...State.data.collection].sort((left, right) => right.price - left.price);
    const showcased = available.filter(item => selected.has(item.id));
    app.innerHTML = `
      <h2>✨ Личная витрина</h2>
      <p class="screen-description">Выбери до трёх номеров. Сейчас в витрине ${showcased.length} / 3.</p>
      <section class="showcase-grid">
        ${showcased.map(item => this.card(item, true)).join('') || '<div class="card empty-state">Добавь лучшие номера из списка ниже</div>'}
      </section>
      <h3 class="showcase-subtitle">Коллекция</h3>
      <section class="showcase-grid">
        ${available.map(item => this.card(item, selected.has(item.id))).join('') || '<div class="card empty-state">Коллекция пуста</div>'}
      </section>
    `;
    app.querySelectorAll('[data-showcase]').forEach(button => {
      button.onclick = () => this.toggle(button.dataset.showcase);
    });
  },

  card(item, selected) {
    return `<article class="card showcase-item card-skin-${State.data.cosmetics.cardSkin} frame-${State.data.cosmetics.frame}">
      <b class="${item.rarityCls}">${item.formatted}</b>
      <small>${item.countryName} · ${item.rarityName}</small>
      <strong>${Utils.formatMoney(item.price)}</strong>
      <button class="btn ${selected ? 'btn-outline' : 'btn-gold'}" data-showcase="${item.id}">
        ${selected ? 'Убрать' : 'В витрину'}
      </button>
    </article>`;
  },

  toggle(id) {
    const showcase = new Set(State.data.showcase);
    if (showcase.has(id)) showcase.delete(id);
    else if (showcase.size >= 3) {
      Utils.toast('В витрине может быть не больше трёх номеров');
      return;
    } else if (State.data.collection.some(item => item.id === id)) showcase.add(id);
    State.data.showcase = [...showcase];
    State.save();
    this.render(document.getElementById('app'));
  },
};

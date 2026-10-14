Screens.cosmetics = {
  cardSkins: [
    { id: 'classic', name: 'Классическое золото', price: 0 },
    { id: 'obsidian', name: 'Обсидиан', price: 15000 },
    { id: 'royal', name: 'Королевский', price: 35000 },
    { id: 'neon', name: 'Неоновый импульс', price: 60000 },
  ],
  frames: [
    { id: 'classic', name: 'Без рамки', price: 0, keys: 0 },
    { id: 'gold', name: 'Золотая рамка', price: 20000, keys: 0 },
    { id: 'royal', name: 'Королевская рамка', price: 0, keys: 2 },
  ],

  render(app) {
    const ownCards = State.data.cosmetics.ownedCardSkins || ['classic'];
    const ownFrames = State.data.cosmetics.ownedFrames || ['classic'];
    app.innerHTML = `
      <h2>🎨 Оформления</h2>
      <p class="screen-description">Ключи: ${State.data.cosmetics.keys || 0} 🔑 · Скины отображаются на карточках номеров.</p>
      <section class="card">
        <h3>Скины карточек</h3>
        <div class="cosmetic-grid">${this.cardSkins.map(item => {
          const owned = ownCards.includes(item.id);
          const equipped = State.data.cosmetics.cardSkin === item.id;
          return `<article class="cosmetic-item skin-${item.id}">
            <div class="cosmetic-preview">📱 777 777</div>
            <b>${item.name}</b>
            <small>${item.price ? Utils.formatMoney(item.price) : 'Бесплатно'}</small>
            <button class="btn ${equipped ? 'btn-outline' : 'btn-gold'}" data-card-skin="${item.id}">
              ${equipped ? 'Выбрано' : owned ? 'Надеть' : 'Купить'}
            </button>
          </article>`;
        }).join('')}</div>
      </section>
      <section class="card">
        <h3>Рамки</h3>
        <div class="cosmetic-grid">${this.frames.map(item => {
          const owned = ownFrames.includes(item.id);
          const equipped = State.data.cosmetics.frame === item.id;
          const cost = item.keys ? `${item.keys} 🔑` : Utils.formatMoney(item.price);
          return `<article class="cosmetic-item">
            <div class="frame-preview frame-${item.id}">👤</div>
            <b>${item.name}</b><small>${item.price || item.keys ? cost : 'Бесплатно'}</small>
            <button class="btn ${equipped ? 'btn-outline' : 'btn-gold'}" data-frame="${item.id}">
              ${equipped ? 'Выбрано' : owned ? 'Надеть' : 'Купить'}
            </button>
          </article>`;
        }).join('')}</div>
      </section>
    `;
    app.querySelectorAll('[data-card-skin]').forEach(button => {
      button.onclick = () => this.selectCardSkin(button.dataset.cardSkin);
    });
    app.querySelectorAll('[data-frame]').forEach(button => {
      button.onclick = () => this.selectFrame(button.dataset.frame);
    });
  },

  selectCardSkin(id) {
    const item = this.cardSkins.find(skin => skin.id === id);
    if (!item) return;
    State.data.cosmetics.ownedCardSkins = State.data.cosmetics.ownedCardSkins || ['classic'];
    if (!State.data.cosmetics.ownedCardSkins.includes(id)) {
      if (State.data.balance < item.price) return Utils.toast('Недостаточно средств');
      State.changeBalance(-item.price);
      State.data.cosmetics.ownedCardSkins.push(id);
    }
    State.data.cosmetics.cardSkin = id;
    State.save();
    this.render(document.getElementById('app'));
    Utils.toast(`Выбран скин «${item.name}»`);
  },

  selectFrame(id) {
    const item = this.frames.find(frame => frame.id === id);
    if (!item) return;
    State.data.cosmetics.ownedFrames = State.data.cosmetics.ownedFrames || ['classic'];
    if (!State.data.cosmetics.ownedFrames.includes(id)) {
      if (State.data.balance < item.price || State.data.cosmetics.keys < item.keys) {
        Utils.toast('Недостаточно средств или ключей');
        return;
      }
      if (item.price) State.changeBalance(-item.price);
      State.data.cosmetics.keys -= item.keys;
      State.data.cosmetics.ownedFrames.push(id);
    }
    State.data.cosmetics.frame = id;
    State.save();
    this.render(document.getElementById('app'));
    Utils.toast(`Выбрана рамка «${item.name}»`);
  },
};

Screens.phones = {
  models: [
    { id: 'copper', name: 'Copper Mini', price: 0, icon: '📱' },
    { id: 'onyx', name: 'Onyx Pro', price: 25000, icon: '📲' },
    { id: 'royal', name: 'Royal Fold', price: 100000, icon: '📳' },
  ],
  skins: [
    { id: 'black', name: 'Чёрный обсидиан', price: 0 },
    { id: 'gold', name: 'Золотой металл', price: 10000 },
    { id: 'ruby', name: 'Рубиновый', price: 20000 },
  ],

  render(app) {
    const phones = State.data.phones;
    if (!phones.some(phone => phone.id === 'copper')) {
      phones.push({ id: 'copper', skin: 'black', purchasedAt: Date.now() });
      State.save();
    }
    app.innerHTML = `
      <h2>📱 Телефоны</h2>
      <p class="screen-description">Коллекционируй устройства и открывай оформление.</p>
      <div class="phone-grid">
        ${this.models.map(model => {
          const owned = phones.find(phone => phone.id === model.id);
          const skin = this.skins.find(item => item.id === owned?.skin) || this.skins[0];
          return `<section class="card phone-card">
            <div class="phone-device phone-${owned?.skin || 'locked'}">${model.icon}</div>
            <h3>${model.name}</h3>
            ${owned ? `
              <p>Оформление: ${skin.name}</p>
              <label class="phone-skin-select">Скин
                <select data-phone-skin="${model.id}">
                  ${this.skins.map(item => `
                    <option value="${item.id}" ${owned.skin === item.id ? 'selected' : ''}>
                      ${item.name}${item.price ? ` · ${Utils.formatMoney(item.price)}` : ' · бесплатно'}
                    </option>
                  `).join('')}
                </select>
              </label>
            ` : `<button class="btn btn-gold" data-buy-phone="${model.id}" style="width:100%;">
              Купить · ${Utils.formatMoney(model.price)}
            </button>`}
          </section>`;
        }).join('')}
      </div>
    `;
    app.querySelectorAll('[data-buy-phone]').forEach(button => {
      button.onclick = () => this.buy(button.dataset.buyPhone);
    });
    app.querySelectorAll('[data-phone-skin]').forEach(select => {
      select.onchange = () => this.setSkin(select.dataset.phoneSkin, select.value);
    });
  },

  buy(id) {
    const model = this.models.find(item => item.id === id);
    if (!model || State.data.phones.some(phone => phone.id === id)) return;
    if (State.data.balance < model.price) {
      Utils.toast('Недостаточно средств');
      return;
    }
    if (model.price) State.changeBalance(-model.price);
    State.data.phones.push({ id, skin: 'black', purchasedAt: Date.now() });
    State.save();
    this.render(document.getElementById('app'));
    Utils.toast(`Телефон «${model.name}» добавлен`);
  },

  setSkin(phoneId, skinId) {
    const phone = State.data.phones.find(item => item.id === phoneId);
    const skin = this.skins.find(item => item.id === skinId);
    if (!phone || !skin) return;
    phone.ownedSkins = phone.ownedSkins || ['black'];
    if (!phone.ownedSkins.includes(skinId)) {
      if (State.data.balance < skin.price) {
        Utils.toast('Недостаточно средств');
        this.render(document.getElementById('app'));
        return;
      }
      if (skin.price) State.changeBalance(-skin.price);
      phone.ownedSkins.push(skinId);
    }
    phone.skin = skinId;
    State.save();
    this.render(document.getElementById('app'));
    Utils.toast(`Выбран скин «${skin.name}»`);
  },
};

Screens.profile = {
  achievements: [
    { id: 'first', icon: '📱', name: 'Первый номер', test: data => data.opened >= 1 },
    { id: 'ten', icon: '🔟', name: 'Коллекционер', test: data => data.opened >= 10 },
    { id: 'hundred', icon: '💯', name: 'Охотник за цифрами', test: data => data.opened >= 100 },
    { id: 'rare', icon: '💎', name: 'Редкая находка', test: data => data.history.some(item => item.rarity === 'Редкий') },
    { id: 'epic', icon: '🔮', name: 'Эпический улов', test: data => data.history.some(item => item.rarity === 'Эпический') },
    { id: 'legendary', icon: '🌟', name: 'Легендарка', test: data => data.history.some(item => item.rarity === 'Легендарный') },
    { id: 'mythic', icon: '👑', name: 'Мифик', test: data => data.history.some(item => item.rarity === 'Мифический') },
    { id: 'rich', icon: '💰', name: 'Капиталист', test: data => data.balance >= 100000 },
    { id: 'millionaire', icon: '🤑', name: 'Миллионер', test: data => data.balance >= 1000000 || data.earned >= 1000000 },
    { id: 'collector10', icon: '🗂️', name: 'Полная полка', test: data => data.collection.length >= 10 },
    { id: 'collector50', icon: '🏦', name: 'Архивариус', test: data => data.collection.length >= 50 },
    { id: 'upgrade', icon: '🎰', name: 'Удачный апгрейд', test: data => data.minigames.upgrade.history.some(item => item.won) },
    { id: 'roulette', icon: '🎡', name: 'Джекпот', test: data => data.minigames.roulette.history.some(item => item.prize >= 100000) },
    { id: 'cases', icon: '📦', name: 'Вскрыватель', test: data => data.minigames.cases.history.length >= 10 },
    { id: 'guess', icon: '🎯', name: 'Провидец', test: data => data.minigames.guess.history.some(item => item.won) },
    { id: 'mosaic', icon: '🧩', name: 'Мастер мозаики', test: data => data.minigames.mosaic.history.some(item => item.won) },
  ],

  checkAchievements() {
    const profile = State.data.profile;
    let changed = false;
    this.achievements.forEach(item => {
      if (!profile.achievements[item.id] && item.test(State.data)) {
        profile.achievements[item.id] = Date.now();
        changed = true;
        State.notify(`🏆 Достижение: ${item.name}`);
      }
    });
    if (changed) State.save();
  },

  render(app) {
    this.checkAchievements();
    const data = State.data;
    const profile = data.profile;
    const collectionValue = data.collection.reduce((sum, item) => sum + (item.price || 0), 0);
    const avatar = profile.avatar
      ? `<img class="profile-avatar" src="${profile.avatar}" alt="Аватар игрока">`
      : '<div class="profile-avatar profile-avatar-placeholder">👤</div>';
    const unlocked = this.achievements.filter(item => profile.achievements[item.id]);
    const bestFind = profile.bestFind;
    const registered = new Date(profile.registeredAt).toLocaleDateString('ru-RU');

    app.innerHTML = `
      <h2>👤 Профиль игрока</h2>
      <section class="card profile-hero frame-${data.cosmetics.frame}">
        ${avatar}
        <div class="profile-identity">
          <h3>${this.escape(profile.nickname)}</h3>
          <div class="profile-id">ID: ${profile.id}</div>
          <div class="profile-id">Регистрация: ${registered}</div>
        </div>
        <button class="btn btn-outline" id="editProfileBtn">Редактировать</button>
      </section>
      <section class="card profile-level">
        <div class="profile-level-line"><b>Уровень ${data.level} / ${CONFIG.MAX_LEVEL}</b><span>${data.xp} / 100 XP</span></div>
        <div class="profile-progress"><span style="width:${Math.min(100, data.xp)}%"></span></div>
      </section>
      <div class="profile-stats">
        <div class="stat-box"><b>${Utils.formatMoney(data.balance)}</b><small>Баланс</small></div>
        <div class="stat-box"><b>${Utils.formatMoney(data.earned)}</b><small>Всего заработано</small></div>
        <div class="stat-box"><b>${bestFind ? Utils.formatMoney(bestFind.price) : '—'}</b><small>Лучшая находка</small></div>
        <div class="stat-box"><b>${Utils.formatMoney(collectionValue)}</b><small>Коллекция</small></div>
        <div class="stat-box"><b>${data.opened}</b><small>Выбито номеров</small></div>
        <div class="stat-box"><b>${unlocked.length} / ${this.achievements.length}</b><small>Достижения</small></div>
      </div>
      <div class="card profile-achievements">
        <h3>🏆 Достижения</h3>
        <div class="achievement-grid">
          ${this.achievements.map(item => {
            const date = profile.achievements[item.id];
            return `<div class="achievement ${date ? 'unlocked' : ''}" title="${date ? new Date(date).toLocaleDateString('ru-RU') : 'Ещё не получено'}">
              <span>${item.icon}</span><b>${item.name}</b><small>${date ? new Date(date).toLocaleDateString('ru-RU') : 'Не получено'}</small>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card profile-bonus">
        <h3>🎁 Ежедневный бонус</h3>
        <p>Забирай бонус раз в 24 часа — награда увеличивается с уровнем.</p>
        <button class="btn btn-gold" id="dailyBtn" style="width:100%;">Забрать бонус</button>
      </div>
    `;
    app.querySelector('#editProfileBtn').onclick = () => this.openEditModal();
    app.querySelector('#dailyBtn').onclick = () => {
      if (State.dailyBonus()) {
        this.render(app);
      }
    };
  },

  openEditModal() {
    const profile = State.data.profile;
    this.pendingAvatar = profile.avatar;
    this.avatarLoading = false;
    UI.openModal(`
      <h3>Редактировать профиль</h3>
      <label class="profile-edit-label">Никнейм (3–16 символов)
        <input id="profileNickname" maxlength="16" value="${this.escape(profile.nickname)}" autocomplete="nickname">
      </label>
      <label class="profile-edit-label">Аватар
        <input id="profileAvatarFile" type="file" accept="image/*">
      </label>
      <div id="profileAvatarPreview" class="profile-avatar-preview">
        ${profile.avatar ? `<img class="profile-avatar" src="${profile.avatar}" alt="Предпросмотр">` : '👤'}
      </div>
      <p class="profile-edit-help">Изображение будет центрировано и уменьшено до 256×256.</p>
      <div class="action-row">
        <button class="btn btn-outline" id="cancelProfileEdit">Отмена</button>
        <button class="btn btn-gold" id="saveProfileEdit">Сохранить</button>
      </div>
    `);
    document.getElementById('profileAvatarFile').onchange = event => this.readAvatar(event.target.files?.[0]);
    document.getElementById('cancelProfileEdit').onclick = () => UI.closeModal();
    document.getElementById('saveProfileEdit').onclick = () => this.saveProfileEdit();
  },

  readAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Utils.toast('Выбери файл изображения');
      return;
    }
    this.setAvatarLoading(true);
    const reader = new FileReader();
    reader.onerror = error => {
      console.error('Не удалось прочитать аватар:', error);
      this.setAvatarLoading(false);
      Utils.toast('Не удалось загрузить изображение');
    };
    reader.onload = () => {
      const image = new Image();
      image.onerror = error => {
        console.error('Не удалось обработать аватар:', error);
        this.setAvatarLoading(false);
        Utils.toast('Не удалось обработать изображение');
      };
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const context = canvas.getContext('2d');
          const size = Math.min(image.width, image.height);
          context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 256, 256);
          this.pendingAvatar = canvas.toDataURL('image/jpeg', 0.82);
          this.setAvatarLoading(false);
          const preview = document.getElementById('profileAvatarPreview');
          if (preview) {
            preview.innerHTML = `<img class="profile-avatar" src="${this.pendingAvatar}" alt="Предпросмотр">`;
          }
        } catch (error) {
          console.error('Ошибка обрезки аватара:', error);
          this.setAvatarLoading(false);
          Utils.toast('Не удалось сохранить изображение');
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  },

  setAvatarLoading(loading) {
    this.avatarLoading = loading;
    const button = document.getElementById('saveProfileEdit');
    if (button) button.disabled = loading;
  },

  saveProfileEdit() {
    if (this.avatarLoading) return;
    const nickname = document.getElementById('profileNickname').value.trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
      Utils.toast('Ник: 3–16 символов, только латиница, цифры и _');
      return;
    }
    const profile = State.data.profile;
    const changed = nickname !== profile.nickname;
    const cooldown = 24 * 60 * 60 * 1000;
    if (changed && profile.nicknameChangedAt && Date.now() - profile.nicknameChangedAt < cooldown) {
      const remaining = cooldown - (Date.now() - profile.nicknameChangedAt);
      Utils.toast(`Ник можно изменить через ${Math.ceil(remaining / 3600000)} ч.`);
      return;
    }
    profile.nickname = nickname;
    profile.avatar = this.pendingAvatar || '';
    if (changed) profile.nicknameChangedAt = Date.now();
    State.save();
    UI.closeModal();
    this.render(document.getElementById('app'));
    Utils.toast('Профиль сохранён');
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  },
};

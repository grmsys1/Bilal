Screens.friends = {
  render(app) {
    const friends = State.data.friends;
    app.innerHTML = `
      <h2>👥 Друзья</h2>
      <section class="card friend-add">
        <p>Добавление доступно по Player ID. Список хранится на этом устройстве.</p>
        <div class="action-row">
          <input id="friendId" placeholder="CFR-XXXX-XXXX" maxlength="13" autocomplete="off">
          <button class="btn btn-gold" id="addFriendBtn">Добавить</button>
        </div>
      </section>
      <section class="friend-list">
        ${friends.length ? friends.map(friend => `
          <article class="card friend-row">
            <span class="friend-avatar">${friend.avatar || '👤'}</span>
            <span><b>${this.escape(friend.name)}</b><small>${friend.id}</small></span>
            <button class="btn btn-danger" data-remove-friend="${friend.id}" aria-label="Удалить друга">×</button>
          </article>
        `).join('') : '<div class="card empty-state">Список друзей пока пуст</div>'}
      </section>
    `;
    app.querySelector('#addFriendBtn').onclick = () => this.add();
    app.querySelectorAll('[data-remove-friend]').forEach(button => {
      button.onclick = () => this.remove(button.dataset.removeFriend);
    });
  },

  add() {
    const input = document.getElementById('friendId');
    const id = input.value.trim().toUpperCase();
    if (!/^CFR-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) {
      Utils.toast('Проверь формат ID: CFR-XXXX-XXXX');
      return;
    }
    if (id === State.data.profile.id || State.data.friends.some(friend => friend.id === id)) {
      Utils.toast('Этот ID уже добавлен или принадлежит вам');
      return;
    }
    State.data.friends.unshift({ id, name: `Игрок ${id.slice(-4)}`, avatar: '👤', addedAt: Date.now() });
    State.save();
    this.render(document.getElementById('app'));
    Utils.toast('Игрок добавлен в локальный список');
  },

  remove(id) {
    State.data.friends = State.data.friends.filter(friend => friend.id !== id);
    State.save();
    this.render(document.getElementById('app'));
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  },
};

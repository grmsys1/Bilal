Screens.notifications = {
  render(app) {
    const notifications = State.data.notifications || [];
    app.innerHTML = `
      <h2>🔔 Уведомления</h2>
      <section class="card notification-settings">
        <label><input type="checkbox" id="notificationsEnabled" ${State.data.settings.notifications === false ? '' : 'checked'}>
          Показывать игровые уведомления</label>
        <button class="btn btn-outline" id="markNotificationsRead">Отметить все прочитанными</button>
      </section>
      <section class="notification-list">
        ${notifications.length ? notifications.map(item => `
          <article class="card notification-row ${item.read ? 'read' : ''}">
            <span>${this.escape(item.message)}</span>
            <small>${new Date(item.date).toLocaleString('ru-RU')}</small>
          </article>
        `).join('') : '<div class="card empty-state">Уведомлений пока нет</div>'}
      </section>
    `;
    app.querySelector('#notificationsEnabled').onchange = event => {
      State.data.settings.notifications = event.target.checked;
      State.save();
      Utils.toast(event.target.checked ? 'Уведомления включены' : 'Уведомления выключены');
    };
    app.querySelector('#markNotificationsRead').onclick = () => {
      State.data.notifications.forEach(item => { item.read = true; });
      State.save();
      this.render(app);
    };
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  },
};

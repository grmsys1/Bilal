Screens.history = {
  render(app) {
    const h = State.data.history || [];
    app.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">📜 История</h2>
      ${h.length ? h.map(e => `
        <div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:13px;font-weight:700;">${e.number}</div>
            <div style="font-size:11px;color:var(--text-dim);">${e.rarity || ''} · ${new Date(e.date).toLocaleString('ru-RU')}</div>
          </div>
          <div style="font-size:12px;text-align:right;">
            <div style="color:var(--gold);font-weight:700;">${Utils.formatMoney(e.price)}</div>
            <div style="color:var(--text-dim);">${e.type}</div>
          </div>
        </div>
      `).join('') : '<div class="card" style="color:var(--text-dim);text-align:center;">История пуста</div>'}
    `;
  },
};
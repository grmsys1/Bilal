Screens.settings = {
  render(app) {
    const animation = State.data.settings?.animation || 'full';
    const isAdmin = State.data.settings?.isAdmin === true;

    app.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">⚙️ Настройки</h2>

      <div class="card" style="margin-bottom:12px;">
        <div style="margin-bottom:10px;font-weight:700;">Анимации</div>
        <div class="animation-options">
          <button class="btn ${animation === 'full' ? 'btn-gold' : 'btn-outline'}" data-animation="full">Полные</button>
          <button class="btn ${animation === 'short' ? 'btn-gold' : 'btn-outline'}" data-animation="short">Короткие</button>
          <button class="btn ${animation === 'off' ? 'btn-gold' : 'btn-outline'}" data-animation="off">Выключены</button>
        </div>
      </div>

      <div class="card settings-toggles">
        <label><input type="checkbox" id="soundsEnabled" ${State.data.settings.sounds ? 'checked' : ''}> 🔊 Звуки</label>
        <label><input type="checkbox" id="vibrationEnabled" ${State.data.settings.vibration ? 'checked' : ''}> 📳 Вибрация</label>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-weight:700;margin-bottom:10px;">🔐 Админ-доступ</div>
        ${isAdmin ? `
          <div style="color:var(--success);font-size:13px;margin-bottom:10px;">✓ Админ-режим активирован</div>
          <button class="btn btn-outline" id="openAdminBtn" style="width:100%;">🛠️ Открыть админ-панель</button>
          <button class="btn btn-danger" id="logoutAdminBtn" style="width:100%;margin-top:8px;">Выйти из админ-режима</button>
        ` : `
          <div style="color:var(--text-dim);font-size:12px;margin-bottom:8px;">
            Введите код для доступа к админ-функциям.
          </div>
          <input type="password" id="adminCodeInput" placeholder="Код доступа"
                 style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);
                        background:var(--bg3);color:var(--text);font-size:15px;margin-bottom:8px;outline:none;">
          <button class="btn btn-gold" id="adminLoginBtn" style="width:100%;">Войти</button>
        `}
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-weight:700;margin-bottom:8px;">Сброс прогресса</div>
        <button class="btn btn-danger" id="resetBtn" style="width:100%;">Сбросить и начать заново</button>
      </div>

      <div style="text-align:center;color:var(--text-dim);font-size:11px;margin-top:20px;">
        Циферки · v0.3 · SimGenerator Clone
      </div>
    `;

    // Настройка режима анимаций.
    app.querySelectorAll('[data-animation]').forEach(b => {
      b.onclick = () => {
        State.data.settings.animation = b.dataset.animation;
        State.save();
        document.documentElement.setAttribute('data-animations', b.dataset.animation);
        this.render(app);
      };
    });
    app.querySelector('#soundsEnabled').onchange = event => {
      State.data.settings.sounds = event.target.checked;
      State.save();
    };
    app.querySelector('#vibrationEnabled').onchange = event => {
      State.data.settings.vibration = event.target.checked;
      State.save();
    };

    // вход в админку
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
      loginBtn.onclick = () => {
        const code = document.getElementById('adminCodeInput').value.trim();
        if (code === 'grmsys2009') {
          State.data.settings.isAdmin = true;
          State.save();
          Utils.toast('🛠️ Админ-режим активирован');
          this.render(app);
        } else {
          Utils.toast('❌ Неверный код');
        }
      };
      // Enter — тоже вход
      document.getElementById('adminCodeInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') loginBtn.click();
      });
    }

    // открыть админ-панель
    const openBtn = document.getElementById('openAdminBtn');
    if (openBtn) openBtn.onclick = () => this.openAdminPanel(app);

    // выход из админки
    const logoutBtn = document.getElementById('logoutAdminBtn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        UI.confirm('Выйти из админ-режима?', () => {
          State.data.settings.isAdmin = false;
          State.save();
          this.render(app);
          Utils.toast('Вы вышли из админки');
        });
      };
    }

    // сброс прогресса
    document.getElementById('resetBtn').onclick = () => {
      UI.confirm('Точно сбросить весь прогресс?', () => {
        localStorage.removeItem(CONFIG.SAVE_KEY);
        location.reload();
      });
    };
  },

  openAdminPanel(app) {
    UI.openModal(`
      <h3 style="color:var(--gold);margin-bottom:14px;">🛠️ Админ-панель</h3>

      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Баланс</div>
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        <input type="number" id="admBalance" value="1000000"
               style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);
                      background:var(--bg3);color:var(--text);font-size:14px;outline:none;">
        <button class="btn btn-gold" id="admSetBalance" style="padding:10px 14px;">Уст.</button>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <button class="btn btn-outline" data-add-bal="100000" style="flex:1;padding:8px;font-size:12px;">+100K</button>
        <button class="btn btn-outline" data-add-bal="1000000" style="flex:1;padding:8px;font-size:12px;">+1M</button>
        <button class="btn btn-outline" data-add-bal="10000000" style="flex:1;padding:8px;font-size:12px;">+10M</button>
      </div>

      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Уровень</div>
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <input type="number" id="admLevel" value="500" min="1" max="500"
               style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);
                      background:var(--bg3);color:var(--text);font-size:14px;outline:none;">
        <button class="btn btn-gold" id="admSetLevel" style="padding:10px 14px;">Уст.</button>
      </div>

      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Класс SIM (Сверка)</div>
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        ${CONFIG.SIM_CLASSES.map(c => `
          <button class="btn btn-outline" data-set-class="${c.key}"
                  style="flex:1;padding:8px;font-size:11px;">${c.name}</button>
        `).join('')}
      </div>

      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Быстрые действия</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
        <button class="btn btn-outline" id="admGiveMythic">💎 Выдать мифический номер</button>
        <button class="btn btn-outline" id="admClearColl">🗑️ Очистить коллекцию</button>
        <button class="btn btn-outline" id="admClearHist">🗑️ Очистить историю</button>
      </div>

      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Экспорт / импорт</div>
      <div style="display:flex;gap:6px;margin-bottom:14px;">
        <button class="btn btn-outline" id="admExport" style="flex:1;padding:8px;font-size:12px;">📤 Экспорт</button>
        <button class="btn btn-outline" id="admImport" style="flex:1;padding:8px;font-size:12px;">📥 Импорт</button>
      </div>

      <button class="btn btn-gold" id="admClose" style="width:100%;">Закрыть</button>
    `);

    const close = () => UI.closeModal();
    document.getElementById('admClose').onclick = close;

    // баланс
    document.getElementById('admSetBalance').onclick = () => {
      const v = parseInt(document.getElementById('admBalance').value) || 0;
      State.data.balance = v;
      State.save();
      UI.updateTopbar();
      Utils.toast('Баланс: ' + Utils.formatMoney(v));
    };
    document.querySelectorAll('[data-add-bal]').forEach(b => {
      b.onclick = () => {
        State.changeBalance(parseInt(b.dataset.addBal));
        Utils.toast('+' + Utils.formatMoney(parseInt(b.dataset.addBal)));
      };
    });

    // уровень
    document.getElementById('admSetLevel').onclick = () => {
      const v = Math.min(500, Math.max(1, parseInt(document.getElementById('admLevel').value) || 1));
      State.data.level = v;
      State.save();
      UI.updateTopbar();
      Utils.toast('Уровень: ' + v);
    };

    // класс SIM
    document.querySelectorAll('[data-set-class]').forEach(b => {
      b.onclick = () => {
        State.data.roaming.simClass = b.dataset.setClass;
        State.save();
        Utils.toast('Класс: ' + Screens.roaming.simClassName(b.dataset.setClass));
      };
    });

    // мифический номер
    document.getElementById('admGiveMythic').onclick = () => {
      const country = Utils.pick(CONFIG.COUNTRIES);
      const digits = String(Utils.random(1, 9)).repeat(country.digits);
      const formatted = Utils.formatNumber(country.dial, digits);
      const item = {
        id: Utils.uid(),
        country: country.code,
        countryName: country.name,
        flag: country.flag,
        dial: country.dial,
        digits,
        formatted,
        rarity: 'mythic',
        rarityName: 'Мифический',
        rarityCls: 'rarity-mythic',
        price: 5000000 + Utils.random(0, 5000000),
        operator: Utils.pick(country.operators),
        date: Date.now(),
      };
      State.addToCollection(item);
      Utils.toast('💎 Выдан мифический номер');
    };

    // очистки
    document.getElementById('admClearColl').onclick = () => {
      UI.confirm('Очистить коллекцию?', () => {
        State.data.collection = [];
        State.save();
        Utils.toast('Коллекция очищена');
      });
    };
    document.getElementById('admClearHist').onclick = () => {
      UI.confirm('Очистить историю?', () => {
        State.data.history = [];
        State.save();
        Utils.toast('История очищена');
      });
    };

    // экспорт / импорт
    document.getElementById('admExport').onclick = () => {
      const data = JSON.stringify(State.data);
      navigator.clipboard?.writeText(data).then(
        () => Utils.toast('📤 Сохранение скопировано в буфер'),
        () => {
          prompt('Скопируй вручную:', data);
        }
      );
    };
    document.getElementById('admImport').onclick = () => {
      const data = prompt('Вставь сохранение (JSON):');
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(parsed));
        location.reload();
      } catch (e) {
        Utils.toast('❌ Неверный формат');
      }
    };
  },
};
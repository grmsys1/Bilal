document.addEventListener('DOMContentLoaded', () => {
  State.init();
  UI.updateTopbar();
  let questDate = State.data.dailyQuests.date;
  const refreshDailyState = () => {
    const previousDate = questDate;
    State.ensureDailyQuests();
    questDate = State.data.dailyQuests.date;
    if (questDate !== previousDate) {
      State.notify('🎁 Ежедневные задания обновлены');
      const active = document.querySelector('.bottom-nav button.active')?.dataset.screen || 'home';
      UI.setScreen(active);
    }
  };
  const scheduleMidnightRefresh = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeout(() => {
      refreshDailyState();
      scheduleMidnightRefresh();
    }, midnight.getTime() - now.getTime() + 50);
  };
  scheduleMidnightRefresh();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDailyState();
  });
  document.addEventListener('pointerdown', event => {
    if (event.target.closest('button, .coll-item, .country-item')) Utils.feedback();
  });

  // Роутинг
  document.querySelectorAll('.bottom-nav button').forEach(b => {
    b.onclick = () => UI.setScreen(b.dataset.screen);
  });

  // Меню
  const menu = document.getElementById('sideMenu');
  const overlay = document.getElementById('menuOverlay');
  document.getElementById('menuBtn').onclick = () => {
    menu.classList.add('open');
    overlay.classList.add('open');
  };
  const closeMenu = () => {
    menu.classList.remove('open');
    overlay.classList.remove('open');
  };
  document.getElementById('closeMenu').onclick = closeMenu;
  overlay.onclick = closeMenu;
  menu.querySelectorAll('li').forEach(li => {
    li.onclick = () => {
      closeMenu();
      UI.setScreen(li.dataset.screen);
    };
  });

  // Модалка — закрытие по клику вне
  document.getElementById('modalOverlay').onclick = (e) => {
    if (e.target.id === 'modalOverlay') UI.closeModal();
  };

  // Стартовый экран
  UI.setScreen('home');
});
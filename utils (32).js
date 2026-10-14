const Utils = {
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  formatMoney(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  },

  formatNumber(dial, digits) {
    if (!digits) return dial;
    let out = dial + ' ';
    for (let i = 0; i < digits.length; i += 3) {
      out += digits.slice(i, i + 3);
      if (i + 3 < digits.length) out += ' ';
    }
    return out.trim();
  },

  toast(msg) {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s';
      setTimeout(() => el.remove(), 300);
    }, 2200);
  },

  feedback() {
    const settings = State.data?.settings;
    if (settings?.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
    if (!settings?.sounds) return;
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    try {
      const context = new AudioContextType();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.07);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.07);
      oscillator.onended = () => context.close();
    } catch (error) {
      console.error('Не удалось воспроизвести звук:', error);
    }
  },

  save(data) {
    try {
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));
    } catch(e) { console.error('Save failed', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem(CONFIG.SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      console.error('Load failed', e);
      return null;
    }
  },
};
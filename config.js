const CONFIG = {
  START_BALANCE: 65000,
  LOW_BALANCE_THRESHOLD: 2000,
  LOW_BALANCE_BONUS: 3000,
  LEVEL_PRICE_THRESHOLD: 100000,
  MAX_LEVEL: 500,
  SAVE_KEY: 'ciferki_save_v1',

  RARITIES: [
    { key: 'common',    name: 'Обычный',      weight: 45,  mult: 1.0,  cls: 'rarity-common' },
    { key: 'uncommon',  name: 'Необычный',    weight: 25,  mult: 1.8,  cls: 'rarity-uncommon' },
    { key: 'rare',      name: 'Редкий',       weight: 15,  mult: 3.5,  cls: 'rarity-rare' },
    { key: 'epic',      name: 'Эпический',    weight: 8,   mult: 7.0,  cls: 'rarity-epic' },
    { key: 'legendary', name: 'Легендарный',  weight: 4,   mult: 16.0, cls: 'rarity-legendary' },
    { key: 'mythic',    name: 'Мифический',   weight: 2,   mult: 45.0, cls: 'rarity-mythic' },
    { key: 'premium_elite', name: 'Премиум Элита', weight: 1, mult: 120.0, cls: 'rarity-mythic' },
  ],

  SIM_CLASSES: [
    { key: 'standard', name: 'Стандарт',       mult: 1.0,  priceMult: 1.0, desc: 'Базовые номера, низкая цена прокрута' },
    { key: 'comfort',  name: 'Комфорт',        mult: 1.5,  priceMult: 1.4, desc: 'Чуть выше шанс на редкие номера' },
    { key: 'business', name: 'Бизнес',         mult: 2.2,  priceMult: 2.0, desc: 'Повышенный шанс на эпики и легендарки' },
    { key: 'premium',  name: 'Премиум',        mult: 3.5,  priceMult: 3.2, desc: 'Хорошие шансы на топовые номера' },
    { key: 'premium_elite', name: 'Премиум Элита', mult: 6.0, priceMult: 5.5, desc: 'Максимальные шансы, самые дорогие номера' },
  ],

  COUNTRIES: [
    { code: 'RU', flag: '🇷🇺', name: 'Россия',       dial: '+7',   digits: 10, basePrice: 500,  operators: ['МТС', 'Билайн', 'Мегафон', 'Tele2'] },
    { code: 'UA', flag: '🇺🇦', name: 'Украина',      dial: '+380', digits: 9,  basePrice: 450,  operators: ['Киевстар', 'Vodafone', 'lifecell'] },
    { code: 'BY', flag: '🇧🇾', name: 'Беларусь',     dial: '+375', digits: 9,  basePrice: 400,  operators: ['A1', 'МТС', 'life:)'] },
    { code: 'KZ', flag: '🇰🇿', name: 'Казахстан',    dial: '+7',   digits: 10, basePrice: 420,  operators: ['Beeline', 'Activ', 'Kcell'] },
    { code: 'TJ', flag: '🇹🇯', name: 'Таджикистан',  dial: '+992', digits: 9,  basePrice: 300,  operators: ['Tcell', 'Megafon'] },
    { code: 'UZ', flag: '🇺🇿', name: 'Узбекистан',   dial: '+998', digits: 9,  basePrice: 320,  operators: ['Beeline', 'Ucell', 'UMS'] },
    { code: 'US', flag: '🇺🇸', name: 'Америка',      dial: '+1',   digits: 10, basePrice: 800,  operators: ['AT&T', 'Verizon', 'T-Mobile'] },
    { code: 'BR', flag: '🇧🇷', name: 'Бразилия',     dial: '+55',  digits: 11, basePrice: 600,  operators: ['Vivo', 'Claro', 'TIM'] },
    { code: 'GB', flag: '🇬🇧', name: 'Великобритания', dial: '+44', digits: 10, basePrice: 750,  operators: ['EE', 'O2', 'Vodafone'] },
    { code: 'DE', flag: '🇩🇪', name: 'Германия',     dial: '+49',  digits: 11, basePrice: 700,  operators: ['Telekom', 'Vodafone', 'O2'] },
    { code: 'FR', flag: '🇫🇷', name: 'Франция',      dial: '+33',  digits: 9,  basePrice: 680,  operators: ['Orange', 'SFR', 'Bouygues'] },
    { code: 'JP', flag: '🇯🇵', name: 'Япония',       dial: '+81',  digits: 10, basePrice: 900,  operators: ['NTT Docomo', 'au', 'SoftBank'] },
  ],
};
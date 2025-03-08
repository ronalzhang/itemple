/**
 * 祝福语生成工具
 */

// 不同场景的祝福语前缀
const BLESSING_PREFIXES = [
  '愿佛光普照，',
  '佛法无边，',
  '南无阿弥陀佛，',
  '愿菩萨护佑，',
  '佛光庇佑，',
  '三宝加持，',
  '佛力加持，',
  '菩提正觉，'
];

// 常规祝福语内容
const REGULAR_BLESSINGS = [
  '福寿绵长，吉祥如意。',
  '消灾免难，身心安康。',
  '福慧双修，心想事成。',
  '一切顺利，万事如意。',
  '智慧增长，福报增长。',
  '平安喜乐，诸事顺遂。',
  '家庭和睦，事业有成。',
  '福禄寿喜，六时吉祥。',
  '四季平安，八方来财。',
  '烦恼消除，正觉增长。',
  '身心康泰，百病不侵，延年益寿。'
];

// 特殊日子（初一、十五等）的祝福语内容
const SPECIAL_DAY_BLESSINGS = [
  '功德圆满，福慧增长，康泰安宁。',
  '消除业障，增长智慧，圆满吉祥。',
  '诸佛护念，菩提增长，百事亨通。',
  '远离苦厄，得遇光明，成就善愿。',
  '六时吉祥，百事顺遂，如意圆满。',
  '消灾延寿，增福添财，善缘广结。',
  '身心康泰，百病不侵，延年益寿。'
];

// 加密货币相关的常规祝福
const CRYPTO_REGULAR_BLESSINGS = [
  {
    zh: "愿您福如比特，智慧如链，源源不断。",
    en: "May your fortune grow like Bitcoin, your wisdom flow like blockchain."
  },
  {
    zh: "愿您智慧如以太，福报如链，生生不竭。",
    en: "May your wisdom shine like Ethereum, your blessings chain forever."
  },
  {
    zh: "福如比特永恒，智慧如链坚固。",
    en: "Fortune eternal as Bitcoin, wisdom solid as blockchain."
  },
  {
    zh: "愿您钱包稳固，以太长明，平安喜乐。",
    en: "May your wallet be secure, Ethereum shine bright, bringing peace and joy."
  },
  {
    zh: "福似比特增值，智慧如链相连。",
    en: "Fortune rising like Bitcoin, wisdom connecting like chains."
  }
];

// 加密货币相关的特殊日子祝福
const CRYPTO_SPECIAL_DAY_BLESSINGS = [
  {
    zh: "良辰吉日，愿福如比特增长，智慧如链永续。",
    en: "On this blessed day, may your fortune rise like Bitcoin, wisdom flow like chain."
  },
  {
    zh: "殊胜之日，愿以太光明，链上福报永驻。",
    en: "Sacred moment, may Ethereum light your path, blessings chain eternal."
  },
  {
    zh: "佛日吉祥，愿比特高升，智慧如链不断。",
    en: "Auspicious day, Bitcoin soaring high, wisdom chaining endless."
  },
  {
    zh: "殊胜因缘，愿以太永恒，福慧双链增长。",
    en: "Blessed time, Ethereum shining bright, dual chains of fortune growing."
  },
  {
    zh: "吉祥之日，愿比特高照，链上福报广增。",
    en: "Special day, Bitcoin lighting way, chain blessings multiplying."
  }
];

// 特定场景的祝福语（例如事业、健康、感情等）
const SPECIFIC_BLESSINGS = {
  career: [
    '事业蒸蒸日上，财源广进。',
    '前程似锦，事业有成，功成名就。',
    '步步高升，财源滚滚，名利双收。'
  ],
  health: [
    '身心康泰，百病不侵，延年益寿。',
    '健康长寿，无病无灾，日日安康。',
    '强健体魄，远离病苦，安享晚年。'
  ],
  relationship: [
    '姻缘美满，爱情长久，白头偕老。',
    '良缘天定，美满姻缘，幸福美满。',
    '情意绵绵，缘分深厚，天作之合。'
  ],
  study: [
    '学业有成，金榜题名，前途光明。',
    '学习进步，学业有成，学富五车。',
    '才思敏捷，学识渊博，高中状元。'
  ]
};

/**
 * 根据农历日期生成随机祝福语
 * @param lunarDate 农历日期
 * @param lang 语言（'zh' 或 'en'）
 * @returns 随机祝福语
 */
export const generateRandomBlessing = (lunarDate: string, lang: 'zh' | 'en' = 'zh'): string => {
  // 判断是否为特殊日子（初一或十五）
  const isSpecialDay = lunarDate.includes('初一') || lunarDate.includes('十五');
  
  // 20%的概率使用加密货币相关祝福
  const useCrypto = Math.random() < 0.2;
  
  if (useCrypto) {
    if (isSpecialDay) {
      const cryptoSpecial = CRYPTO_SPECIAL_DAY_BLESSINGS[
        Math.floor(Math.random() * CRYPTO_SPECIAL_DAY_BLESSINGS.length)
      ];
      return cryptoSpecial[lang];
    } else {
      const cryptoRegular = CRYPTO_REGULAR_BLESSINGS[
        Math.floor(Math.random() * CRYPTO_REGULAR_BLESSINGS.length)
      ];
      return cryptoRegular[lang];
    }
  }
  
  // 如果不使用加密货币祝福，则使用传统祝福
  // 随机选择一个前缀
  const prefix = BLESSING_PREFIXES[Math.floor(Math.random() * BLESSING_PREFIXES.length)];
  
  // 增加health类别祝福被选中的概率
  const useHealth = Math.random() < 0.3;
  
  let blessing = '';
  
  if (useHealth) {
    // 直接使用健康祝福
    blessing = SPECIFIC_BLESSINGS.health[Math.floor(Math.random() * SPECIFIC_BLESSINGS.health.length)];
  } else if (isSpecialDay) {
    // 如果是特殊日子，使用特殊日子的祝福语
    blessing = SPECIAL_DAY_BLESSINGS[Math.floor(Math.random() * SPECIAL_DAY_BLESSINGS.length)];
  } else {
    // 随机选择常规祝福语或特定场景祝福语
    const useSpecific = Math.random() > 0.5;
    
    if (useSpecific) {
      // 选择一个特定场景
      const categories = Object.keys(SPECIFIC_BLESSINGS);
      const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof SPECIFIC_BLESSINGS;
      const specificBlessings = SPECIFIC_BLESSINGS[category];
      blessing = specificBlessings[Math.floor(Math.random() * specificBlessings.length)];
    } else {
      // 使用常规祝福语
      blessing = REGULAR_BLESSINGS[Math.floor(Math.random() * REGULAR_BLESSINGS.length)];
    }
  }
  
  // 组合前缀和内容
  return `${prefix}${blessing}`;
};

/**
 * 根据特定场景生成祝福语
 * @param category 场景类别（事业、健康、感情、学业）
 * @returns 针对特定场景的祝福语
 */
export const generateCategoryBlessing = (
  category: 'career' | 'health' | 'relationship' | 'study'
): string => {
  const prefix = BLESSING_PREFIXES[Math.floor(Math.random() * BLESSING_PREFIXES.length)];
  const blessings = SPECIFIC_BLESSINGS[category];
  const blessing = blessings[Math.floor(Math.random() * blessings.length)];
  
  return `${prefix}${blessing}`;
}; 
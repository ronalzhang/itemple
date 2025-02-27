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
 * @returns 随机祝福语
 */
export const generateRandomBlessing = (lunarDate: string): string => {
  // 判断是否为特殊日子（初一或十五）
  const isSpecialDay = lunarDate.includes('初一') || lunarDate.includes('十五');
  
  // 随机选择一个前缀
  const prefix = BLESSING_PREFIXES[Math.floor(Math.random() * BLESSING_PREFIXES.length)];
  
  // 随机选择一个祝福语内容
  let blessing = '';
  
  // 增加health类别祝福被选中的概率
  const useHealth = Math.random() < 0.3; // 30%的概率直接使用健康祝福
  
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
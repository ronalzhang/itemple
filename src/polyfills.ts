/**
 * 浏览器兼容性polyfill
 */

// 添加crypto.randomUUID polyfill
if (typeof window !== 'undefined' && window.crypto) {
  const originalRandomUUID = window.crypto.randomUUID;
  if (!originalRandomUUID) {
    // @ts-ignore - 忽略类型检查，因为我们在运行时确保其功能正常
    window.crypto.randomUUID = function() {
      // 简单的UUID v4生成函数
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    };
  }
}

export default function setupPolyfills() {
  // 仅用于导入此文件
  console.log('Polyfills loaded');
} 
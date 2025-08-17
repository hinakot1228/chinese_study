export function hasHan(text: string): boolean {
  if (!text) return false;
  try {
    // ES2018+：漢字スクリプト（中日韓の「漢字」全般）
    return /\p{Script=Han}/u.test(text);
  } catch {
    // フォールバック（基本・拡張A・互換）
    return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(text);
  }
}

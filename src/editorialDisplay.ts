// Presentation only: preserve original evidence, record text and index decisions.
export const recordDescription = (text: string) => text
  .replaceAll("公開前に地域話者または参照資料による追加確認が必要です。", "地域話者または資料による追加確認が必要な記録です。")
  .replaceAll("周辺周辺", "周辺");

export const isEditorialExampleNotice = (text: string) =>
  /を使う会話例は確認・収集中|資料に方言例文あり（最終公開前に原文転記確認）/.test(text);

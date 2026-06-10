export const SITE = {
  name: "setlog募集ボード",
  baseUrl: "https://setlog-board.pages.dev",
  adminPassword: "setlog-admin"
};

export const TAGS = [
  "今日だけ",
  "顔出しなし",
  "初心者歓迎",
  "学生",
  "大学生",
  "社会人",
  "K-POP",
  "推し活",
  "日常ログ",
  "夜だけ",
  "ゆる募"
];

export const AGE_GROUPS = ["学生", "大学生", "社会人", "20代", "非公開"];
export const FACE_OPTIONS = ["あり", "なし", "どちらでも"];

export const NG_WORDS = [
  "彼氏",
  "彼女",
  "会いたい",
  "通話しよ",
  "住所",
  "学校名",
  "LINE",
  "line",
  "ライン",
  "電話番号",
  "電話",
  "本名",
  "恋人",
  "出会い",
  "出会お",
  "付き合",
  "性的",
  "エロ",
  "セフレ",
  "DMして",
  "インスタ",
  "Instagram",
  "discord",
  "カカオ"
];

export const PERSONAL_INFO_PATTERNS = [
  { label: "電話番号の可能性がある数字列", pattern: /0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/ },
  { label: "メールアドレス", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { label: "LINE IDらしき表現", pattern: /(LINE|line|ライン)\s*(ID|id|交換|追加|教え)/i },
  { label: "住所らしき表現", pattern: /(都|道|府|県|市|区|町|村).{0,8}(丁目|番地|在住|住み)/ },
  { label: "学校名らしき表現", pattern: /(小学校|中学校|高校|高等学校|大学|専門学校|学院)/ }
];

export const PAGE_COPY = {
  safetyNote: "出会い目的・個人情報投稿は禁止です。setlog ID以外の連絡先は載せないでください。"
};

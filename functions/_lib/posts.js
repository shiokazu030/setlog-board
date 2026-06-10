const LIFETIME_HOURS = 72;

const NG_WORDS = [
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

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init
  });

export const ok = (data) => json(data);
export const noContent = () => new Response(null, { status: 204 });
export const badRequest = (message) => json({ error: message }, { status: 400 });
export const forbidden = () => json({ error: "forbidden" }, { status: 403 });
export const serverError = () => json({ error: "server_error" }, { status: 500 });

export const isAdmin = (request, env) => {
  const url = new URL(request.url);
  const adminKey = env.ADMIN_KEY || "setlog-admin";
  return url.searchParams.get("adminKey") === adminKey;
};

export const toPublicPost = (row) => ({
  id: row.id,
  nickname: row.nickname,
  setlogId: row.setlog_id,
  ageGroup: row.age_group,
  faceOption: row.face_option,
  tags: JSON.parse(row.tags || "[]"),
  message: row.message,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  reported: Boolean(row.reported)
});

export const validatePost = (input) => {
  const errors = [];
  const tags = Array.isArray(input.tags) ? input.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const nickname = String(input.nickname || "").trim();
  const setlogId = String(input.setlogId || "").trim();
  const message = String(input.message || "").trim();
  const combined = `${nickname} ${setlogId} ${message} ${tags.join(" ")}`;

  if (!nickname) errors.push("ニックネームを入力してください。");
  if (nickname.length > 20) errors.push("ニックネームは20文字以内です。");
  if (!/^[A-Za-z0-9_.-]+$/.test(setlogId)) errors.push("setlog IDに使えない文字があります。");
  if (message.length > 80) errors.push("一言は80文字以内です。");
  if (tags.length > 8) errors.push("タグは合計8個までです。");
  tags.forEach((tag) => {
    if (tag.length > 12) errors.push("自由タグは12文字以内です。");
    if (!/^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}A-Za-z0-9ー_.-]+$/u.test(tag)) {
      errors.push("自由タグに使えない文字があります。");
    }
  });
  NG_WORDS.forEach((word) => {
    if (combined.toLowerCase().includes(word.toLowerCase())) {
      errors.push("禁止ワードが含まれています。");
    }
  });

  return {
    errors: [...new Set(errors)],
    value: {
      nickname,
      setlogId,
      ageGroup: String(input.ageGroup || "非公開"),
      faceOption: String(input.faceOption || "どちらでも"),
      tags,
      message
    }
  };
};

export const buildPostRecord = (input) => {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + LIFETIME_HOURS * 60 * 60 * 1000);
  return {
    id: crypto.randomUUID(),
    ...input,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    reported: false
  };
};

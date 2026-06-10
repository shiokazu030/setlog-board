import { AGE_GROUPS, FACE_OPTIONS, NG_WORDS, PAGE_COPY, PERSONAL_INFO_PATTERNS, SITE, TAGS } from "./content.js";
import { postsService } from "./services/postsService.js";

const app = document.querySelector("#app");
const route = normalizePath(location.pathname);
let toastTimer;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function normalizePath(path) {
  const clean = path.replace(/\/index\.html$/, "").replace(/\/$/, "");
  return clean || "/";
}

function shell(content) {
  app.innerHTML = `
    <main class="phone-shell">
      <header class="topbar">
        <a class="brand" href="/" aria-label="setlog募集ボード ホーム">
          <span class="brand-mark">s</span>
          <span>setlog募集ボード</span>
        </a>
        <a class="mini-link" href="/safe">安全ガイド</a>
      </header>
      <div class="safety-strip">${PAGE_COPY.safetyNote}</div>
      ${content}
      <nav class="bottom-nav" aria-label="メインナビゲーション">
        ${navItem("/", "ホーム", "⌂")}
        ${navItem("/board", "募集", "▦")}
        ${navItem("/post", "投稿", "+")}
        ${navItem("/how-to-use", "使い方", "?")}
        ${navItem("/rules", "ルール", "✓")}
      </nav>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </main>
  `;
}

function navItem(href, label, icon) {
  const active = route === href;
  return `<a class="${active ? "active" : ""}" href="${href}"><span>${icon}</span>${label}</a>`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function postCard(post, { admin = false } = {}) {
  return `
    <article class="post-card" data-id="${post.id}">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(post.nickname)}</h3>
          <p class="id-line">@${escapeHtml(post.setlogId)}</p>
        </div>
        ${post.reported ? '<span class="warn-chip">通報あり</span>' : ""}
      </div>
      <div class="meta-grid">
        <span>年齢層：${escapeHtml(post.ageGroup)}</span>
        <span>顔出し：${escapeHtml(post.faceOption)}</span>
      </div>
      <div class="chips">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <p class="message">${escapeHtml(post.message || "一言はありません")}</p>
      <div class="time-row">
        <span>${formatRelative(post.createdAt)}</span>
        <span>残り${remainingTime(post.expiresAt)}</span>
      </div>
      <div class="card-actions">
        <button class="primary copy-btn" data-copy="${escapeHtml(post.setlogId)}">setlog IDコピー</button>
        ${
          admin
            ? `<button class="ghost unreport-btn">通報解除</button><button class="danger delete-btn">削除</button>`
            : `<button class="ghost report-btn">通報</button>`
        }
      </div>
    </article>
  `;
}

function emptyState() {
  return `
    <section class="empty">
      <h2>まだ募集がありません</h2>
      <p>最初の募集を投稿してみよう。</p>
      <a class="primary link-button" href="/post">募集する</a>
    </section>
  `;
}

function formatRelative(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

function remainingTime(dateString) {
  const diff = new Date(dateString).getTime() - Date.now();
  if (diff <= 0) return "0分";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}時間` : `${minutes}分`;
}

function bindCardActions() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast("コピーしました");
    });
  });

  document.querySelectorAll(".report-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest(".post-card");
      await postsService.report(card.dataset.id);
      card.remove();
      showToast("通報しました。投稿は非表示になります。");
      if (!document.querySelector(".post-card")) {
        document.querySelector("#post-list")?.insertAdjacentHTML("beforeend", emptyState());
      }
    });
  });
}

async function renderHome() {
  const posts = (await postsService.getAll()).slice(0, 3);
  const popular = (await postsService.getPopularTags(TAGS)).slice(0, 8);
  shell(`
    <section class="hero">
      <p class="eyebrow">setlog ID募集掲示板</p>
      <h1>setlog仲間を探せる募集掲示板</h1>
      <p class="hero-copy">顔出しなしOK・今日だけOK・タグで探せる</p>
      <div class="hero-actions">
        <a class="primary link-button" href="/board">募集を見る</a>
        <a class="secondary link-button" href="/post">募集する</a>
      </div>
      <p class="notice">出会い目的・個人情報投稿は禁止です</p>
    </section>

    <section class="section">
      <div class="section-title">
        <h2>新着のsetlog募集</h2>
        <a href="/board">すべて見る</a>
      </div>
      <div id="post-list" class="stack">${posts.length ? posts.map((post) => postCard(post)).join("") : emptyState()}</div>
    </section>

    <section class="section">
      <h2>人気タグでsetlog ID交換を探す</h2>
      <div class="chips large">${popular.map(({ tag, count }) => `<a href="/board?tag=${encodeURIComponent(tag)}">${tag}<small>${count}</small></a>`).join("")}</div>
    </section>

    <section class="seo-text">
      <h2>セットログ友達募集を流れずに見つける</h2>
      <p>setlog募集ボードは、setlogを一緒に楽しむ人を探せる募集掲示板です。Xでは流れてしまうsetlog ID募集を、顔出しなし・今日だけ・学生・K-POP・推し活などのタグで探しやすく整理できます。</p>
    </section>
  `);
  bindCardActions();
}

async function renderBoard() {
  const params = new URLSearchParams(location.search);
  const filterTags = await getFilterTags();
  shell(`
    <section class="page-head">
      <h1>募集一覧</h1>
      <p>setlog募集、setlog ID交換、セットログ友達募集を条件で探せます。</p>
    </section>
    <section class="filters" aria-label="募集検索フィルター">
      <input id="q" type="search" placeholder="ニックネーム・ID・一言・タグで検索" value="${escapeHtml(params.get("q") || "")}" />
      <div class="select-row">
        <select id="tag"><option value="">タグすべて</option>${filterTags.map((tag) => `<option ${params.get("tag") === tag ? "selected" : ""}>${escapeHtml(tag)}</option>`).join("")}</select>
        <select id="age"><option value="">年齢層すべて</option>${AGE_GROUPS.map((age) => `<option>${age}</option>`).join("")}</select>
        <select id="face"><option value="">顔出しすべて</option>${FACE_OPTIONS.map((face) => `<option>${face}</option>`).join("")}</select>
      </div>
    </section>
    <section class="section">
      <h2>新着順のsetlog募集</h2>
      <div id="post-list" class="stack"></div>
    </section>
  `);

  const renderList = async () => {
    const q = document.querySelector("#q").value.trim().toLowerCase();
    const tag = document.querySelector("#tag").value;
    const age = document.querySelector("#age").value;
    const face = document.querySelector("#face").value;
    const posts = (await postsService.getAll()).filter((post) => {
      const haystack = [post.nickname, post.setlogId, post.message, ...post.tags].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (!tag || post.tags.includes(tag)) && (!age || post.ageGroup === age) && (!face || post.faceOption === face);
    });
    document.querySelector("#post-list").innerHTML = posts.length ? posts.map((post) => postCard(post)).join("") : emptyState();
    bindCardActions();
  };

  ["q", "tag", "age", "face"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", renderList));
  renderList();
}

async function getFilterTags() {
  const customTags = (await postsService.getAll())
    .flatMap((post) => post.tags)
    .filter((tag) => !TAGS.includes(tag));
  return [...new Set([...TAGS, ...customTags])];
}

function renderPost() {
  shell(`
    <section class="page-head">
      <h1>募集する</h1>
      <p>setlog仲間募集のための投稿です。出会い目的や個人情報は書けません。</p>
    </section>
    <form id="post-form" class="form-card" novalidate>
      <label>ニックネーム<input name="nickname" maxlength="20" required placeholder="例：りん" /></label>
      <label>setlog ID<input name="setlogId" required placeholder="例：setlog_user.01" /></label>
      <label>年齢層<select name="ageGroup">${AGE_GROUPS.map((age) => `<option>${age}</option>`).join("")}</select></label>
      <label>顔出し<select name="faceOption">${FACE_OPTIONS.map((face) => `<option>${face}</option>`).join("")}</select></label>
      <fieldset>
        <legend>募集タグ</legend>
        <div class="tag-picker">${TAGS.map((tag) => `<label><input type="checkbox" name="tags" value="${tag}" />${tag}</label>`).join("")}</div>
      </fieldset>
      <label>自由タグ<input name="customTags" maxlength="40" placeholder="例：朝活, 勉強, 韓ドラ" /></label>
      <label>一言<textarea name="message" maxlength="80" placeholder="例：今日だけゆるくログできる人募集"></textarea></label>
      <label class="agree"><input type="checkbox" name="agree" />利用ルールに同意します</label>
      <div id="errors" class="errors" aria-live="polite"></div>
      <section class="preview" id="preview">
        <h2>投稿プレビュー</h2>
        <div class="muted">入力するとここに表示されます。</div>
      </section>
      <button class="primary full" type="submit">募集を投稿する</button>
    </form>
  `);

  const form = document.querySelector("#post-form");
  const updatePreview = () => {
    const data = formData(form);
    const previewPost = {
      id: "preview",
      nickname: data.nickname || "ニックネーム",
      setlogId: data.setlogId || "setlog_id",
      ageGroup: data.ageGroup,
      faceOption: data.faceOption,
      tags: data.tags.length ? data.tags : ["タグ未選択"],
      message: data.message || "一言プレビュー",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
      reported: false
    };
    document.querySelector("#preview").innerHTML = `<h2>投稿プレビュー</h2>${postCard(previewPost)}`;
  };

  form.addEventListener("input", updatePreview);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formData(form);
    const errors = validatePost(data);
    document.querySelector("#errors").innerHTML = errors.map((error) => `<p>${error}</p>`).join("");
    if (errors.length) return;
    await postsService.create(data);
    form.reset();
    updatePreview();
    showToast("募集を投稿しました");
    setTimeout(() => (location.href = "/board"), 900);
  });
  updatePreview();
}

function formData(form) {
  const formDataObject = new FormData(form);
  const customTags = String(formDataObject.get("customTags") || "")
    .split(/[,\s、]+/)
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
  const tags = [...new Set([...formDataObject.getAll("tags"), ...customTags])];
  return {
    nickname: formDataObject.get("nickname") || "",
    setlogId: formDataObject.get("setlogId") || "",
    ageGroup: formDataObject.get("ageGroup"),
    faceOption: formDataObject.get("faceOption"),
    tags,
    message: formDataObject.get("message") || "",
    agree: formDataObject.get("agree") === "on"
  };
}

function validatePost(data) {
  const errors = [];
  const combined = `${data.nickname} ${data.setlogId} ${data.message} ${data.tags.join(" ")}`;
  if (!data.nickname.trim()) errors.push("ニックネームを入力してください。");
  if (data.nickname.length > 20) errors.push("ニックネームは20文字以内です。");
  if (!/^[A-Za-z0-9_.-]+$/.test(data.setlogId)) errors.push("setlog IDは英数字、アンダースコア、ドット、ハイフンのみ使えます。");
  if (data.message.length > 80) errors.push("一言は80文字以内です。");
  if (data.tags.length > 8) errors.push("タグは合計8個までです。");
  data.tags.forEach((tag) => {
    if (tag.length > 12) errors.push(`自由タグ「${tag}」は12文字以内にしてください。`);
    if (!/^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}A-Za-z0-9ー_.-]+$/u.test(tag)) {
      errors.push(`自由タグ「${tag}」に使えない文字が含まれています。`);
    }
  });
  if (!data.agree) errors.push("利用ルールへの同意が必要です。");
  NG_WORDS.forEach((word) => {
    if (combined.toLowerCase().includes(word.toLowerCase())) errors.push(`禁止ワード「${word}」が含まれています。`);
  });
  PERSONAL_INFO_PATTERNS.forEach(({ label, pattern }) => {
    if (pattern.test(combined)) errors.push(`${label}は投稿できません。`);
  });
  return [...new Set(errors)];
}

function renderHowToUse() {
  shell(`
    <section class="page-head"><h1>setlog募集ボードの使い方</h1><p>顔出しなしでも、今日だけでも、タグから安全に探せます。</p></section>
    ${infoSections([
      ["募集を見る方法", "募集一覧ページで新着順の投稿を確認できます。タグ、年齢層、顔出し可否、検索窓で絞り込めます。"],
      ["setlog IDをコピーする方法", "投稿カードのsetlog IDコピーボタンを押すと、IDがクリップボードにコピーされます。"],
      ["募集を投稿する方法", "投稿ページでニックネーム、setlog ID、条件、タグ、一言を入力し、利用ルールに同意して投稿します。"],
      ["顔出しなしで使う方法", "顔出しの項目で「なし」を選び、タグに「顔出しなし」を付けると探してもらいやすくなります。"],
      ["古い募集について", "MVPでは投稿から72時間で一覧から非表示になります。新しい募集を見つけやすくするためです。"]
    ])}
  `);
}

function renderSafe() {
  shell(`
    <section class="page-head"><h1>安全に使うための注意</h1><p>未成年ユーザーも想定して、個人情報と出会い目的を強く制限しています。</p></section>
    ${infoSections([
      ["setlog ID以外の個人情報を載せない", "本名、学校名、住所、電話番号、LINE ID、他SNSのIDは投稿しないでください。"],
      ["不快な相手は追加しない", "違和感がある投稿やしつこい相手とはつながらないでください。"],
      ["怪しい投稿は通報する", "各投稿カードの通報ボタンから通報できます。通報された投稿はMVPでは非表示になります。"],
      ["出会い目的の利用は禁止", "恋人募集、会う約束、性的表現、未成年へのしつこい追加や連絡は禁止です。"]
    ])}
  `);
}

function renderRules() {
  shell(`
    <section class="page-head"><h1>利用ルール</h1><p>setlog仲間募集のための掲示板です。安心して使える場にするためのルールです。</p></section>
    ${infoSections([
      ["setlog仲間募集の掲示板です", "setlogを一緒に楽しむログ仲間を探す目的で利用してください。"],
      ["禁止事項", "出会い目的、個人情報投稿、なりすまし、誹謗中傷、性的表現は禁止です。"],
      ["投稿削除について", "運営判断で投稿を削除する場合があります。トラブル防止のため、怪しい投稿は通報してください。"]
    ])}
  `);
}

function infoSections(items) {
  return `<section class="info-list">${items.map(([title, body]) => `<article><h2>${title}</h2><p>${body}</p></article>`).join("")}</section>`;
}

async function renderAdmin() {
  const authed = sessionStorage.getItem("setlog-board-admin") === "true";
  if (!authed) {
    shell(`
      <section class="page-head"><h1>管理画面</h1><p>簡易パスワードで通報一覧を確認できます。</p></section>
      <form id="admin-login" class="form-card">
        <label>パスワード<input type="password" name="password" autocomplete="current-password" /></label>
        <button class="primary full" type="submit">ログイン</button>
        <p class="muted">MVP用初期パスワード：setlog-admin</p>
      </form>
    `);
    document.querySelector("#admin-login").addEventListener("submit", (event) => {
      event.preventDefault();
      if (new FormData(event.currentTarget).get("password") === SITE.adminPassword) {
        sessionStorage.setItem("setlog-board-admin", "true");
        renderAdmin();
      } else {
        showToast("パスワードが違います");
      }
    });
    return;
  }

  const posts = await postsService.getAll({ includeExpired: true, includeReported: true });
  const reported = posts.filter((post) => post.reported);
  shell(`
    <section class="page-head"><h1>管理画面</h1><p>通報一覧、投稿削除、通報解除を確認できます。</p></section>
    <section class="section">
      <h2>通報一覧</h2>
      <div id="admin-list" class="stack">${reported.length ? reported.map((post) => postCard(post, { admin: true })).join("") : '<div class="empty"><h2>通報はありません</h2><p>現在、確認が必要な投稿はありません。</p></div>'}</div>
    </section>
  `);
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await postsService.remove(button.closest(".post-card").dataset.id);
      await renderAdmin();
      showToast("削除しました");
    });
  });
  document.querySelectorAll(".unreport-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await postsService.unreport(button.closest(".post-card").dataset.id);
      await renderAdmin();
      showToast("通報を解除しました");
    });
  });
}

const routes = {
  "/": renderHome,
  "/board": renderBoard,
  "/post": renderPost,
  "/how-to-use": renderHowToUse,
  "/safe": renderSafe,
  "/rules": renderRules,
  "/admin": renderAdmin
};

(async () => {
  await (routes[route] || renderHome)();
})();

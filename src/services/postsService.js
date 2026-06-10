const STORAGE_KEY = "setlog-board-posts-v1";
const LIFETIME_HOURS = 72;

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const write = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

const now = () => new Date();

export const postsService = {
  getAll({ includeExpired = false, includeReported = false } = {}) {
    const current = now();
    return read()
      .filter((post) => includeExpired || new Date(post.expiresAt) > current)
      .filter((post) => includeReported || !post.reported)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  create(input) {
    const createdAt = now();
    const expiresAt = new Date(createdAt.getTime() + LIFETIME_HOURS * 60 * 60 * 1000);
    const post = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nickname: input.nickname.trim(),
      setlogId: input.setlogId.trim(),
      ageGroup: input.ageGroup,
      faceOption: input.faceOption,
      tags: input.tags,
      message: input.message.trim(),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      reported: false
    };

    write([post, ...read()]);
    return post;
  },

  report(id) {
    const posts = read().map((post) => (post.id === id ? { ...post, reported: true } : post));
    write(posts);
  },

  unreport(id) {
    const posts = read().map((post) => (post.id === id ? { ...post, reported: false } : post));
    write(posts);
  },

  remove(id) {
    write(read().filter((post) => post.id !== id));
  },

  getPopularTags(tags) {
    const counts = new Map(tags.map((tag) => [tag, 0]));
    this.getAll().forEach((post) => {
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || tags.indexOf(a[0]) - tags.indexOf(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }
};

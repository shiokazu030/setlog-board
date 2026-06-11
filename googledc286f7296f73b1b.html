import { SITE } from "../content.js";

const STORAGE_KEY = "setlog-board-posts-v1";
const LIFETIME_HOURS = 72;
const API_BASE = "/api/posts";

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

const localPosts = {
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
    write(read().map((post) => (post.id === id ? { ...post, reported: true } : post)));
  },

  unreport(id) {
    write(read().map((post) => (post.id === id ? { ...post, reported: false } : post)));
  },

  remove(id) {
    write(read().filter((post) => post.id !== id));
  }
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
};

const adminQuery = () => `adminKey=${encodeURIComponent(SITE.adminPassword)}`;

export const postsService = {
  async getAll({ includeExpired = false, includeReported = false } = {}) {
    const params = new URLSearchParams();
    if (includeExpired) params.set("includeExpired", "1");
    if (includeReported) params.set("includeReported", "1");
    if (includeExpired || includeReported) params.set("adminKey", SITE.adminPassword);

    try {
      const data = await requestJson(`${API_BASE}${params.toString() ? `?${params}` : ""}`);
      return data.posts;
    } catch {
      return localPosts.getAll({ includeExpired, includeReported });
    }
  },

  async create(input) {
    try {
      const data = await requestJson(API_BASE, {
        method: "POST",
        body: JSON.stringify(input)
      });
      return data.post;
    } catch {
      return localPosts.create(input);
    }
  },

  async report(id) {
    try {
      await requestJson(`${API_BASE}/${encodeURIComponent(id)}/report`, { method: "POST" });
    } catch {
      localPosts.report(id);
    }
  },

  async unreport(id) {
    try {
      await requestJson(`${API_BASE}/${encodeURIComponent(id)}/unreport?${adminQuery()}`, { method: "POST" });
    } catch {
      localPosts.unreport(id);
    }
  },

  async remove(id) {
    try {
      await requestJson(`${API_BASE}/${encodeURIComponent(id)}?${adminQuery()}`, { method: "DELETE" });
    } catch {
      localPosts.remove(id);
    }
  },

  async getPopularTags(tags) {
    const counts = new Map(tags.map((tag) => [tag, 0]));
    const posts = await this.getAll();
    posts.forEach((post) => {
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || tags.indexOf(a[0]) - tags.indexOf(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }
};

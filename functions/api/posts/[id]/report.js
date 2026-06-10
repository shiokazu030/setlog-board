import { noContent, serverError } from "../../../_lib/posts.js";

export async function onRequestPost({ env, params }) {
  try {
    if (!env.DB) return serverError();
    await env.DB.prepare("UPDATE posts SET reported = 1 WHERE id = ?").bind(params.id).run();
    return noContent();
  } catch (error) {
    return serverError();
  }
}

import { forbidden, isAdmin, noContent, serverError } from "../../../_lib/posts.js";

export async function onRequestPost({ env, request, params }) {
  try {
    if (!env.DB) return serverError();
    if (!isAdmin(request, env)) return forbidden();
    await env.DB.prepare("UPDATE posts SET reported = 0 WHERE id = ?").bind(params.id).run();
    return noContent();
  } catch (error) {
    return serverError();
  }
}

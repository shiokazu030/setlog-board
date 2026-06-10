import { forbidden, isAdmin, noContent, serverError } from "../../../_lib/posts.js";

export async function onRequestDelete({ env, request, params }) {
  try {
    if (!env.DB) return serverError();
    if (!isAdmin(request, env)) return forbidden();
    await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(params.id).run();
    return noContent();
  } catch (error) {
    return serverError();
  }
}

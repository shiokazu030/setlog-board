import { badRequest, buildPostRecord, isAdmin, ok, serverError, toPublicPost, validatePost } from "../../_lib/posts.js";

export async function onRequestGet({ env, request }) {
  try {
    if (!env.DB) return serverError();

    const url = new URL(request.url);
    const admin = isAdmin(request, env);
    const includeExpired = admin && url.searchParams.get("includeExpired") === "1";
    const includeReported = admin && url.searchParams.get("includeReported") === "1";
    const conditions = [];
    const bindings = [];

    if (!includeExpired) {
      conditions.push("expires_at > ?");
      bindings.push(new Date().toISOString());
    }

    if (!includeReported) {
      conditions.push("reported = 0");
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { results } = await env.DB.prepare(
      `SELECT * FROM posts ${where} ORDER BY created_at DESC LIMIT 200`
    )
      .bind(...bindings)
      .all();

    return ok({ posts: results.map(toPublicPost) });
  } catch (error) {
    return serverError();
  }
}

export async function onRequestPost({ env, request }) {
  try {
    if (!env.DB) return serverError();

    const body = await request.json();
    const { errors, value } = validatePost(body);
    if (errors.length) return badRequest(errors[0]);

    const post = buildPostRecord(value);
    await env.DB.prepare(
      `INSERT INTO posts
        (id, nickname, setlog_id, age_group, face_option, tags, message, created_at, expires_at, reported)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
      .bind(
        post.id,
        post.nickname,
        post.setlogId,
        post.ageGroup,
        post.faceOption,
        JSON.stringify(post.tags),
        post.message,
        post.createdAt,
        post.expiresAt
      )
      .run();

    return ok({ post });
  } catch (error) {
    return serverError();
  }
}

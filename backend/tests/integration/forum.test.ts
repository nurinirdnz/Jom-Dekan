import request from "supertest";
import { createApp } from "../../src/app";
import { pool } from "../../src/config/config/db";
import { userModel } from "../../src/models/userModel";

const app = createApp();

async function dbReachable(): Promise<boolean> {
  try {
    await pool.query("SELECT 1 FROM forum_posts LIMIT 1");
    return true;
  } catch {
    return false;
  }
}

async function registerUser(label: string) {
  const email = `forum-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password: "correcthorsebattery", displayName: label });
  return {
    email,
    token: res.body.accessToken as string,
    id: res.body.user.id as string,
  };
}

async function createPost(
  token: string,
  overrides: Partial<Record<string, unknown>> = {},
) {
  const res = await request(app)
    .post("/api/v1/forum/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: `Test Post ${Date.now()}`,
      body: "Post body text.",
      ...overrides,
    });
  return res.body.data.id as string;
}

async function createComment(
  token: string,
  postId: string,
  body = "A comment.",
) {
  const res = await request(app)
    .post(`/api/v1/forum/posts/${postId}/comments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ body });
  return res.body.data.id as string;
}

describe("Forum API", () => {
  let skip = false;
  let ownerToken = "";
  let strangerToken = "";
  let adminToken = "";

  beforeAll(async () => {
    skip = !(await dbReachable());
    if (skip) return;

    const owner = await registerUser("owner");
    ownerToken = owner.token;

    const stranger = await registerUser("stranger");
    strangerToken = stranger.token;

    const admin = await registerUser("admin");
    await userModel.setRole(admin.id, "ADMIN");
    const relogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: admin.email, password: "correcthorsebattery" });
    adminToken = relogin.body.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects an unauthenticated request", async () => {
    if (skip) return;
    const res = await request(app).get("/api/v1/forum/posts");
    expect(res.status).toBe(401);
  });

  it("creates a post, adds a comment, and lists both correctly", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken, { title: "Original Title" });

    const commentRes = await request(app)
      .post(`/api/v1/forum/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ body: "First comment." });
    expect(commentRes.status).toBe(201);

    // Scoped to ?mine=true so this stays small and deterministic
    // regardless of how many posts other test runs have accumulated in
    // the shared test database.
    const listRes = await request(app)
      .get("/api/v1/forum/posts?mine=true")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(listRes.status).toBe(200);
    const created = listRes.body.data.find(
      (p: { id: string }) => p.id === postId,
    );
    expect(created).toBeTruthy();
    expect(created.commentCount).toBe(1);
    expect(created.title).toBe("Original Title");

    const commentsRes = await request(app)
      .get(`/api/v1/forum/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(commentsRes.status).toBe(200);
    expect(commentsRes.body.data).toHaveLength(1);
    expect(commentsRes.body.data[0].body).toBe("First comment.");
  });

  it("lets a stranger view but not edit/delete a post (403), while the owner and admin can", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);

    const strangerEditRes = await request(app)
      .put(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ title: "Hijacked", body: "Hijacked body." });
    expect(strangerEditRes.status).toBe(403);

    const ownerEditRes = await request(app)
      .put(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Updated by owner", body: "Updated body." });
    expect(ownerEditRes.status).toBe(200);

    const strangerDeleteRes = await request(app)
      .delete(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(strangerDeleteRes.status).toBe(403);

    const adminDeleteRes = await request(app)
      .delete(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminDeleteRes.status).toBe(200);
  });

  it("casts a vote on a post and a comment, and reflects the score", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);
    const commentId = await createComment(ownerToken, postId);

    const postVoteRes = await request(app)
      .post("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_post", targetId: postId, value: 1 });
    expect(postVoteRes.status).toBe(200);

    const commentVoteRes = await request(app)
      .post("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_comment", targetId: commentId, value: 1 });
    expect(commentVoteRes.status).toBe(200);

    const postDetailRes = await request(app)
      .get(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(postDetailRes.body.data.voteScore).toBe(1);
    expect(postDetailRes.body.data.myVote).toBe(1);

    const commentsRes = await request(app)
      .get(`/api/v1/forum/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(commentsRes.body.data[0].voteScore).toBe(1);
    expect(commentsRes.body.data[0].myVote).toBe(1);
  });

  it("changes vote direction (up to down) without creating a second row, then removes it", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);

    await request(app)
      .post("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_post", targetId: postId, value: 1 });

    const flipRes = await request(app)
      .post("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_post", targetId: postId, value: -1 });
    expect(flipRes.status).toBe(200);

    const countAfterFlip = await pool.query(
      "SELECT COUNT(*) FROM votes WHERE target_type='forum_post' AND target_id=$1",
      [postId],
    );
    expect(Number(countAfterFlip.rows[0].count)).toBe(1);

    const detailRes = await request(app)
      .get(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(detailRes.body.data.voteScore).toBe(-1);

    const removeRes = await request(app)
      .delete("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_post", targetId: postId });
    expect(removeRes.status).toBe(200);

    const countAfterRemove = await pool.query(
      "SELECT COUNT(*) FROM votes WHERE target_type='forum_post' AND target_id=$1",
      [postId],
    );
    expect(Number(countAfterRemove.rows[0].count)).toBe(0);
  });

  it("never creates more than one row when conflicting votes are cast concurrently (double-click / replay)", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);

    const [resA, resB] = await Promise.all([
      request(app)
        .post("/api/v1/forum/votes")
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ targetType: "forum_post", targetId: postId, value: 1 }),
      request(app)
        .post("/api/v1/forum/votes")
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ targetType: "forum_post", targetId: postId, value: -1 }),
    ]);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM votes WHERE target_type='forum_post' AND target_id=$1",
      [postId],
    );
    // The UNIQUE(user_id, target_type, target_id) constraint from
    // migration 006 is what actually guarantees this.
    expect(Number(countRes.rows[0].count)).toBe(1);
  });

  it("rejects commenting on a deleted post (404)", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);
    await request(app)
      .delete(`/api/v1/forum/posts/${postId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    const res = await request(app)
      .post(`/api/v1/forum/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ body: "Too late." });
    expect(res.status).toBe(404);
  });

  it("rejects voting on a deleted comment (404)", async () => {
    if (skip) return;
    const postId = await createPost(ownerToken);
    const commentId = await createComment(ownerToken, postId);
    await request(app)
      .delete(`/api/v1/forum/comments/${commentId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    const res = await request(app)
      .post("/api/v1/forum/votes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ targetType: "forum_comment", targetId: commentId, value: 1 });
    expect(res.status).toBe(404);
  });

  it("rejects a request body with an unknown field", async () => {
    if (skip) return;
    const res = await request(app)
      .post("/api/v1/forum/posts")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Sneaky",
        body: "Body.",
        authorId: "should-not-be-settable",
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

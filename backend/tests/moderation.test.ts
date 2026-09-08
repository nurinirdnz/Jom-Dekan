import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/config/config/db";

const app = createApp();

describe("Notifications & Admin Moderation Endpoints", () => {
  let adminToken: string = "";
  let studentToken: string = "";
  let testNotificationId: string = "";

  beforeAll(async () => {
    // Setup test tokens or seed test users if needed
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should fetch user notifications with valid authentication", async () => {
    if (!studentToken) return;
    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      testNotificationId = res.body.data[0].id;
    }
  });

  it("should mark a notification as read", async () => {
    if (!testNotificationId || !studentToken) return;

    const res = await request(app)
      .patch(`/api/v1/notifications/${testNotificationId}/read`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.read_at).not.toBeNull();
  });

  it("should restrict admin moderation queue to administrators", async () => {
    if (!studentToken || !adminToken) return;
    const studentRes = await request(app)
      .get("/api/v1/admin/moderation/queue")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(studentRes.status).toBe(403);

    const adminRes = await request(app)
      .get("/api/v1/admin/moderation/queue")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body).toHaveProperty("data");
  });

  it("should require a mandatory audit reason (min 5 chars) for moderation actions", async () => {
    if (!adminToken) return;
    const res = await request(app)
      .patch("/api/v1/admin/resource/some-uuid/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve", reason: "bad" });

    expect(res.status).toBe(400);
  });
});

import request from "supertest";
import { createApp } from "../../src/app";
import { pool } from "../../src/config/config/db";
import { userModel } from "../../src/models/userModel";
import { seededTaxonomy, baseRegisterPayload } from "../helpers/registerPayload";

const app = createApp();

async function dbReachable(): Promise<boolean> {
  try {
    await pool.query("SELECT 1 FROM universities LIMIT 1");
    return true;
  } catch {
    return false;
  }
}

describe("Taxonomy API", () => {
  let skip = false;
  let userToken = "";
  let adminToken = "";

  beforeAll(async () => {
    skip = !(await dbReachable());
    if (skip) return;

    const taxonomy = await seededTaxonomy();
    if (!taxonomy) {
      skip = true;
      return;
    }

    const email = `taxonomy-user-${Date.now()}@example.com`;
    const userRes = await request(app)
      .post("/api/v1/auth/register")
      .send(baseRegisterPayload(taxonomy, { email, displayName: "Regular Student" }));
    userToken = userRes.body.accessToken;

    const adminEmail = `taxonomy-admin-${Date.now()}@example.com`;
    const adminRes = await request(app)
      .post("/api/v1/auth/register")
      .send(baseRegisterPayload(taxonomy, { email: adminEmail, displayName: "Admin Student" }));
    adminToken = adminRes.body.accessToken;
    await userModel.setRole(adminRes.body.user.id, "ADMIN");
    // Re-login so the access token's role claim reflects the promotion.
    const relogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: adminEmail, password: "correcthorsebattery" });
    adminToken = relogin.body.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("lets an unauthenticated request read the university list (needed by the registration form)", async () => {
    if (skip) return;
    const res = await request(app).get("/api/v1/taxonomy/universities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("still rejects an unauthenticated request to create a university", async () => {
    if (skip) return;
    const res = await request(app)
      .post("/api/v1/taxonomy/universities")
      .send({ name: "Should Not Be Created" });
    expect(res.status).toBe(401);
  });

  it("lets a regular USER read the list but not create", async () => {
    if (skip) return;
    const listRes = await request(app)
      .get("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${userToken}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const createRes = await request(app)
      .post("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Should Not Be Created" });
    expect(createRes.status).toBe(403);
  });

  it("lets an ADMIN create a university, then rejects a duplicate name", async () => {
    if (skip) return;
    const name = `Test University ${Date.now()}`;

    const createRes = await request(app)
      .post("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.isActive).toBe(true);

    const dupRes = await request(app)
      .post("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name });
    expect(dupRes.status).toBe(409);
  });

  it("lets an ADMIN archive a university", async () => {
    if (skip) return;
    const createRes = await request(app)
      .post("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Archive Me ${Date.now()}` });

    const archiveRes = await request(app)
      .patch(`/api/v1/taxonomy/universities/${createRes.body.data.id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.isActive).toBe(false);
  });

  it("rejects a request body with an unknown field", async () => {
    if (skip) return;
    const res = await request(app)
      .post("/api/v1/taxonomy/universities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Sneaky Uni", role: "ADMIN" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

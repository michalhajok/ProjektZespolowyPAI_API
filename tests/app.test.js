// tests/app.test.js

import request from "supertest";
import app from "./setup.js";
import User from "../src/models/User.js";

let token;
let catId;
let eqId;

describe("Health Check", () => {
  it("GET /api/health should return status success", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("API is running");
  });
});

describe("Auth & User Flow", () => {
  it("POST /api/auth/register should create a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.token).toBeDefined();
  });

  it("POST /api/auth/login should authenticate user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it("GET /api/users/me without auth should return 401", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/users/me with auth should return current user", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("test@example.com");
  });
});

describe("Equipment Endpoints", () => {
  it("POST /api/equipment as customer should return 401", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Drill",
        category: "000000000000000000000000",
        pricing: { dailyRate: 10 },
      });
    expect(res.statusCode).toBe(401);
  });

  it("Elevate to admin, re-login and create category", async () => {
    // Elevate in DB
    const user = await User.findOne({ email: "test@example.com" });
    user.role = "admin";
    await user.save();

    // Re-login to get new token with admin role
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Password123" });
    expect(loginRes.statusCode).toBe(200);
    token = loginRes.body.data.token;

    // Create category as admin
    const categoryRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Tools" });
    expect(categoryRes.statusCode).toBe(201);
    catId = categoryRes.body.data._id;
  });

  it("POST /api/equipment should create equipment as admin", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Drill", category: catId, pricing: { dailyRate: 10 } });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Drill");
    eqId = res.body.data._id;
  });

  it("GET /api/equipment should list equipment", async () => {
    const res = await request(app)
      .get("/api/equipment")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0]._id).toBe(eqId);
  });
});

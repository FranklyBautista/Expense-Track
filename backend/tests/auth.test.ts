import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { clearDb, registerUser, loginAndGetCookie } from "./helpers";

describe("Auth", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("register -> 201 and returns { data }", async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("email");
  });

  it("login -> 200 and sets cookie token", async () => {
    const { payload } = await registerUser();

    const { res, cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(200);
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("token=");
    expect(res.body).toHaveProperty("data");
  });

  it("me -> 200 with cookie", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    expect(cookie).toBeTruthy();

    const meRes = await request(app).get("/auth/me").set("Cookie", cookie!);

    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty("data");
    expect(meRes.body.data).toHaveProperty("email");
  });

  it("logout -> 204", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app).post("/auth/logout").set("Cookie", cookie!);
    expect(res.status).toBe(204);
  });
});

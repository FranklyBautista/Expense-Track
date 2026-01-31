import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { clearDb, registerUser, loginAndGetCookie } from "./helpers";

describe("Expenses", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("list -> 200 and returns { data: [] } when empty", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app).get("/expenses").set("Cookie", cookie!);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it("create -> 201 and returns created expense in { data }", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app)
      .post("/expenses")
      .set("Cookie", cookie!)
      .send({ title: "Comida", amount: 10, category: "Food", info: "Lunch" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.title).toBe("Comida");
  });

  it("update -> 200 and returns updated expense", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    const createRes = await request(app)
      .post("/expenses")
      .set("Cookie", cookie!)
      .send({ title: "Uber", amount: 5 });

    const id = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/expenses/${id}`)
      .set("Cookie", cookie!)
      .send({ title: "Uber (updated)", amount: 6 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty("data");
    expect(updateRes.body.data.title).toBe("Uber (updated)");
    expect(updateRes.body.data.amount).toBe(6);
  });

  it("delete -> 204", async () => {
    const { payload } = await registerUser();

    const { cookie } = await loginAndGetCookie({
      email: payload.email,
      password: payload.password,
    });

    const createRes = await request(app)
      .post("/expenses")
      .set("Cookie", cookie!)
      .send({ title: "Netflix", amount: 12 });

    const id = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/expenses/${id}`)
      .set("Cookie", cookie!);

    expect(delRes.status).toBe(204);
  });

  it("ownership -> user B cannot delete user A expense (404)", async () => {
    // User A
    const { payload: payloadA } = await registerUser({
      email: "a@test.com",
      password: "123456",
      name: "User A",
    });

    const { cookie: cookieA } = await loginAndGetCookie({
      email: payloadA.email,
      password: payloadA.password,
    });

    const createRes = await request(app)
      .post("/expenses")
      .set("Cookie", cookieA!)
      .send({ title: "A expense", amount: 1 });

    const expenseId = createRes.body.data.id;

    // User B
    const { payload: payloadB } = await registerUser({
      email: "b@test.com",
      password: "123456",
      name: "User B",
    });

    const { cookie: cookieB } = await loginAndGetCookie({
      email: payloadB.email,
      password: payloadB.password,
    });

    const delRes = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set("Cookie", cookieB!);

    expect(delRes.status).toBe(404);
  });
});

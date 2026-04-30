import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Order } from "../src/models/Order.model";

let mongoServer: MongoMemoryServer;
let token: string;
let app: import("express").Express;

const login = async (): Promise<void> => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: "admin", password: "admin123" });
  token = response.body.data.token;
};

const createSampleOrder = async () =>
  request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      customerName: "Ravi Kumar",
      phoneNumber: "9876543210",
      garments: [{ name: "Shirt", quantity: 2 }],
    });

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "admin123";
  process.env.DELIVERY_DAYS_OFFSET = "2";

  const appModule = await import("../src/app");
  app = appModule.app;

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  await login();
});

beforeEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("POST /api/orders creates an order", async () => {
  const response = await createSampleOrder();

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data.orderId).toMatch(/^ORD-\d{8}-[a-f0-9]{4}$/i);
});

test("POST /api/orders rejects invalid garment", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      customerName: "Ravi Kumar",
      phoneNumber: "9876543210",
      garments: [{ name: "Invalid", quantity: 1 }],
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
});

test("POST /api/orders rejects invalid phone number", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      customerName: "Ravi Kumar",
      phoneNumber: "123456",
      garments: [{ name: "Shirt", quantity: 1 }],
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
});

test("PATCH /api/orders/:orderId/status allows forward transition", async () => {
  const createResponse = await createSampleOrder();
  const orderId = createResponse.body.data.orderId as string;

  const response = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "PROCESSING" });

  expect(response.status).toBe(200);
  expect(response.body.data.status).toBe("PROCESSING");
});

test("PATCH /api/orders/:orderId/status rejects backward transition", async () => {
  const createResponse = await createSampleOrder();
  const orderId = createResponse.body.data.orderId as string;

  await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "PROCESSING" });

  await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "READY" });

  const response = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "PROCESSING" });

  expect(response.status).toBe(400);
  expect(response.body.error.message).toBe("Invalid status transition");
});

test("GET /api/dashboard returns stats shape", async () => {
  await createSampleOrder();

  const response = await request(app)
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty("totalOrders");
  expect(response.body.data).toHaveProperty("totalRevenue");
  expect(response.body.data).toHaveProperty("ordersByStatus");
  expect(response.body.data).toHaveProperty("revenueToday");
  expect(response.body.data).toHaveProperty("ordersToday");
});

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

describe('Message Routes Test', () => {
  let testUserToken;

  // set up test data
  beforeEach(async function () {
    await db.query(`DELETE FROM messages`);
    await db.query(`DELETE FROM users`);
    await db.query(`ALTER SEQUENCE messages_id_seq RESTART WITH 1`);

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "14155551111"
    });

    let u2 = await User.register({
      username: "test2",
      password: "password2",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "14155552222"
    });

    let u3 = await User.register({
      username: "test3",
      password: "password3",
      first_name: "Test3",
      last_name: "Testy3",
      phone: "14155553333"
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "test1 -> test2"
    });

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "test2 -> test1"
    });
    
    let m3 = await Message.create({
      from_username: "test2",
      to_username: "test3",
      body: "test2 -> test3"
    });

    testUserToken = jwt.sign({ username: "test1" }, SECRET_KEY);
  });

  // GET /messages/:id => { message }
  describe("GET /messages/:id", function () {
    test('can get message from user', async () => {
      let response = await request(app)
        .get("/messages/1")
        .send({ _token: testUserToken });
      
      expect(response.body).toEqual({
        message: {
          id: 1,
          body: "test1 -> test2",
          sent_at: expect.any(String),
          read_at: null,
          from_user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155551111"
          },
          to_user: {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155552222"
          }
        }
      });
    });

    test("can get message to user", async () => {
      let response = await request(app)
        .get("/messages/2")
        .sent({ _token: testUserToken });
      
      expect(response.body).toEqual({
        message: {
          id: 2,
          body: "test2 -> test1",
          sent_at: expect.any(String),
          read_at: null,
          to_user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "14155551111"
          },
          from_user: {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "14155552222"
          }
        }
      });
    });

    test("invalid message id", async () => {
      let response = await request(app)
        .get("/messages/0")
        .send({ _token: testUserToken });
      
      expect(response.statusCode).toEqual(404);
    });

    test("can't read a message not sent to/from user", async () => {
      let response = await request(app)
        .get("/messages/3")
        .send({ _token: testUserToken });
      
      expect(response.statusCode).toEqual(401);
    });
  });

  // POST / => { message }
  describe("POST /", function () {
    test("can post message", async () => {
      let response = await request(app)
        .post("/messages/")
        .send({
          to_username: "test2",
          body: "new message from test1 -> test2",
          _token: testUserToken
        });
      
      expect(response.body).toEqual({
        message: {
          id: 4, 
          sent_at: expect.any(String),
          from_username: "test1",
          to_username: "test2",
          body: "new message from test1 -> test2"
        }
      });
    });

    test("can't send to username that doesn't exist", async () => {
      let response = await request(app)
        .post("/messages/")
        .send({
          to_username: "nobodywiththisname",
          body: "message body",
          _token: testUserToken
        });
      
      expect(response.statusCode).toEqual(500);
    });
  });

  // POST /messages/:id/read => { message: id, read_at }
  describe("POST /messages/:id/read", function () {
    test("mark users' messages read", async () => {
      let response = await request(app)
        .post("/messages/2/read")
        .send({ _token: testUserToken });
      
      expect(response.body).toEqual({
        message: {
          id: 2,
          read_at: expect.any(String)
        }
      });
    });

    test("invalid message id", async () => {
      let response = await request(app)
        .post("/messages/0/read")
        .send({ _token: testUserToken });
      
      expect(response.statusCode).toEqual(404);
    });

    test("can't mark messages not to user as read", async () => {
      let response = await request(app)
        .post("/messages/1/read")
        .send({ _token: testUserToken });
      
      expect(response.statusCode).toEqual(401);
    });
  });
});

afterAll(async () => { 
  await db.end();
});

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 4000;
const app = express();
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = "shahi63e5ab1ce27e1";
const store_passwd = "shahi63e5ab1ce27e1@ssl";
const is_live = false;
require("dotenv").config();
const router = express.Router();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Intialize the firebase-admin project/account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//MIDDLEWARE SETUP

app.use(cors());
app.use(express.json());

// SERVER STATUS

app.get("/", (req, res) => {
  res.status(200).send("Server Running [OK]");
});
app.listen(port, () => {
  console.log("[*] Listening to port ", port);
});

//MONGODB CONNECTION AND CONFIGUREING API

const uri = `mongodb+srv://practice:ISlz3WEfWEIrIGjT@cluster0.wzlrk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION DEBUGING
client.connect((err) => {
  if (err === undefined) {
    console.log("[*] Database Connected Successfully.");
  } else {
    console.error("[*] Database Connection Failed.");
  }

  // Routing Start =========>

  async function run() {
    try {
      await client.connect();
      const database = client.db("project-101-doctor");
      const haiku3 = database.collection("doctordata");
      const haiku4 = database.collection("prinfo");
      const haiku5 = database.collection("users");
      const haiku6 = database.collection("pres-img");
      const haiku7 = database.collection("pres-info");
      const haiku8 = database.collection("reg-user-info");
      const haiku9 = database.collection("medicine");
      const haiku10 = database.collection("carts");
      const haiku11 = database.collection("payment-history");

      app.delete("/delete/firebase/account/:mail", async (req, res) => {
        const email = req.params.mail;
        try {
          const user = await admin.auth().getUserByEmail(email);
          await admin.auth().deleteUser(user.uid);
          res.send({ message: email });
        } catch (err) {
          res.send({ message: err });
        }
      });

      // GET,POST,PUT,DELETE FOR /users
      app.get("/users", async (req, res) => {
        res.send(await haiku5.find({}).toArray());
      });
      app.get("/users/:email", async (req, res) => {
        const user = await haiku5.findOne({ email: req.params.email });
        let isAdmin = false;
        let isDoctor = false;
        if (user?.role === "admin") {
          isAdmin = true;
        } else if (user?.role === "doctor") {
          isDoctor = true;
        }
        res.json({ admin: isAdmin, doctor: isDoctor });
      });

      app.post("/users", async (req, res) => {
        res.json(await haiku5.insertOne(req.body));
      });
      app.put("/users/:email", async (req, res) => {
        const result = await haiku5.updateOne(
          { email: req.params.email },
          { $set: { role: "admin" } }
        );
        res.send(result);
      });
        app.put("/users/make/:email", async (req, res) => {
           const result = await haiku5.updateOne(
             { email: req.params.email },
             { $set: { role: "user" } }
           );
           res.send(result);
         });
      app.delete("/users/:id", async (req, res) => {
        res.json(await haiku5.deleteOne({ _id: ObjectId(req.params.id) }));
      });

      // GET,POST,DELETE FOR /reg-user-info

      app.get("/reg-user-info", async (req, res) => {
        res.send(await haiku8.find({}).toArray());
      });
      app.post("/reg-user-info", async (req, res) => {
        res.json(await haiku8.insertOne(req.body));
      });
      app.delete("/reg-user-info/:id", async (req, res) => {
        res.json(await haiku8.deleteOne({ _id: ObjectId(req.params.id) }));
      });

      // GET,POST FOR /pres-info

      app.get("/pres-info", async (req, res) => {
        res.send(await haiku7.find({}).toArray());
      });
      app.post("/pres-info", async (req, res) => {
        res.json(await haiku7.insertOne(req.body));
      });

      // GET,POST,DELETE FOR /pres-img

      app.get("/pres-img", async (req, res) => {
        res.send(await haiku6.find({}).toArray());
      });
      app.get("/pres-img/:email", async (req, res) => {
        res.json(await haiku6.findOne({ owner: req.params.email }));
      });
      app.post("/pres-img", async (req, res) => {
        res.json(await haiku6.insertOne(req.body));
      });
      app.delete("/pres-img/:id", async (req, res) => {
        res.json(await haiku6.deleteOne({ _id: ObjectId(req.params.id) }));
      });

      // GET,POST,PUT,DELETE FOR /users-info

      app.get("/users-info", async (req, res) => {
        res.send(await haiku4.find({}).toArray());
      });

      app.get("/users-info/:id", async (req, res) => {
        res.json(await haiku4.findOne({ _id: ObjectId(req.params.id) }));
      });

      app.post("/users-info", async (req, res) => {
        res.json(await haiku4.insertOne(req.body));
      });

      app.post("/doctorlist", async (req, res) => {
        res.json(await haiku3.insertOne(req.body));
      });

      app.put("/users-info", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const option = { upsert: true };
        const update = { $set: user };
        const result = await haiku4.updateOne(filter, update, option);
        res.json(result);
      });

      app.put("/users-info/:id", async (req, res) => {
        const result = await haiku4.updateOne(
          { _id: ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.json(result);
      });

      app.delete("/users-info/:id", async (req, res) => {
        res.json(await haiku4.deleteOne({ _id: ObjectId(req.params.id) }));
      });

      // GET,DELETE FOR /doctorlist

      app.get("/doctorlist", async (req, res) => {
        res.send(await haiku3.find({}).toArray());
      });

      app.get("/doctorlist/:id", async (req, res) => {
        res.json(await haiku3.findOne({ _id: ObjectId(req.params.id) }));
      });

      app.delete("/doctorlist/:id", async (req, res) => {
        res.json(await haiku3.deleteOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/doctorlist/delete/all", async (req, res) => {
        res.json(await haiku3.deleteMany({}));
      });

      //GET,POST,DEL For Medicine
      app.get("/medicine", async (req, res) => {
        res.send(await haiku9.find({}).toArray());
      });
      app.post("/add/medicine", async (req, res) => {
        res.json(await haiku9.insertOne(req.body));
      });
      app.get("/medicine/:id", async (req, res) => {
        res.json(await haiku9.findOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/medicine/:id", async (req, res) => {
        res.json(await haiku9.deleteOne({ _id: ObjectId(req.params.id) }));
      });
      //GET,POST,DEL For Medicine
      app.get("/carts", async (req, res) => {
        res.send(await haiku10.find({}).toArray());
      });
      app.get("/carts/email/:mail", async (req, res) => {
        res.send(
          await haiku10.find({ "payload.email": req.params.mail }).toArray()
        );
      });
      app.post("/add/carts", async (req, res) => {
        res.json(await haiku10.insertOne(req.body));
      });
      app.get("/carts/:id", async (req, res) => {
        res.json(await haiku10.findOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/carts/:id", async (req, res) => {
        res.json(await haiku10.deleteOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/carts/clear/:mail", async (req, res) => {
        try {
          const result = await haiku10.deleteMany({
            "payload.email": req.params.mail,
          });
          res.json({ deletedCount: result.deletedCount });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Error deleting documents" });
        }
      });
      app.delete("/carts/delete/all", async (req, res) => {
        res.json(await haiku10.deleteMany({}));
      });
      //GET,POST,DEL For Medicine
      app.get("/payment-history", async (req, res) => {
        res.send(await haiku11.find({}).toArray());
      });
      app.get("/payment-history/:mail", async (req, res) => {
        const result = await haiku11
          .aggregate([
            {
              $match: { "payload.email": req.params.mail },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $toInt: "$payload.price" } },
              },
            },
          ])
          .toArray();

        res.json(result);
      });
      app.post("/add/payment-history", async (req, res) => {
        res.json(await haiku11.insertMany(req.body));
      });
      app.get("/payment-history/:id", async (req, res) => {
        res.json(await haiku11.findOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/payment-history/:id", async (req, res) => {
        res.json(await haiku11.deleteOne({ _id: ObjectId(req.params.id) }));
      });
      app.delete("/payment-history/delete/all", async (req, res) => {
        res.json(await haiku11.deleteMany({}));
      });
      //SSL-PAYMENT
      app.get("/payment/:id/:am/:cus/:mail/:status", async (req, res) => {
        console.log(req.params);
        /**
         * Create ssl session request
         */
        const status = req.params.status;
        let data;
        status === "payDoc"
          ? (data = {
              total_amount: 1000 || req.params.am,
              currency: "BDT",
              tran_id: "REF123",
              success_url: `https://api-sastho-seba.onrender.com/ssl-payment-success-doc/${req.params.id}`,
              fail_url: `https://api-sastho-seba.onrender.com/ssl-payment-fail`,
              cancel_url: `https://api-sastho-seba.onrender.com/ssl-payment-cancel`,
              shipping_method: "No",
              product_name: "Computer.",
              product_category: "Electronic",
              product_profile: "general",
              cus_name: req.params.cus,
              cus_email: req.params.mail,
              cus_add1: "Dhaka",
              cus_add2: "Dhaka",
              cus_city: "Dhaka",
              cus_state: "Dhaka",
              cus_postcode: "1000",
              cus_country: "Bangladesh",
              cus_phone: "01711111111",
              cus_fax: "01711111111",
              multi_card_name: "mastercard",
              value_a: "ref001_A",
              value_b: "ref002_B",
              value_c: "ref003_C",
              value_d: "ref004_D",
              ipn_url: `https://api-sastho-seba.onrender.com/ssl-payment-notification`,
            })
          : (data = {
              total_amount:1000 || req.params.am,
              currency: "BDT",
              tran_id: "REF123",
              success_url: `https://api-sastho-seba.onrender.com/ssl-payment-success`,
              fail_url: `https://api-sastho-seba.onrender.com/ssl-payment-fail`,
              cancel_url: `https://api-sastho-seba.onrender.com/ssl-payment-cancel`,
              shipping_method: "No",
              product_name: "Computer.",
              product_category: "Electronic",
              product_profile: "general",
              cus_name: req.params.cus,
              cus_email: req.params.mail,
              cus_add1: "Dhaka",
              cus_add2: "Dhaka",
              cus_city: "Dhaka",
              cus_state: "Dhaka",
              cus_postcode: "1000",
              cus_country: "Bangladesh",
              cus_phone: "01711111111",
              cus_fax: "01711111111",
              multi_card_name: "mastercard",
              value_a: "ref001_A",
              value_b: "ref002_B",
              value_c: "ref003_C",
              value_d: "ref004_D",
              ipn_url: `https://api-sastho-seba.onrender.com/ssl-payment-notification`,
            });

        const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, false);
        sslcommerz.init(data).then((data) => {
          console.log(data);
          if (data?.GatewayPageURL) {
            return res.status(200).redirect(data?.GatewayPageURL);
          } else {
            return res.status(400).json({
              message: "Session was not successful",
            });
          }
        });
      });

      app.post("/ssl-payment-notification", async (req, res) => {
        /**
         * If payment notification
         */

        return res.status(200).json({
          data: req.body,
          message: "Payment notification",
        });
      });

      app.post("/ssl-payment-success", async (req, res) => {
        return res
          .status(200)
          .redirect("https://sasthoseba.netlify.app/payment-success");
      });
      app.post("/ssl-payment-success-doc/:id", async (req, res) => {
        axios.put(`https://api-sastho-seba.onrender.com/users-info/${req.params.id}`,{apstatus:"Paid"})
        res
          .status(200)
          .redirect("https://sasthoseba.netlify.app/payment-success-doc");
        
      });

      app.post("/ssl-payment-fail", async (req, res) => {
        /**
         * If payment failed
         */

        return res.status(200).json({
          data: req.body,
          message: "Payment failed",
        });
      });

      app.post("/ssl-payment-cancel", async (req, res) => {
        /**
         * If payment cancelled
         */
        return res.status(200).json({
          data: req.body,
          message: "Payment cancelled",
        });
      });
    } finally {
    }
  }
  run().catch(console.dir);
});

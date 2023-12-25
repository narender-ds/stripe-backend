// const express = require('express');
// const bodyParser = require('body-parser');
// const stripe = require('stripe')(
//   'sk_test_51OHN0eSImdOPVCehYkC9PLLY7b447zozju3uYgYd96Hw50GMdWGujjvJRHmb9rw10MUAue0HpglVzs5j8nexixIi00CE5E7SVd',
// );

// const app = express();
// const port = 3001;

// app.use(bodyParser.json());

// // Endpoint to create a customer
// app.post('/create-customer', async (req, res) => {
//   try {
//     const {name, email} = req.body;
//     const customer = await stripe.customers.create({
//       email: email,
//       name: name,
//       // Add more parameters as needed
//     });
//     res.json(customer);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({error: 'Something went wrong'});
//   }
// });

// // Endpoint to create a Payment Intent
// // app.post('/create-payment-intent', async (req, res) => {
// //   try {
// //     const {amount, currency, customerId} = req.body;
// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount: amount,
// //       currency: currency,
// //       customer: customerId,
// //       payment_method_types: ['card'],
// //       // Add more parameters as needed
// //     });
// //     res.json({clientSecret: paymentIntent.client_secret});
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({error: 'Something went wrong'});
// //   }
// // });

// app.post('/payment-sheet', async (req, res) => {
//   console.log('req', req.body.grandTotal);
//   const {grandTotal} = req.body;
//   const customer = await stripe.customers.create();
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     {customer: customer.id},
//     {apiVersion: '2023-10-16'},
//   );
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: grandTotal,
//     currency: 'eur',
//     customer: customer.id,
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.json({
//     paymentIntent: paymentIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//     publishableKey:
//       'pk_test_51OHN0eSImdOPVCehCs7vpOxzj7iSMmnBjENI8AGXvynJO8gHIV1VVTEfdyNAUbxIquULPgVPcvqyWOopFU1ZQj2K00z9msofrq',
//   });
// });
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Define corsOptions
// const corsOptions = {
//   origin: 'http://192.168.9.113',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204,
// };

app.use(cors());

app.use(bodyParser.json());


app.get("/connection-made",async (req,res)=>
{
  res.json({
status:200,
message:"Connected Successfully."
  });})

app.post("/payment-sheet", async (req, res) => {
  console.log("req", req.body.grandTotal);
  console.log("req.cUSTOMER", req.body.billingAddress);
  const grandTotalInCents = Math.round(req.body.grandTotal * 100);
  const { firstName, lastName, email, address, city, zipCode, country } =
    req.body.billingAddress;

  const customer = await stripe.customers.create({
    name: `${firstName} ${lastName}`,
    email: email,
    address: {
      line1: address,
      city: city,
      postal_code: zipCode,
      country: country,
    },
  });
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-10-16" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: grandTotalInCents,
    currency: "INR",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.json({
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

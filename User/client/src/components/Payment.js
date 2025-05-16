import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage";
import { useParams } from "react-router-dom";
import "../css/Payment.css";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51QURhPAx2perfVvzaSUqZTN8HTaEjn4xv7EqTUMx1RP1HwY7xXNO4ViIbzV5ySpv1i8ex8VbLkbmsMFeJSaz5ToP00OwA0xdcms");

const Payments = () => {

  const { amount } = useParams();

  const convertToSubcurrency = (amount, factor = 100) => {
    return Math.round(amount * factor);
  };

  return (
    <div className="main-container">
      <div className="header">
        <h1>Complete Your Payment</h1>

      </div>

      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          currency: "usd",
        }}
      >
        <CheckoutPage amount={amount} />
      </Elements>
    </div>
  );
};

export default Payments;
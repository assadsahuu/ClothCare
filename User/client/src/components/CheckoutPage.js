import React, { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import "..css/CheckoutPage.css";


const CheckoutPage = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const convertToSubcurrency = (amount, factor = 100) => {
    return Math.round(amount * factor);
  };


  //check this again .........
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post("/create-payment-intent", {
          amount: convertToSubcurrency(amount),
        });
        console.log(response)
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }


    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://localhost:3000/payment-success/${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" role="status">
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {clientSecret && <PaymentElement />}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className={`submit-button ${loading ? "button-loading" : ""}`}
      // onClick={()=>navigate('/payment-success')}
      >
        {!loading ? `Pay $${amount}` : "Processing..."}
      </button>
    </form>
  );
};

export default CheckoutPage;
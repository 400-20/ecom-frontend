import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useNewOrderMutation } from "../redux/api/orderApi";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { NewOrderRequest } from "../types/api-types";
import { responseToast } from "../utils/features";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
const CheckOutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const { user } = useSelector((state: RootState) => state.userReducer)
    const cartState = useSelector((state: RootState) => state.cartReducer);

  console.log("Cart Reducer State:", cartState);

  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cartReducer);

  const [isProcessing, setIsProccesing] = useState(false)
  const [newOrder] = useNewOrderMutation();


  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProccesing(true)
    const orderData: NewOrderRequest = {
      shippingInfo,
      orderItems: cartItems,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      user: user?._id ?? ""
    };
    const { paymentIntent, error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.origin }, redirect: "if_required" });
console.log(error);

    if (error) {
      setIsProccesing(false)
      return toast.error(error.message || "Something Went Wrong")
    }
    if (paymentIntent.status === "succeeded") {
      const res = await newOrder(orderData)
      console.log(res);
      dispatch(resetCart())
      responseToast(res, navigate, '/orders')
    }
    setIsProccesing(false)
  };


  return <div className='checkout-container'>

    <form onSubmit={submitHandler}>
      <PaymentElement />
      <button disabled={isProcessing}>
        {isProcessing ? "Proccesing" : "Pay"}
      </button>
    </form>
  </div>
}

function Checkout() {
  const location = useLocation()
  const clientSecret: string | undefined = location.state
  if (!clientSecret) return <Navigate to={'/shipping'} />

  return <Elements options={{ clientSecret }} stripe={stripePromise}>
<div className='checkoutform'>
    <CheckOutForm />
</div>
  </Elements>
}

export default Checkout
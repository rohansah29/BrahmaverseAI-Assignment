import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./components/HomePage";
import OtpVerification from "./components/auth/OtpVerification";
import PhoneSignUp from "./components/auth/PhoneSignUp";
import ProductPage from "./components/ProductPage";
import { foods } from "./data/foods";
import {
  addItem,
  selectCart,
  selectFood as selectFoodAction,
  selectProductQuantity,
  selectSelectedFood,
  setItemQuantity,
} from "./store/orderSlice";

export default function App() {
  const [screen, setScreen] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  const dispatch = useDispatch();
  const selectedFood = useSelector((state) => selectSelectedFood(state, foods));
  const quantity = useSelector(selectProductQuantity);
  const cart = useSelector(selectCart);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const openProduct = (food) => {
    dispatch(selectFoodAction(food));
    setScreen("product");
  };

  const addToCart = (food, amount = 1) => {
    dispatch(addItem({ foodId: food.id, quantity: amount }));
    notify(`${amount} × ${food.name} added to cart`);
  };

  const saveProductToCart = () => {
    const existingQuantity = cart[selectedFood.id] || 0;
    dispatch(setItemQuantity({ foodId: selectedFood.id, quantity }));
    notify(
      existingQuantity
        ? `${selectedFood.name} cart quantity updated to ${quantity}`
        : `${quantity} × ${selectedFood.name} added to cart`,
    );
    setScreen("home");
  };

  if (screen === "phone") {
    return (
      <>
        <PhoneSignUp
          phone={phone}
          onPhoneChange={setPhone}
          onContinue={() =>
            phone.length === 10
              ? setScreen("otp")
              : notify("Enter a valid 10-digit mobile number")
          }
          onBack={() => notify("Welcome to Fastor")}
        />
        {toast && <div role="status" className="toast">{toast}</div>}
      </>
    );
  }

  if (screen === "otp") {
    return (
      <>
        <OtpVerification
          phone={phone}
          otp={otp}
          onOtpChange={setOtp}
          onContinue={() =>
            otp.length === 6
              ? setScreen("home")
              : notify("Enter any 6 digits for this UI demo")
          }
          onResend={() => notify("Demo: OTP resend is not connected")}
          onBack={() => setScreen("phone")}
        />
        {toast && <div role="status" className="toast">{toast}</div>}
      </>
    );
  }

  return (
    <>
      {screen === "product" ? (
        <ProductPage
          onBack={() => setScreen("home")}
          onOpenCart={() => setCartOpen(true)}
          onAddToCart={saveProductToCart}
        />
      ) : (
        <HomePage
          query={query}
          category={category}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onOpenCart={() => setCartOpen(true)}
          onSelectFood={openProduct}
          onExploreOffers={() => {
            setCategory("Pizza");
            notify("Showing pizza favourites");
          }}
        />
      )}
      {cartOpen && (
        <CartDrawer
          onClose={() => setCartOpen(false)}
        />
      )}
      {toast && <div role="status" className="toast">{toast}</div>}
    </>
  );
}

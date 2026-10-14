import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { foods } from "../data/foods";
import { money } from "../utils/format";
import {
  selectProductQuantity,
  selectSelectedFood,
  setProductQuantity,
} from "../store/orderSlice";

export default function ProductPage({ onBack, onAddToCart }) {
  const dispatch = useDispatch();
  const food = useSelector((state) => selectSelectedFood(state, foods));
  const quantity = useSelector(selectProductQuantity);
  const [selectedPortion, setSelectedPortion] = useState(0);
  const portions = [
    { label: "Personal (4 Slides)", price: "$0.00", extra: 0 },
    { label: "Medium (8 Slides)", price: "$3.00", extra: 3 },
    { label: "Familiar (10 Slides)", price: "$6.00", extra: 6 },
    { label: "Jumbo (12 Slides)", price: "$10.00", extra: 10 },
  ];
  const unitPrice = food.price + portions[selectedPortion].extra;
  return (
    <main className="app-page product-screen">
      <header className="product-topbar">
        <button className="product-back-button" onClick={onBack} aria-label="Back to menu">
          <ArrowLeft size={19} />
        </button>
        <h2>Product Details</h2>
      </header>
      <div className="product-page">
        <img className="hero-food" src={food.image} alt={food.name} />
        <div className="price-row">
          <strong>{money(unitPrice)}</strong>
          <div className="qty">
            <button aria-label="Decrease quantity" onClick={() => dispatch(setProductQuantity(quantity - 1))}>
              <Minus size={15} />
            </button>
              <b>{quantity}</b>
            <button aria-label="Increase quantity" onClick={() => dispatch(setProductQuantity(quantity + 1))}>
              <Plus size={15} />
            </button>
          </div>
        </div>
        <h1>{food.id === 1 ? "Lorem ipsum dolor sit amet" : food.name}</h1>
        <p className="description">{food.id === 1
          ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
          : food.description}</p>
        <div className="portion-title">Personal portion</div>
        <div className="portion-options" role="radiogroup" aria-label="Choose a portion">
          {portions.map((portion, index) => {
            const selected = selectedPortion === index;
            return (
              <button
                type="button"
                className="portion"
                role="radio"
                aria-checked={selected}
                key={portion.label}
                onClick={() => setSelectedPortion(index)}
              >
                <span>{portion.label}</span>
                <b>{portion.price}</b>
                <span className={selected ? "selected-dot" : "empty-dot"} />
              </button>
            );
          })}
        </div>
        <button className="primary add-button" onClick={() => onAddToCart(unitPrice)}>
          Add to cart
        </button>
      </div>
    </main>
  );
}

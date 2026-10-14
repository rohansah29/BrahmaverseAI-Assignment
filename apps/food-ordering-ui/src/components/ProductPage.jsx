import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { foods } from "../data/foods";
import { money } from "../utils/format";
import {
  selectCartCount,
  selectCart,
  selectProductQuantity,
  selectSelectedFood,
  setProductQuantity,
} from "../store/orderSlice";

export default function ProductPage({
  onBack,
  onOpenCart,
  onAddToCart,
}) {
  const dispatch = useDispatch();
  const food = useSelector((state) => selectSelectedFood(state, foods));
  const quantity = useSelector(selectProductQuantity);
  const cartCount = useSelector(selectCartCount);
  const cart = useSelector(selectCart);
  const isInCart = Boolean(cart[food.id]);

  return (
    <main className="app-page">
      <header className="topbar">
        <button className="icon-button" onClick={onBack} aria-label="Back to menu"><ArrowLeft /></button>
        <b>Item details</b>
        <button className="icon-button" onClick={onOpenCart} aria-label={`Open cart, ${cartCount} items`}>
          <ShoppingBag />
          <span className="count">{cartCount}</span>
        </button>
      </header>
      <div className="product-page">
        <img className="hero-food" src={food.image} alt={food.name} />
        <div className="price-row">
          <strong>{money(food.price)}</strong>
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
        <h1>{food.name}</h1>
        <p className="description">{food.description}</p>
        <div className="section-head">
          <h2>Personal portion</h2>
          <span>Choose quantity</span>
        </div>
        <div className="portion">
          <span>Single serving</span>
          <b>{money(food.price)}</b>
          <span className="selected-dot"><Check size={12} /></span>
        </div>
        <div className="portion">
          <span>Double serving</span>
          <b>{money(food.price * 1.7)}</b>
          <span className="empty-dot" />
        </div>
        <div className="portion">
          <span>Family serving</span>
          <b>{money(food.price * 2.5)}</b>
          <span className="empty-dot" />
        </div>
        <button className="primary add-button" onClick={onAddToCart}>
          {isInCart ? "Done" : "Add to cart"} · {quantity} item{quantity === 1 ? "" : "s"} · {money(food.price * quantity)}
        </button>
      </div>
    </main>
  );
}

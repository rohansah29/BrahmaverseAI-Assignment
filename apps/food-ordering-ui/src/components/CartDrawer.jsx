import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { foods } from "../data/foods";
import { money } from "../utils/format";
import { removeItem, selectCart, selectCartPrices } from "../store/orderSlice";

export default function CartDrawer({ onClose }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const cartPrices = useSelector(selectCartPrices);
  const unitPrice = (food) => cartPrices[food.id] ?? food.price;
  const entries = foods.filter((food) => (cart[food.id] || 0) > 0);
  const total = entries.reduce(
    (sum, food) => sum + unitPrice(food) * cart[food.id],
    0,
  );

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <section className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>Your cart</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close cart">
            <X />
          </button>
        </header>
        {entries.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Add something delicious!</p>
        ) : (
          entries.map((food) => (
            <div className="cart-line" key={food.id}>
              <img src={food.image} alt="" />
              <span>
                <b>{food.name}</b>
                <small>
                  {cart[food.id]} × {money(unitPrice(food))}
                </small>
              </span>
              <strong>{money(unitPrice(food) * cart[food.id])}</strong>
              <button
                onClick={() => dispatch(removeItem(food.id))}
                aria-label={`Remove ${food.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
        <div className="cart-total">
          <span>Total</span>
          <b>{money(total)}</b>
        </div>
        <button
          className="primary"
          onClick={() => alert("Demo checkout: no payment is processed.")}
        >
          Continue to checkout
        </button>
      </section>
    </div>
  );
}

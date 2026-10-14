import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Clock3, MapPin, Plus, Search, ShoppingBag } from "lucide-react";
import { categories, foods } from "../data/foods";
import { money } from "../utils/format";
import { addItem, selectCart, selectCartCount } from "../store/orderSlice";

export default function HomePage({
  query,
  category,
  onQueryChange,
  onCategoryChange,
  onOpenCart,
  onSelectFood,
  onExploreOffers,
}) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const cartCount = useSelector(selectCartCount);
  const filteredFoods = useMemo(
    () =>
      foods.filter(
        (food) =>
          (category === "All" || food.category === category) &&
          food.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, category],
  );

  return (
    <main className="app-page">
      <header className="topbar">
        <div>
          <span className="eyebrow">Current location</span>
          <div className="location">
            <MapPin size={14} /> Model Town, New Delhi <ChevronRight size={14} />
          </div>
        </div>
        <button className="cart-button" onClick={onOpenCart} aria-label={`Open cart, ${cartCount} items`}>
          <ShoppingBag size={19} />
          <span>{cartCount}</span>
        </button>
      </header>
      <div className="home-content">
        <div className="search-wrap">
          <Search size={17} />
          <input
            aria-label="Search food"
            placeholder="Search your favourite food"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <button
            onClick={() => {
              onQueryChange("");
              onCategoryChange("All");
            }}
          >
            Clear
          </button>
        </div>
        <div className="greeting">
          <div>
            <span className="eyebrow">Good food, good mood</span>
            <h1>What are you craving?</h1>
          </div>
          <span className="avatar">F</span>
        </div>
        <div className="section-head">
          <h2>Best Seller</h2>
          <span>Popular today</span>
        </div>
        <div className="category-row">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "chip active" : "chip"}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="food-grid">
          {filteredFoods.slice(0, 4).map((food) => (
            <article className="food-card" key={food.id}>
              <button className="food-card-open" onClick={() => onSelectFood(food)} aria-label={`View ${food.name}`}>
                <img src={food.image} alt={food.name} />
                <span className="food-name">{food.name}</span>
                <span className="food-meta">{food.category}</span>
              </button>
              <span className="food-card-bottom">
                <b>{money(food.price)}</b>
                <span className="food-card-actions">
                  {cart[food.id] > 0 && <span className="food-quantity">{cart[food.id]}</span>}
                  <button
                    className="plus-circle"
                    onClick={() => dispatch(addItem({ foodId: food.id, quantity: 1 }))}
                    aria-label={`Add ${food.name} to cart`}
                  >
                    <Plus size={16} />
                  </button>
                </span>
              </span>
            </article>
          ))}
        </div>
        <div className="promo">
          <div>
            <span>CHEF&apos;S SPECIAL</span>
            <h2>30% OFF</h2>
            <p>Good things are on the menu.</p>
            <button onClick={onExploreOffers}>Explore offers</button>
          </div>
          <img src={foods[0].image} alt="Pizza special" />
        </div>
        <div className="section-head">
          <h2>Popular Items</h2>
          <span><Clock3 size={13} /> 20–30 min</span>
        </div>
        <div className="popular-list">
          {foods.slice(1, 4).map((food) => (
            <button className="popular-item" key={food.id} onClick={() => onSelectFood(food)}>
              <img src={food.image} alt="" />
              <span>
                <b>{food.name}</b>
                <small>{food.category} · Freshly prepared</small>
              </span>
              <strong>{money(food.price)}</strong>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

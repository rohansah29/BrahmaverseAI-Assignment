import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { categories, foods } from "../data/foods";
import { money } from "../utils/format";
import { addItem, selectCart, selectCartCount } from "../store/orderSlice";

const sellerItems = [
  { food: foods[1], image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=420&q=85", price: "$103.0", name: "Sushi" },
  { food: foods[1], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=420&q=85", price: "$50.0", name: "Chicken curry" },
  { food: foods[0], image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=420&q=85", price: "$12.99", name: "Lasagna" },
  { food: foods[3], image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=420&q=85", price: "$8.20", name: "Berry cupcake" },
];

const promoSlides = [
  { title: "30% OFF", caption: "Experience our delicious new dish", image: foods[0].image },
  { title: "20% OFF", caption: "Freshly made, just for you", image: foods[1].image },
  { title: "Sweet break", caption: "Treat yourself to something nice", image: foods[4].image },
];

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
  const cartCount = useSelector(selectCartCount);
  const cart = useSelector(selectCart);
  const [slide, setSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % promoSlides.length), 3500);
    return () => window.clearInterval(timer);
  }, []);
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
    <main className="app-page home-screen">
      <div className="status-bar"></div>
      <header className="home-location">
        <span className="eyebrow">Current Locations</span>
        <div className="location">Model Town, New Delhi <ChevronRight size={12} /></div>
      </header>
      <div className="home-content">
        <div className="home-tools">
          <div className="profile-name">Karan</div>
          <button className="tool-button call-button" aria-label="Call restaurant"><Phone size={17} /></button>
          <button className="tool-button wallet-button" onClick={onOpenCart} aria-label={`Open cart, ${cartCount} items`}><ShoppingBag size={17} /><span className="wallet-count">{cartCount}</span></button>
        </div>
        <div className="section-head">
          <h2>Best Seller</h2>
          <span />
        </div>
        <div className="seller-row">
          {sellerItems.map((item) => (
            <button className="seller-card" key={item.name} onClick={() => onSelectFood(item.food)} aria-label={`View ${item.name}`}>
              <img src={item.image} alt={item.name} />
              <b>{item.price}</b>
            </button>
          ))}
        </div>
        <div className="promo-viewport" onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={(event) => {
          if (touchStart === null) return;
          const delta = event.changedTouches[0].clientX - touchStart;
          if (Math.abs(delta) > 35) setSlide((current) => (current + (delta < 0 ? 1 : promoSlides.length - 1)) % promoSlides.length);
          setTouchStart(null);
        }}>
          {promoSlides.map((item, index) => (
            <div className={`promo ${index === slide ? "active" : ""}`} key={item.title} aria-hidden={index !== slide}>
              <div>
                <span>{item.caption}</span>
                <h2>{item.title}</h2>
              </div>
              <img src={item.image} alt="" onError={(event) => {
                if (event.currentTarget.src !== foods[0].image) event.currentTarget.src = foods[0].image;
              }} />
            </div>
          ))}
        </div>
        <div className="promo-dots" aria-label="Promotion slides">
          {promoSlides.map((item, index) => <button className={index === slide ? "active" : ""} key={item.title} onClick={() => setSlide(index)} aria-label={`Show promotion ${index + 1}`} />)}
        </div>
        <div className="section-head">
          <h2>Popular Items</h2>
          <span />
        </div>
        <div className="popular-list">
          {[foods[4], foods[1]].map((food, index) => (
            <div className="popular-item" key={food.id}>
              <button className="popular-image-button" onClick={() => onSelectFood(food)} aria-label={`View ${food.name}`}>
                <img src={food.image} alt="" />
              </button>
              <span>
                <b>{food.name}</b>
                <small>{index === 0 ? "29 Nov, 01:20 pm" : "17 Oct, 01:20 pm"}</small>
                <span className="order-actions"><button>Cancel Order</button><button onClick={() => onSelectFood(food)}>Track Driver</button></span>
              </span>
              <strong>{money(food.price)}</strong>
              <small className="item-count">{index === 0 ? "2 items" : "1 item"}</small>
            </div>
          ))}
        </div>
        <div className="menu-section">
          <div className="section-head menu-heading"><h2>Order Again</h2><span>Choose your favourites</span></div>
          <div className="menu-filter">
            <div className="menu-search"><Search size={15} /><input aria-label="Filter menu" placeholder="Search menu" value={query} onChange={(event) => onQueryChange(event.target.value)} /></div>
            <div className="category-row">
              {categories.map((item) => <button key={item} className={category === item ? "chip active" : "chip"} onClick={() => onCategoryChange(item)}>{item}</button>)}
            </div>
          </div>
          <div className="menu-grid">
            {filteredFoods.map((food) => (
              <article className="food-card" key={food.id}>
                <button className="food-card-open" onClick={() => onSelectFood(food)} aria-label={`View ${food.name}`}>
                  <img src={food.image} alt={food.name} /><span className="food-name">{food.name}</span><span className="food-meta">{food.category}</span>
                </button>
                <span className="food-card-bottom"><b>{money(food.price)}</b><span className="food-card-actions">{cart[food.id] > 0 && <span className="food-quantity">{cart[food.id]}</span>}<button className="plus-circle" onClick={() => dispatch(addItem({ foodId: food.id, quantity: 1, unitPrice: food.price }))} aria-label={`Add ${food.name} to cart`}><Plus size={15} /></button></span></span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

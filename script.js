/* ===== 1. PRODUCT DATA =====
   To use a real photo, add:  img: "images/shirt.jpg"
   If there is no img, the emoji and colour are shown instead. */
const products = [
  { id: 1,  name: "Classic White T-Shirt",  price: 499,  gender: "Men",   type: "Tops",        emoji: "👕", color: "#dbeafe", tag: "Bestseller" },
  { id: 2,  name: "Slim Fit Blue Jeans",    price: 1299, gender: "Men",   type: "Bottoms",     emoji: "👖", color: "#bfdbfe" },
  { id: 3,  name: "Denim Jacket",           price: 1999, gender: "Men",   type: "Outerwear",   emoji: "🧥", color: "#c7d2fe", tag: "New" },
  { id: 4,  name: "Formal Shirt",           price: 899,  gender: "Men",   type: "Tops",        emoji: "👔", color: "#e0e7ff" },
  { id: 5,  name: "Cozy Grey Hoodie",       price: 1499, gender: "Men",   type: "Outerwear",   emoji: "🧥", color: "#e5e7eb" },
  { id: 6,  name: "Running Sneakers",       price: 2499, gender: "Men",   type: "Shoes",       emoji: "👟", color: "#fed7aa", tag: "Hot" },
  { id: 7,  name: "Floral Summer Dress",    price: 1599, gender: "Women", type: "Dresses",     emoji: "👗", color: "#fbcfe8", tag: "Bestseller" },
  { id: 8,  name: "Cotton Kurti",           price: 799,  gender: "Women", type: "Tops",        emoji: "👚", color: "#fde68a" },
  { id: 9,  name: "Leather Handbag",        price: 1299, gender: "Women", type: "Accessories", emoji: "👜", color: "#fecaca", tag: "New" },
  { id: 10, name: "Elegant High Heels",     price: 1799, gender: "Women", type: "Shoes",       emoji: "👠", color: "#f5d0fe" },
  { id: 11, name: "Pleated Skirt",          price: 999,  gender: "Women", type: "Bottoms",     emoji: "👗", color: "#ddd6fe" },
  { id: 12, name: "Stylish Sunglasses",     price: 599,  gender: "Women", type: "Accessories", emoji: "🕶️", color: "#fef3c7" },
  { id: 13, name: "Casual Cap",             price: 349,  gender: "Men",   type: "Accessories", emoji: "🧢", color: "#bbf7d0" },
  { id: 14, name: "Party Wear Gown",        price: 2999, gender: "Women", type: "Dresses",     emoji: "👗", color: "#fda4af", tag: "Premium" }
];

/* ===== 2. SHORTCUTS & STATE ===== */
const $ = id => document.getElementById(id);
const rupee = n => "₹" + n.toLocaleString("en-IN");
let filters = { gender: "all", type: "all", q: "", sort: "default" };
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("stylehubCart")) || []; }
  catch (e) { return []; }
}
function saveCart() {
  try { localStorage.setItem("stylehubCart", JSON.stringify(cart)); } catch (e) {}
}

/* ===== 3. SHOW PRODUCTS (search + filters + sort) ===== */
function showProducts() {
  let list = products.filter(p =>
    (filters.gender === "all" || p.gender === filters.gender) &&
    (filters.type === "all" || p.type === filters.type) &&
    (p.name + " " + p.type + " " + p.gender).toLowerCase().includes(filters.q.toLowerCase())
  );
  if (filters.sort === "low") list.sort((a, b) => a.price - b.price);
  if (filters.sort === "high") list.sort((a, b) => b.price - a.price);

  $("resultCount").textContent = list.length + " product(s) found";
  $("productGrid").innerHTML = list.length ? list.map(p => `
    <div class="card">
      <div class="card-img" style="background:${p.color}">
        ${p.img ? `<img src="${p.img}" alt="${p.name}">` : p.emoji}
        ${p.tag ? `<span class="badge">${p.tag}</span>` : ""}
      </div>
      <div class="card-body">
        <small class="muted" style="margin:0;text-align:left">${p.gender} · ${p.type}</small>
        <h3>${p.name}</h3>
        <div class="price">${rupee(p.price)}</div>
        <button class="btn" data-add="${p.id}">Add to Cart</button>
      </div>
    </div>`).join("")
    : `<div class="empty">😕 No products found. Try another search.</div>`;
}

/* Sync the Men/Women/All buttons with the current filter */
function updateChips() {
  document.querySelectorAll("#genderFilters .chip").forEach(c =>
    c.classList.toggle("active", c.dataset.gender === filters.gender));
}

/* ===== 4. FILTER EVENTS ===== */
$("search").addEventListener("input", e => { filters.q = e.target.value; showProducts(); });
$("typeFilter").addEventListener("change", e => { filters.type = e.target.value; showProducts(); });
$("sort").addEventListener("change", e => { filters.sort = e.target.value; showProducts(); });
$("genderFilters").addEventListener("click", e => {
  if (e.target.dataset.gender) {
    filters.gender = e.target.dataset.gender;
    updateChips(); showProducts();
  }
});

/* Links in menu / homepage that set a filter (Men, Women, Accessories) */
document.querySelectorAll("[data-gender], [data-type]").forEach(link => {
  if (link.classList.contains("chip")) return;
  link.addEventListener("click", () => {
    if (link.dataset.gender) { filters.gender = link.dataset.gender; filters.type = "all"; $("typeFilter").value = "all"; }
    if (link.dataset.type)   { filters.type = link.dataset.type; filters.gender = "all"; $("typeFilter").value = link.dataset.type; }
    updateChips(); showProducts();
    $("nav").classList.remove("show");
  });
});

/* ===== 5. SHOPPING CART ===== */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id: id, qty: 1 });
  saveCart(); showCart();
  toast("Added to cart ✔");
}

function changeQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); showCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); showCart();
}

function showCart() {
  let total = 0, count = 0;
  const html = cart.map(c => {
    const p = products.find(x => x.id === c.id);
    total += p.price * c.qty;
    count += c.qty;
    return `
      <div class="cart-item">
        <div class="ci-img" style="background:${p.color}">${p.emoji}</div>
        <div class="ci-info">
          <b>${p.name}</b>
          ${rupee(p.price)}
          <div class="qty">
            <button data-minus="${p.id}">−</button>
            <span>${c.qty}</span>
            <button data-plus="${p.id}">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${p.id}" title="Remove">🗑️</button>
      </div>`;
  }).join("");

  $("cartItems").innerHTML = html || `<p class="cart-empty">🛒 Your cart is empty</p>`;
  $("cartTotal").textContent = rupee(total);
  $("cartCount").textContent = count;
}

/* Click handling for all "Add to Cart" and cart buttons */
document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.add)    addToCart(Number(t.dataset.add));
  if (t.dataset.plus)   changeQty(Number(t.dataset.plus), 1);
  if (t.dataset.minus)  changeQty(Number(t.dataset.minus), -1);
  if (t.dataset.remove) removeItem(Number(t.dataset.remove));
});

/* Open / close the cart */
function openCart()  { $("cart").classList.add("open");    $("overlay").classList.add("show"); }
function closeCart() { $("cart").classList.remove("open"); $("overlay").classList.remove("show"); }
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

$("clearCart").addEventListener("click", () => { cart = []; saveCart(); showCart(); });
$("checkout").addEventListener("click", () => {
  if (cart.length === 0) { toast("Your cart is empty!"); return; }
  alert("🎉 Thank you for shopping with StyleHub!\nThis is a demo, so no real payment was made.");
  cart = []; saveCart(); showCart(); closeCart();
});

/* ===== 6. MOBILE MENU ===== */
$("menuBtn").addEventListener("click", () => $("nav").classList.toggle("show"));
document.querySelectorAll("#nav a").forEach(a =>
  a.addEventListener("click", () => $("nav").classList.remove("show")));

/* ===== 7. CONTACT FORM ===== */
$("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("cName").value.trim();
  const email = $("cEmail").value.trim();
  const msg = $("cMsg").value.trim();
  const out = $("formMsg");

  if (!name || !email || !msg) {
    out.className = "form-msg error"; out.textContent = "Please fill in all the fields."; return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    out.className = "form-msg error"; out.textContent = "Please enter a valid email address."; return;
  }
  out.className = "form-msg ok";
  out.textContent = "Thank you, " + name + "! We will reply soon. ✅";
  e.target.reset();
});

/* ===== 8. SMALL MESSAGE (TOAST) ===== */
let toastTimer;
function toast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ===== 9. START ===== */
$("year").textContent = new Date().getFullYear();
showProducts();
showCart();

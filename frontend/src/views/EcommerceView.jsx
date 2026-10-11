import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Sparkles,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const EcommerceView = ({
  isCartOpen: externalIsCartOpen,
  setIsCartOpen: externalSetIsCartOpen,
  externalSearchQuery,
}) => {
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartSubtotal } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = setInternalSearchQuery;

  // Cart Drawer & Checkout modal
  const [internalIsCartOpen, setInternalIsCartOpen] = useState(false);
  const isCartOpen = externalIsCartOpen !== undefined ? externalIsCartOpen : internalIsCartOpen;
  const setIsCartOpen = externalSetIsCartOpen || setInternalIsCartOpen;
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Checkout Form
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || 'Ramesh Kumar',
    phone: user?.phone || '+91 94432 11029',
    email: user?.email || 'farmer@gmail.com',
    shippingAddress: user?.address || 'Aliyar Valley Canal Bank, Pollachi',
    city: user?.city || 'Coimbatore',
    paymentMethod: 'Cash on Delivery',
  });

  useEffect(() => {
    if (user) {
      setCheckoutData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        shippingAddress: user.address || prev.shippingAddress,
        city: user.city || prev.city,
      }));
    }
  }, [user]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All Items' && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const [catRes, prodRes] = await Promise.all([
        api.getCategoriesSummary(),
        api.getProducts(params),
      ]);

      if (catRes.success) setCategories(catRes.categories);
      if (prodRes.success && Array.isArray(prodRes.products)) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, searchQuery]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const payload = {
        customerName: checkoutData.name,
        customerPhone: checkoutData.phone,
        customerEmail: checkoutData.email,
        shippingAddress: `${checkoutData.shippingAddress}, ${checkoutData.city}`,
        channel: 'ECOMMERCE_WEB',
        items: cart.map((c) => ({
          productId: c._id,
          productName: c.name,
          sku: c.sku,
          quantity: c.quantity,
          unitPrice: c.sellingPrice,
          unit: c.unit,
        })),
        discount: 0,
        taxRate: 0.05,
        paymentMethod: checkoutData.paymentMethod,
        paymentStatus: checkoutData.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Confirmed', // Automatically confirms and decreases stock!
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setOrderConfirmation(res.order);
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        loadCatalog();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Order placement error');
    }
  };

  const deliveryFee = cartSubtotal > 2000 ? 0 : 99;
  const grandTotal = cartSubtotal + (cartSubtotal > 0 ? deliveryFee : 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top E-Commerce Store Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#191815] to-[#27241e] text-white rounded-3xl p-8 border border-[#332f27] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Farm Supplies Storefront</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Order Certified Seeds, Bio-Fertilizers & Farm Tools
          </h1>
          <p className="text-xs text-[#b8b2a5] leading-relaxed">
            Delivering quality agricultural inputs directly to your farm gate. Fast dispatch with real-time stock availability.
          </p>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-6 py-3.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1c1914] font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2.5 shrink-0"
        >
          <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          <span>My Cart</span>
          {cartCount > 0 && (
            <span className="w-6 h-6 rounded-full bg-[#1b1914] text-[#f59e0b] flex items-center justify-center font-extrabold text-xs ml-1">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills matching ERP theme */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#f59e0b] text-[#1a1813] shadow-xs'
                  : 'bg-white text-[#524e46] border border-[#e8e5de] hover:border-[#cfcbc2]'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                  isActive ? 'bg-[#e59307] text-[#1a1813]' : 'bg-[#f2efe9] text-[#716c63]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by crop, seed type, chemical..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e2db] rounded-xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Product Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 py-16 text-center text-xs text-[#8e897e]">
            Loading agricultural products catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-4 py-16 text-center text-xs text-[#8e897e]">
            No products found matching category.
          </div>
        ) : (
          products.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const inCartItem = cart.find((c) => c._id === p._id);

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-[#ece8df] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition group"
              >
                {/* Product Image / Thumbnail */}
                <div className="h-44 bg-[#faf9f5] relative overflow-hidden flex items-center justify-center p-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Package className="w-8 h-8" />
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1b1915]/80 backdrop-blur-xs text-[#f59e0b]">
                    {p.category}
                  </span>

                  {/* Stock Status Tag */}
                  <span
                    className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOutOfStock
                        ? 'bg-red-500 text-white'
                        : p.currentStock <= p.minStockLevel
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : `${p.currentStock} ${p.unit} in stock`}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1f1d19] line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-[#787265] mt-1 line-clamp-2">
                      {p.description || `High-grade agricultural ${p.category} stored in ${p.location}.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f2efe8] flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-[#1f1d19]">
                        ₹{p.sellingPrice}
                      </span>
                      <span className="text-[11px] text-[#8e897e] ml-1">
                        /{p.unit}
                      </span>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p, 1)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : inCartItem
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813]'
                      }`}
                    >
                      {inCartItem ? `In Cart (${inCartItem.quantity})` : '+ Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ece8df]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-[#1f1d19]">
                    Your Shopping Cart ({cartCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-[#8f897e] hover:text-[#1f1d19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-xs text-[#8f897e]">
                    <p>Your agricultural shopping cart is empty.</p>
                    <p className="mt-1">Add items from the store catalogue.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#1f1d19] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#736e65]">
                          ₹{item.sellingPrice} /{item.unit}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-[#e2dfd7] bg-white rounded-lg">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-l"
                          >
                            <Minus className="w-3 h-3 text-[#524e45]" />
                          </button>
                          <span className="px-2 font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-r"
                          >
                            <Plus className="w-3 h-3 text-[#524e45]" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#ece8df] space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#615c52]">
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#615c52]">
                  <span>Delivery to Farm Gate:</span>
                  <span>{deliveryFee === 0 ? <b className="text-emerald-600">FREE</b> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex items-center justify-between text-base font-extrabold text-[#1f1d19] pt-2 border-t border-[#ece8df]">
                  <span>Total Amount:</span>
                  <span className="text-amber-600">₹{grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl transition shadow-xs text-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e2db] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div>
                <h3 className="font-bold text-base text-[#1f1d19]">Farm Delivery Checkout</h3>
                <p className="text-xs text-[#7d786d]">Confirm your delivery location & payment method</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#524e45] font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.name}
                    onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.phone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={checkoutData.email}
                    onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#524e45] font-semibold mb-1">Farm / Village Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.shippingAddress}
                    onChange={(e) => setCheckoutData({ ...checkoutData, shippingAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[#524e45] font-semibold mb-2">Select Payment Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      checkoutData.paymentMethod === 'Cash on Delivery'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-[#e5e2db] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={checkoutData.paymentMethod === 'Cash on Delivery'}
                      onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'Cash on Delivery' })}
                      className="accent-amber-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-[#1f1d19]">Cash on Delivery</p>
                      <p className="text-[10px] text-[#716c62]">Pay upon truck arrival</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      checkoutData.paymentMethod === 'Online Payment (UPI/Card)'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-[#e5e2db] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={checkoutData.paymentMethod === 'Online Payment (UPI/Card)'}
                      onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'Online Payment (UPI/Card)' })}
                      className="accent-amber-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-[#1f1d19]">Instant UPI / Card</p>
                      <p className="text-[10px] text-[#716c62]">Zero contact digital pay</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center justify-between text-xs font-bold">
                <span>Total Amount to Pay:</span>
                <span className="text-base text-amber-600">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 border border-[#e5e2db] text-[#524e45] rounded-xl hover:bg-[#f6f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
                >
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal with Tracking */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-[#e5e2db] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1f1d19]">Order Placed Successfully!</h2>
              <p className="text-xs text-[#787265] mt-1">
                Tracking Order #{orderConfirmation.orderNumber}
              </p>
            </div>

            <div className="p-4 bg-[#faf9f5] border border-[#ece8df] rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#787265]">Delivery To:</span>
                <span className="font-semibold">{orderConfirmation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787265]">Total Amount:</span>
                <span className="font-bold text-amber-600">₹{orderConfirmation.finalTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787265]">Payment:</span>
                <span className="font-semibold">{orderConfirmation.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787265]">Warehouse Status:</span>
                <span className="font-bold text-emerald-600">Stock Decremented Automatically</span>
              </div>
            </div>

            <button
              onClick={() => setOrderConfirmation(null)}
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl transition text-xs shadow-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

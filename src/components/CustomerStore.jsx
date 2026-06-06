"use client";
import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { signIn } from "next-auth/react";
import { Box, Grid, Card, CardHeader, CardBody, CardFooter, Image, Text, Button, TextInput, Select, Heading, Layer } from "grommet";
import { Cart, FormSearch, History, Close, Star } from "grommet-icons";

const GET_STORE_DATA = gql`
  query GetStoreData($categoryId: String, $search: String) {
    products(categoryId: $categoryId, search: $search) {
      id
      name
      description
      price
      imageUrl
      stock
      categoryId
    }
    categories {
      id
      name
    }
    orders {
      id
      total
      status
      createdAt
      orderItems {
        product {
          name
        }
        quantity
        price
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($orderItems: [OrderItemInput!]!, $total: Float!) {
    createOrder(orderItems: $orderItems, total: $total) {
      id
    }
  }
`;

export default function CustomerStore({ userSession }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [activeBanner, setActiveBanner] = useState(0);

  // Load cart from localStorage after mount to avoid server-client hydration mismatches
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eshop_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("eshop_cart", JSON.stringify(newCart));
    }
  };

  // Fetch data
  const currentCategoryId = selectedCategory === "All" ? null : selectedCategory;
  const { loading, data, refetch } = useQuery(GET_STORE_DATA, {
    variables: {
      categoryId: currentCategoryId,
      search: searchQuery || null
    }
  });

  // Create Order Mutation
  const [createOrder, { loading: checkingOut }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      updateCart([]);
      setShowCart(false);
      refetch();
      alert("Order placed successfully!");
    },
    onError: (err) => {
      alert("Checkout failed: " + err.message);
    }
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("Not enough stock available!");
        return;
      }
      updateCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      updateCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    updateCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!userSession) {
      signIn("auth0");
      return;
    }
    if (cart.length === 0) return;
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));
    createOrder({
      variables: {
        orderItems,
        total: getCartTotal()
      }
    });
  };

  const handleVerify = () => {
    if (!verifyCode) return;
    alert(`Product Verification: Batch code ${verifyCode} is verified as 100% AUTHENTIC.`);
    setVerifyCode("");
  };

  if (loading) return <Box pad="xlarge" align="center"><Text>Loading Storefront...</Text></Box>;

  const products = data?.products || [];
  const categories = data?.categories || [];
  const orders = data?.orders || [];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryImage = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("whey") || lower.includes("protein")) {
      return "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=100";
    }
    if (lower.includes("isolate")) {
      return "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100";
    }
    if (lower.includes("bcaa") || lower.includes("amino")) {
      return "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=100";
    }
    if (lower.includes("creatine")) {
      return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100";
    }
    if (lower.includes("preworkout") || lower.includes("pre-workout") || lower.includes("pump")) {
      return "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=100";
    }
    if (lower.includes("gainer") || lower.includes("mass")) {
      return "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=100";
    }
    if (lower.includes("vitamin") || lower.includes("multivitamin") || lower.includes("fish")) {
      return "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100";
    }
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100";
  };


  const banners = [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
  ];

  return (
    <div className="w-full bg-[#08080a] text-neutral-100 min-h-screen flex flex-col">
      {/* Category Navigation Bar (Sub Header) */}
      <nav className="w-full bg-[#0e0e12] border-b border-neutral-800/60 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between overflow-x-auto gap-6 scrollbar-none py-1">
          <div className="flex items-center gap-1.5 py-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          
        </div>
      </nav>

      {/* Search Bar & Actions Subheader */}
      <section className="w-full bg-[#121216]/40 backdrop-blur-md border-b border-neutral-800/40 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:row gap-4 items-center justify-between sm:flex-row">
          {/* Search Input */}
          <div className="w-full sm:max-w-md relative flex items-center">
            <span className="absolute left-3.5 text-neutral-500">
              <FormSearch color="red" size="medium" />
            </span>
            <input
              type="text"
              placeholder="Search premium supplements, proteins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-sm rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-neutral-500 transition-all outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Orders History Button */}
            <button
              onClick={() => {
                if (!userSession) {
                  signIn("auth0");
                } else {
                  setShowHistory(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer text-neutral-300"
            >
              <History color="red" size="small" />
              <span>My Orders</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                if (!userSession) {
                  signIn("auth0");
                } else {
                  setShowCart(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500/20 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/15 text-white active:scale-95"
            >
              <Cart color="white" size="medium" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-white text-red-600 text-[10px] font-black rounded-md px-1.5 py-0.5 flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex flex-col gap-16">
        
        {/* 1. Hero Promo Banner Slider */}
        <div className="relative h-[380px] w-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-800/80">
          <img
            src={banners[activeBanner]}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.6] transition-all duration-500"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/60 to-transparent flex flex-col justify-center px-8 sm:px-16 md:px-20">
            <span className="text-red-500 font-extrabold text-xs uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              Nurture Today. Grow Taller. Live Better.
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase tracking-tight max-w-2xl m-0">
              FUEL YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">ULTIMATE POTENTIAL</span>
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-lg mt-4 mb-8">
              Premium authentic supplements sourced directly from lab-tested manufacturers. Build muscle, boost strength, and recover faster.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCategory("All")}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Shop Premium Collection
              </button>
              <button
                onClick={() => setActiveBanner((activeBanner + 1) % banners.length)}
                className="px-4 py-3 bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Next Offer
              </button>
            </div>
          </div>
          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-8 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-305 cursor-pointer ${
                  activeBanner === i ? "bg-red-500 w-6" : "bg-neutral-600 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. Categories Circle Navigation */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-1 mb-8">
            <h3 className="text-lg font-black tracking-widest text-white uppercase m-0">SHOP BY CATEGORY</h3>
            <span className="w-12 h-1 bg-red-600 rounded"></span>
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-2 relative transition-all duration-300 transform group-hover:scale-110 shadow-lg ${
                    isActive 
                      ? "border-red-500 shadow-red-500/20" 
                      : "border-neutral-800 group-hover:border-neutral-700"
                  }`}>
                    <img
                      src={getCategoryImage(cat.name)}
                      alt={cat.name}
                      className="w-full h-full object-cover filter brightness-[0.9]"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-red-600/10 border-2 border-red-500 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                    isActive ? "text-red-500" : "text-neutral-400 group-hover:text-neutral-100"
                  }`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Product Catalog Grid */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b border-neutral-800/80 pb-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black tracking-widest text-white uppercase m-0">BEST SELLING PRODUCTS</h3>
              <p className="text-xs text-neutral-500 font-medium tracking-wide m-0">Lab-tested supplements with verified purity standards</p>
            </div>
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs font-extrabold text-red-500 uppercase tracking-wider hover:text-red-400 hover:underline transition-all cursor-pointer bg-transparent border-none"
            >
              View All Products
            </button>
          </div>

          {products.length === 0 ? (
            <div className="w-full bg-[#121216]/50 border border-neutral-800/60 rounded-2xl py-16 text-center">
              <p className="text-neutral-400 font-medium text-sm">No premium products found in this category.</p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-400 bg-transparent cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock === 0;
                return (
                  <div
                    key={product.id}
                    className="relative bg-[#121216]/90 border border-neutral-800/80 hover:border-neutral-700/60 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50 group overflow-hidden flex flex-col"
                  >
                    {/* Product Image Box */}
                    <div className="h-56 w-full bg-neutral-950/65 overflow-hidden relative border-b border-neutral-800/60 flex items-center justify-center">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400"}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Out of Stock Overlay */}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3.5 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      ) : (
                        <span className="absolute top-3.5 left-3.5 bg-red-600 text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded shadow-md uppercase">
                          Sale
                        </span>
                      )}

                      {/* Stock Warning Badge */}
                      {!isOutOfStock && product.stock <= 5 && (
                        <span className="absolute bottom-3 right-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                          Only {product.stock} left!
                        </span>
                      )}
                    </div>

                    {/* Product Info Block */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Rating stars & Category */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-red-500/80 tracking-wider uppercase">Authentic</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size="small" color="#FFD700" />
                            ))}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-black text-white tracking-tight uppercase line-clamp-1 mb-1.5 m-0 group-hover:text-red-500 transition-colors">
                          {product.name}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-neutral-400 font-medium line-clamp-2 mb-4 leading-relaxed m-0">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing and Action buttons */}
                      <div>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-lg font-black text-red-500">${product.price.toFixed(2)}</span>
                          <span className="text-xs text-neutral-500 line-through font-medium">${(product.price * 1.25).toFixed(2)}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={isOutOfStock}
                            onClick={() => addToCart(product)}
                            className="flex-grow py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-[10px] font-extrabold uppercase tracking-wider text-neutral-300 hover:text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer text-center"
                          >
                            Add To Cart
                          </button>
                          <button
                            disabled={isOutOfStock}
                            onClick={() => { addToCart(product); setShowCart(true); }}
                            className="flex-grow py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-[10px] font-black uppercase tracking-wider text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-red-600/10 cursor-pointer text-center"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Power Deals Banner Promo */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111116] via-[#1a1112] to-[#221010] border border-red-500/20 p-8 sm:p-12 shadow-xl shadow-red-950/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-red-500 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
              <span>⚡</span> POWER DEALS LIVE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white m-0 uppercase tracking-tight">
              GET UP TO 40% DISCOUNT!
            </h3>
            <p className="text-neutral-400 text-sm font-medium m-0 max-w-xl">
              Unlock massive gains with top tier supplement sales. Limited stocks on premium creatine monohydrate and isolations.
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory("All")}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Claim Deals Now
          </button>
        </div>

        {/* 5. Product Authenticity Verification Widget */}
        <div className="w-full max-w-2xl mx-auto bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full filter blur-2xl"></div>
          
          <div className="flex flex-col items-center gap-1.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase m-0">Verify Your Product</h3>
            <p className="text-xs text-neutral-450 font-medium tracking-wide m-0 text-neutral-400">
              Check the unique batch / serial code of your supplement package below to verify its authenticity
            </p>
          </div>

          <div className="flex flex-col sm:row gap-3 items-center justify-center max-w-md mx-auto sm:flex-row">
            <input
              type="text"
              placeholder="Enter batch/serial code..."
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-sm rounded-xl py-2.5 px-4 text-white text-center tracking-widest placeholder-neutral-600 transition-all outline-none"
            />
            <button
              onClick={handleVerify}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 shadow-md shadow-red-600/10"
            >
              Verify Code
            </button>
          </div>
        </div>
      </main>

      {/* 6. Footer Section */}
      <footer className="w-full bg-[#050507] border-t border-neutral-900 mt-16 pt-16 pb-8 px-6 text-neutral-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">P</div>
              <h4 className="text-md font-black text-white m-0 tracking-wider">PAHAL NUTRITION</h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed m-0 font-medium">
              India's trusted health partner. Providing 100% authentic, lab-tested supplements for your muscle-building and weight-loss goals.
            </p>
          </div>
          
          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-white m-0 tracking-widest uppercase border-b border-neutral-850 pb-2">Quick Navigation</h4>
            <div className="flex flex-col gap-2">
              <span onClick={() => setSelectedCategory("All")} className="text-xs hover:text-red-500 cursor-pointer transition-colors">All Storefront Products</span>
              <span onClick={() => setSelectedCategory("All")} className="text-xs hover:text-red-500 cursor-pointer transition-colors">Whey Protein Isolations</span>
              <span onClick={() => setSelectedCategory("All")} className="text-xs hover:text-red-500 cursor-pointer transition-colors">Mass & Weight Gainers</span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-white m-0 tracking-widest uppercase border-b border-neutral-850 pb-2">Contact & Support</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-red-500">✉</span>
                <span>support@pahalnutrition.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">📞</span>
                <span>+91 9999 8888 77</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">📍</span>
                <span className="text-neutral-400">New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-8 flex flex-col sm:row gap-4 items-center justify-between text-[11px] text-neutral-500 font-semibold sm:flex-row">
          <span>© 2026 Pahal Nutrition. All Rights Reserved.</span>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 border border-neutral-800 rounded bg-neutral-900/50">VISA</span>
            <span className="px-2 py-0.5 border border-neutral-800 rounded bg-neutral-900/50">MASTERCARD</span>
            <span className="px-2 py-0.5 border border-neutral-800 rounded bg-neutral-900/50">UPI</span>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar Drawer Layer */}
      {showCart && (
        <Layer position="right" full="vertical" onClickOutside={() => setShowCart(false)} onEsc={() => setShowCart(false)}>
          <div className="w-[380px] h-full bg-[#121216] text-white p-6 border-l border-neutral-850 flex flex-col justify-between">
            <div>
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Cart color="red" size="medium" />
                  <h3 className="text-lg font-black uppercase tracking-tight text-white m-0">Shopping Cart</h3>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                >
                  <Close size="small" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 flex flex-col items-center gap-3">
                    <span className="text-3xl">🛒</span>
                    <p className="text-xs font-bold uppercase tracking-wider m-0">Your shopping cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl gap-3">
                      <div className="flex flex-col gap-0.5 flex-grow">
                        <span className="text-xs font-black text-white tracking-tight uppercase line-clamp-1">{item.product.name}</span>
                        <span className="text-[10px] font-bold text-red-500">${item.product.price.toFixed(2)} <span className="text-neutral-500 font-medium">x {item.quantity}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="px-2 py-1 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-[9px] font-bold text-red-500 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer / Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-800 pt-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-neutral-450 uppercase tracking-widest text-neutral-400">Order Subtotal:</span>
                  <span className="text-xl font-black text-red-500">${getCartTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition-all duration-200 cursor-pointer active:scale-95 animate-pulse"
                >
                  {checkingOut ? "Processing Checkout..." : userSession ? "Secure Checkout Now" : "Login to Place Order"}
                </button>
              </div>
            )}
          </div>
        </Layer>
      )}

      {/* Order History Modal */}
      {showHistory && (
        <Layer position="center" onClickOutside={() => setShowHistory(false)} onEsc={() => setShowHistory(false)}>
          <div className="w-[500px] max-w-full bg-[#121216] text-white p-6 rounded-2xl border border-neutral-850 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight text-white m-0">My Order History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
              >
                <Close size="small" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <p className="text-xs font-bold uppercase tracking-wider m-0">You have not placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-neutral-905 bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-neutral-500">Order ID: <span className="text-neutral-300 font-mono">{order.id.slice(0, 12)}...</span></span>
                      <span className={`px-2 py-0.5 rounded ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : order.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 border-y border-neutral-850 py-2">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-semibold uppercase">{item.product.name}</span>
                          <span className="text-neutral-500 font-medium">Qty {item.quantity} @ ${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 font-bold">{new Date(parseInt(order.createdAt)).toLocaleDateString()}</span>
                      <span className="text-sm font-black text-red-500">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Layer>
      )}
    </div>
  );
}

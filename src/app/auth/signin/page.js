"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("auth0", { callbackUrl });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08080a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full filter blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full filter blur-[120px]"></div>
      
      {/* Gym Atmospheric Cover Image Overlay */}
      <div 
        className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80')` }}
      ></div>

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-[#121216]/90 border border-neutral-800/80 rounded-3xl shadow-2xl shadow-black/80 p-8 sm:p-10 backdrop-blur-md relative z-10 hover:border-neutral-700/60 transition-all duration-300">
        
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 animate-pulse">
            <span className="text-white font-extrabold text-3xl tracking-widest">P</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white m-0 flex items-center justify-center gap-1.5">
              PAHAL <span className="text-red-500 font-medium text-xs px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">NUTRITION</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mt-1.5 mb-0">Member Entrance Portal</p>
          </div>
        </div>

        {/* Dynamic Error Indicator */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-xs text-red-400 font-semibold m-0">
              Authentication failed. Please verify your credentials and try again.
            </p>
          </div>
        )}

        {/* Benefits & Trust Bullet Points */}
        <div className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-5 mb-8 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚡</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white tracking-wide uppercase">100% Authentic Supplements</span>
              <span className="text-[11px] text-neutral-400 font-medium mt-0.5">Sourced directly from certified brand warehouses.</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📦</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white tracking-wide uppercase">Real-Time Order Tracking</span>
              <span className="text-[11px] text-neutral-400 font-medium mt-0.5">Track your orders from packaging to delivery.</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white tracking-wide uppercase">Member Power Deals</span>
              <span className="text-[11px] text-neutral-400 font-medium mt-0.5">Access exclusive discounts of up to 40% off.</span>
            </div>
          </div>
        </div>

        {/* Demo / Testing Credentials Box */}
        <div className="bg-neutral-900/70 border border-red-500/20 rounded-2xl p-4.5 mb-6 text-left">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-red-500">🔑</span>
            <span className="text-xs font-black text-red-500 uppercase tracking-widest">Demo Review Credentials</span>
          </div>
          <div className="flex flex-col gap-2.5 text-[11px]">
            <div className="flex flex-col border-b border-neutral-800 pb-2">
              <span className="font-extrabold text-neutral-300 uppercase tracking-wider">Customer Storefront Access:</span>
              <span className="text-neutral-400 mt-0.5">Email: <strong className="text-white select-all">7497987200abhi@gmail.com</strong></span>
              <span className="text-neutral-400">Password: <strong className="text-white select-all">string@123</strong></span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-neutral-350 text-neutral-300 uppercase tracking-wider">Admin Panel Access:</span>
              <span className="text-neutral-400 mt-0.5">Email: <strong className="text-white select-all">work.abhisheky@gmail.com</strong></span>
              <span className="text-neutral-400">Password: <strong className="text-white select-all">Abhishek@123</strong></span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-red-500/20"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting to Secure Server...</span>
            </>
          ) : (
            <>
              <span>Continue with Secure Login / Sign Up</span>
            </>
          )}
        </button>

        {/* Trust Badges Footer */}
        <div className="mt-8 text-center flex flex-col gap-2">
          <p className="text-[10px] text-neutral-500 font-bold tracking-wide uppercase m-0 flex items-center justify-center gap-1.5">
            <span className="text-emerald-500">✔</span> SSL SECURE 256-BIT ENCRYPTION
          </p>
          <p className="text-[10px] text-neutral-650 font-semibold m-0 text-neutral-450 text-neutral-500">
            Powered by Auth0 Security Infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-500">
        Loading Sign In...
      </div>
    }>
      <SignContent />
    </Suspense>
  );
}

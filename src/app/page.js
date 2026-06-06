"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Button, Heading, Text } from "grommet";
import CustomerStore from "@/components/CustomerStore";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Box p="medium" align="center"><Text>Loading E-Shop...</Text></Box>;
  }

  const handleLogout = async () => {
    const auth0Domain = "https://dev-s5fby7cu2j2yguo8.us.auth0.com";
    const clientId = "DHWmByrjNPIuABtelJPBEg0hyHg9yqAR";
    const returnTo = window.location.origin;

    const logoutUrl = `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`;

    await signOut({ redirect: false });
    window.location.href = logoutUrl;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans">
      {/* Sticky Header Area with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#121216]/90 border-b border-neutral-800/80 px-6 py-4 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 animate-pulse">
              <span className="text-white font-extrabold text-xl tracking-wider">P</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white m-0 flex items-center gap-1.5">
                PAHAL <span className="text-red-500 font-medium text-sm px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">NUTRITION</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase m-0">100% Authentic Supplements</p>
            </div>
          </div>

          {/* User Session and Logout Section */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl p-1.5 pl-3.5 pr-2.5">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-neutral-200">{session.user.email}</span>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{session.user.role || "Customer"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-neutral-800 hover:bg-red-600/90 active:scale-95 border border-neutral-700/60 hover:border-red-500/30 rounded-lg transition-all duration-200 cursor-pointer shadow-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => signIn("auth0")}
                  className="px-4 py-2 text-xs font-bold text-neutral-350 hover:text-white bg-neutral-900/85 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all cursor-pointer shadow-sm text-neutral-300"
                >
                  Login
                </button>
                <button
                  onClick={() => signIn("auth0")}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-550 hover:to-rose-550 border border-red-500/20 rounded-lg shadow-md shadow-red-600/10 active:scale-95 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Storefront Area */}
      <div className="w-full flex-grow">
        <CustomerStore userSession={session} />
      </div>
    </main>
  );
}

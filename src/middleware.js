export default function middleware() {
  // No-op so all pages are publicly accessible by default
}

export const config = {
  matcher: [], // Do not match any route, keeping everything public
};

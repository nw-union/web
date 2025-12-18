import type React from "react";
import type { MetaFunction } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root.ts";

import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sawarabi+Gothic&family=VT323&display=swap",
  },
  { rel: "manifest", href: "/manifest.json" },
  // iOS用のアイコン設定
  { rel: "apple-touch-icon", href: "/icon-152.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-180.png" },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "nw-union.net" },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    // iPhoneホーム画面追加時の全画面表示設定
    // {
    //   name: "apple-mobile-web-app-capable",
    //   content: "yes",
    // },
    // {
    //   name: "apple-mobile-web-app-status-bar-style",
    //   content: "black-translucent",
    // },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="bg-white dark:bg-gray-900">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-gray-900 leading-relaxed text-base w-full mx-auto text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { DocumentIcon, HomeIcon, MoviesIcon, UserIcon } from "./Icons";

export function FooterNav() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWAのスタンドアローンモードを検出
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone: boolean }).standalone === true);
    setIsStandalone(isStandaloneMode);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 ${
        isStandalone ? "pb-6" : ""
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-15">
          <NavLink
            to="/"
            prefetch="render"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon
                  className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">Home</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/docs"
            prefetch="render"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <DocumentIcon
                  className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">Docs</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/videos"
            prefetch="render"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MoviesIcon
                  className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">Videos</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/you"
            prefetch="render"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <UserIcon
                  className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">You</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

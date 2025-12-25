import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { HomeIcon, MoviesIcon, PlusIcon, TodoIcon, UserIcon } from "./Icons";

export function FooterNav() {
  const location = useLocation();
  const [isStandalone, setIsStandalone] = useState(false);

  // /kioku と /docs の両方で Kioku タブをアクティブにする
  const isKiokuActive =
    location.pathname === "/kioku" || location.pathname.startsWith("/docs");

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
            to="/kioku"
            prefetch="render"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors ${
                isActive || isKiokuActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MoviesIcon
                  className={`w-5 h-5 ${isActive || isKiokuActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">Kioku</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            className="flex flex-col items-center justify-center px-3 py-1"
          >
            <div className="rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-1.5 transition-colors hover:border-green-600 dark:hover:border-green-400">
              <PlusIcon className="w-5 h-5 stroke-2 text-gray-600 dark:text-gray-400" />
            </div>
          </button>

          <NavLink
            to="/todo"
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
                <TodoIcon
                  className={`w-5 h-5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-[10px] font-medium">Todo</span>
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

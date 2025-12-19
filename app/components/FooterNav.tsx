import { NavLink } from "react-router";
import { DocumentIcon, HomeIcon, MoviesIcon, UserIcon } from "./Icons";

export function FooterNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon
                  className={`w-6 h-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-xs font-medium">Home</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <DocumentIcon
                  className={`w-6 h-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-xs font-medium">Docs</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/movies"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MoviesIcon
                  className={`w-6 h-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-xs font-medium">Movies</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/you"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <UserIcon
                  className={`w-6 h-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-xs font-medium">You</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

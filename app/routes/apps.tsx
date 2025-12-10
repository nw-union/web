import { ThemeToggle } from "../components/ThemeToggle";
import type { Route } from "./+types/apps";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Apps | NWU" },
    { name: "description", content: "NWUが開発したアプリケーション一覧" },
  ];
}

export default function Apps() {
  const apps = [
    {
      name: "BeTree",
      description: "気になるイベント管理ツール",
      url: "https://betree.nw-union.net",
      source: "https://github.com/nw-union/betree",
      icon: "🌳",
      status: "development",
    },
    {
      name: "Hypomnema",
      description: "自己の記録 / 覚え書き のためのエディタ",
      url: "https://hypomnema.nw-union.net",
      source: "https://github.com/nw-union/hypomnema",
      icon: "📑",
      status: "live",
    },
    {
      name: "Weekly Contents",
      description: "コンテンツの排泄場所（更新停止中）",
      url: "https://wc.nw-union.net",
      source: "https://github.com/nw-union/weeklycontents",
      icon: "🧻",
      status: "live",
    },
    {
      name: "Ogp API",
      description: "外部サイトの OGP の情報を取得する API",
      url: "https://ogp.nw-union.net",
      source: "https://github.com/nw-union/ogp",
      icon: "🔧",
      status: "live",
    },
    {
      name: "nw-union.net",
      description: "シンプルなランディングページ。ドキュメント置き場。",
      url: "https://nw-union.net",
      source: "https://github.com/nw-union/web",
      icon: "🌐",
      status: "live",
    },
  ];

  return (
    <main className="bg-white dark:bg-black min-h-screen flex flex-col justify-start items-center p-8 pt-12 md:pt-16 mb-32 transition-colors duration-300 font-sg">
      <ThemeToggle />
      <div className="max-w-2xl w-full">
        <div className="my-20">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Apps
          </h1>
        </div>

        <div className="space-y-4">
          {apps.map((app) => (
            <div
              key={app.name}
              className="border-b border-gray-200 dark:border-gray-800 pb-6"
            >
              <div className="flex items-center justify-between">
                {app.status === "live" ? (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg">{app.icon}</span>
                      <h2 className="text-lg text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        {app.name}
                        <svg
                          className="w-4 h-4 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          ></path>
                        </svg>
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                      {app.description}
                    </p>
                  </a>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg">{app.icon}</span>
                      <h2 className="text-lg text-base font-medium text-gray-900 dark:text-gray-100">
                        {app.name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                      {app.description}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-4">
                  {app.status === "live" ? (
                    <a
                      href={app.source}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-all"
                      aria-label={`View ${app.name} source`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                      >
                        <title>{`View ${app.name} source`}</title>
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-sm font-medium mr-4 text-gray-500 dark:text-gray-500">
                      開発中...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

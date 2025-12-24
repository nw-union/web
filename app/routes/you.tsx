import { Link, redirect } from "react-router";
import { UserIcon } from "../components/Icons";
import { ThemeToggle } from "../components/ThemeToggle";
import { createMetaTags } from "../util";
import type { Route } from "./+types/you";

/**
 * You Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, auth, wf } = context;

  log.info("🔄 個人ページ Loader");

  // ログイン状態の確認
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    // signin して, videos に戻ってくる
    return redirect("/signin?redirectUrl=/you");
  }

  const user = await wf.user
    .get({ id: userRes.value.id, email: userRes.value.mail })
    .match(
      (evt) => evt.user,
      (err) => {
        log.error("ユーザ情報の取得に失敗しました", err);
        throw err;
      },
    );

  log.info(`👤 ユーザ情報を取得しました: ${user.name}/${user.email}`);

  return { mail: userRes.value.mail };
}
export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "You - NWU",
  });

export default function Show({ loaderData }: Route.ComponentProps) {
  const { mail } = loaderData;
  return (
    <main className="bg-white dark:bg-gray-900 min-h-screen pb-20 flex flex-col justify-start items-center p-8 pt-10 md:pt-16 transition-colors duration-300 font-sg">
      <div className="max-w-md w-full">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
          <div className="flex flex-col items-center">
            {/* Profile Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 dark:from-green-500 dark:to-cyan-600 flex items-center justify-center mb-6 shadow-md">
              <UserIcon className="w-14 h-14 text-white stroke-[1.5]" />
            </div>

            {/* Email Address */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                {mail}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                NWU Member
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="w-full mb-4">
              <ThemeToggle />
            </div>

            {/* Logout Button */}
            <Link
              to="/signout"
              reloadDocument
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200 text-center border border-gray-300 dark:border-gray-600"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

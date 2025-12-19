import { redirect } from "react-router";
import type { Video } from "../../type";
import { createMetaTags } from "../util";
import type { Route } from "./+types/videos";

/**
 * ビデオ一覧 Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, videoRepo, auth } = context;

  log.info("🔄 ビデオ一覧 Loader");

  // ログイン状態の確認
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    return redirect("/signin?redirectTo=/movies");
  }

  // ドキュメント一覧を取得
  const videos = await videoRepo.searchVideo().match(
    (v) => v,
    (e) => {
      log.error("ビデオ一覧の取得に失敗しました", e);
      return [] as Video[]; // エラー時は空の配列を返す
    },
  );

  return { videos };
}

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Videos | NWU",
    description: "Watch NWU videos and movies",
  });

function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        <img
          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-40 h-[90px] object-cover rounded-lg"
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
          {video.title}
        </h3>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
          <p>{video.channelName}</p>
          <p className="flex items-center gap-1">
            {video.isPublic ? (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  role="img"
                  aria-label="Public video"
                >
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.78 8.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm4.5-4.5c.274 0 .537.038.787.11C7.663 2.288 9.388 1.5 11 1.5c.274 0 .537.038.787.11-.876 1.322-2.601 2.11-4.213 2.11-.274 0-.537-.038-.787-.11C5.913 4.932 4.188 5.72 2.576 5.72c-.274 0-.537-.038-.787-.11.876-1.322 2.601-2.11 4.213-2.11Z" />
                </svg>
                <span>Public</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  role="img"
                  aria-label="Private video"
                >
                  <path d="M8 1a2 2 0 0 1 2 2v3h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1V3a2 2 0 0 1 2-2Zm0 1a1 1 0 0 0-1 1v3h2V3a1 1 0 0 0-1-1Z" />
                </svg>
                <span>Private</span>
              </>
            )}
            <span>•</span>
            <span>{video.uploadedAt}</span>
          </p>
        </div>
      </div>
    </a>
  );
}

export default function Show({ loaderData }: Route.ComponentProps) {
  const { videos } = loaderData;

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="container mx-auto max-w-7xl px-4 py-4">
        <div className="my-16">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Videos
          </h1>
          <div className="text-xs text-center text-gray-800 dark:text-gray-300">
            記憶の断片
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </main>
    </div>
  );
}

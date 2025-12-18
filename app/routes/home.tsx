import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { GlitchText } from "../components/GlitchText";
import {
  AppsIcon,
  DiscordIcon,
  DocumentIcon,
  GitHubIcon,
  YouTubeIcon,
} from "../components/Icons";
import { ThemeToggle } from "../components/ThemeToggle";
import { createMetaTags } from "../util";
import type { Route } from "./+types/home";

const ASCII_ART = ` ███╗   ██╗ ██╗    ██╗ ██╗   ██╗
 ████╗  ██║ ██║    ██║ ██║   ██║
 ██╔██╗ ██║ ██║ █╗ ██║ ██║   ██║
 ██║╚██╗██║ ██║███╗██║ ██║   ██║
 ██║ ╚████║ ╚███╔███╔╝ ╚██████╔╝
 ╚═╝  ╚═══╝  ╚══╝╚══╝   ╚═════╝`;

const ABOUT_TEXT = "Hangout crew. Lovers of Culture, Art and Tech!";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, auth } = context;

  log.info(`🔄 ホーム Loader`);

  // 認証チェック
  return (await auth.auth(request)).isOk();
}

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "NWU",
    description: "We are Hangout crew. Lovers of Culture, Art and Tech!",
  });

export default function Home({ loaderData }: Route.ComponentProps) {
  const isLogin = loaderData;
  const aboutTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // prefers-reduced-motionをチェック
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // アニメーションなしで即座にすべて表示
      const elementIds = [
        "terminal-output-1",
        "terminal-name",
        "terminal-about",
        "terminal-signup",
        "terminal-output-3",
        "terminal-links",
      ];

      elementIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.opacity = "1";
        }
      });

      // テキストコンテンツも即座に設定
      const name = document.getElementById("terminal-name");
      const about = document.getElementById("terminal-about");

      if (name) {
        name.textContent = ASCII_ART;
      }
      if (about) {
        about.textContent = ABOUT_TEXT;
      }

      return; // クリーンアップ不要
    }

    // コンテナ要素を即座に表示
    const containerIds = ["terminal-output-1", "terminal-output-3"];

    containerIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.opacity = "1";
      }
    });

    let shouldStop = false;
    const timeouts: number[] = [];

    // 全ての要素にフェードインアニメーションを適用
    const fadeElements = ["terminal-name", "terminal-signup", "terminal-links"];

    fadeElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.transition = "opacity 1.0s ease-in-out";
        element.style.opacity = "0";

        const timeout = window.setTimeout(() => {
          if (!shouldStop && element) {
            element.style.opacity = "1";
          }
        }, 50);
        timeouts.push(timeout);
      }
    });

    // ASCIIアートのテキストを設定
    const nameElement = document.getElementById("terminal-name");
    if (nameElement) {
      nameElement.textContent = ASCII_ART;
    }

    // テキストのタイプライティングアニメーション
    const aboutElement = document.getElementById("terminal-about");
    if (aboutElement) {
      aboutElement.style.opacity = "1";
      aboutElement.textContent = "";

      let charIndex = 0;
      const typeSpeed = 50;

      const typeInterval = window.setInterval(() => {
        if (shouldStop) {
          clearInterval(typeInterval);
          return;
        }

        if (charIndex < ABOUT_TEXT.length) {
          aboutElement.textContent = ABOUT_TEXT.substring(0, charIndex + 1);
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, typeSpeed);

      timeouts.push(typeInterval);
    }

    // 文字化けアニメーション
    const glitchAbout = new GlitchText(ABOUT_TEXT);
    const glitchTimeout = window.setTimeout(() => {
      if (!shouldStop) {
        glitchAbout.init(aboutTextRef.current);
      }
    }, 3000);
    timeouts.push(glitchTimeout);

    // クリーンアップ関数
    return () => {
      shouldStop = true;
      glitchAbout.destroy();
      for (const id of timeouts) {
        clearTimeout(id);
        clearInterval(id);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />

      <main className="font-vt323 text-xl md:text-2xl md:w-[700px] w-full p-8 mx-auto leading-relaxed">
        <div>
          <div className="mt-10 mb-6 opacity-0" id="terminal-output-1">
            <div
              className="text-green-600 dark:text-green-400 opacity-0 whitespace-pre font-mono text-xs md:text-sm"
              id="terminal-name"
            ></div>
            <div
              className="text-green-600 dark:text-green-400 opacity-0 mt-4"
              id="terminal-about"
              ref={aboutTextRef}
            ></div>
            {!isLogin && (
              <div className="opacity-0 mt-6" id="terminal-signup">
                <Link
                  to="/signin"
                  className="inline-block px-6 py-1 border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 bg-transparent hover:border-cyan-600 hover:dark:border-cyan-400 hover:text-cyan-600 hover:dark:text-cyan-400 transition-colors duration-300 font-vt323 text-xl"
                >
                  JOIN US
                </Link>
              </div>
            )}
          </div>

          <div className="my-4 mb-6 opacity-0" id="terminal-output-3">
            <div
              className="text-green-600 dark:text-green-400 opacity-0"
              id="terminal-links"
            >
              <div className="flex flex-wrap gap-4 md:gap-8">
                <a
                  href="/docs"
                  className="text-green-600 dark:text-green-400 no-underline flex flex-col items-center gap-1 p-1 md:p-3 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 w-18 md:w-24"
                >
                  <DocumentIcon className="w-8 h-8 md:w-10 md:h-10 stroke-current" />
                  <span className="text-lg md:text-xl">Docs</span>
                </a>
                <a
                  href="/apps"
                  className="text-green-600 dark:text-green-400 no-underline flex flex-col items-center gap-1 p-1 md:p-3 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 w-18 md:w-24"
                >
                  <AppsIcon className="w-8 h-8 md:w-10 md:h-10 stroke-current" />
                  <span className="text-lg md:text-xl">Apps</span>
                </a>
                <a
                  href="/discord"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex flex-col items-center gap-1 p-1 md:p-3 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 w-18 md:w-24"
                >
                  <DiscordIcon className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                  <span className="text-lg md:text-xl">Discord</span>
                </a>
                <a
                  href="/youtube"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex flex-col items-center gap-1 p-1 md:p-3 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 w-18 md:w-24"
                >
                  <YouTubeIcon className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                  <span className="text-lg md:text-xl">YouTube</span>
                </a>
                <a
                  href="/github"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex flex-col items-center gap-1 p-1 md:p-3 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 w-18 md:w-24"
                >
                  <GitHubIcon className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                  <span className="text-lg md:text-xl">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

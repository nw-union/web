import { useEffect, useRef } from "react";
import { GlitchText } from "../components/GlitchText";
import {
  AppsIcon,
  DiscordIcon,
  DocumentIcon,
  GitHubIcon,
  YouTubeIcon,
} from "../components/Icons";
import {
  type TerminalSequence,
  TerminalTyper,
} from "../components/TerminalTyper";
import { ThemeToggle } from "../components/ThemeToggle";
import { createMetaTags } from "../util";
import type { Route } from "./+types/home";

const ASCII_ART = ` ███╗   ██╗ ██╗    ██╗ ██╗   ██╗
 ████╗  ██║ ██║    ██║ ██║   ██║
 ██╔██╗ ██║ ██║ █╗ ██║ ██║   ██║
 ██║╚██╗██║ ██║███╗██║ ██║   ██║
 ██║ ╚████║ ╚███╔███╔╝ ╚██████╔╝
 ╚═╝  ╚═══╝  ╚══╝╚══╝   ╚═════╝`;

const homeTerminalSequence: TerminalSequence = {
  steps: [
    // Step 1: Show first line
    { type: "element", elementId: "terminal-line-1" },
    { type: "command", elementId: "terminal-cmd-1", command: "whoami" },
    { type: "element", elementId: "terminal-output-1" },
    { type: "ascii-art", elementId: "terminal-name", text: ASCII_ART },
    { type: "element", delay: 400 }, // SHORT_DELAY
    {
      type: "text",
      elementId: "terminal-about",
      text: "Hangout crew. Lovers of Culture, Art and Tech!",
    },
    { type: "element", delay: 800 }, // MEDIUM_DELAY

    // Step 2: Show links
    { type: "element", elementId: "terminal-line-3" },
    { type: "command", elementId: "terminal-cmd-3", command: "ls -l ." },
    { type: "element", elementId: "terminal-output-3" },
    { type: "element", elementId: "terminal-links" },
    { type: "element", delay: 800 }, // MEDIUM_DELAY

    // Step 3: Show final line
    { type: "element", elementId: "terminal-line-4" },
  ],
};

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "NWU",
    description: "We are Hangout crew. Lovers of Culture, Art and Tech!",
  });

export default function Home() {
  const cmd1Ref = useRef<HTMLSpanElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  const cmd3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // prefers-reduced-motionをチェック
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // アニメーションなしで即座にすべて表示
      const elementIds = [
        "terminal-line-1",
        "terminal-cmd-1",
        "terminal-output-1",
        "terminal-name",
        "terminal-about",
        "terminal-line-3",
        "terminal-cmd-3",
        "terminal-output-3",
        "terminal-links",
        "terminal-line-4",
      ];

      elementIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.opacity = "1";
        }
      });

      // テキストコンテンツも即座に設定
      const cmd1 = document.getElementById("terminal-cmd-1");
      const cmd3 = document.getElementById("terminal-cmd-3");
      const name = document.getElementById("terminal-name");
      const about = document.getElementById("terminal-about");

      if (cmd1) cmd1.textContent = "whoami";
      if (cmd3) cmd3.textContent = "ls -l .";
      if (name) {
        name.textContent = ASCII_ART;
      }
      if (about)
        about.textContent = "Hangout crew. Lovers of Culture, Art and Tech!";

      return; // クリーンアップ不要
    }

    const typer = new TerminalTyper(homeTerminalSequence);
    typer.init();

    // 各テキスト要素に文字化けアニメーションを適用
    const glitchAbout = new GlitchText(
      "Hangout crew. Lovers of Culture, Art and Tech!",
    );

    const glitchCmd1 = new GlitchText("whoami");
    const glitchCmd3 = new GlitchText("ls -l .");

    // タイピング完了後に文字化けを開始（それぞれ異なるタイミングで）
    const glitchTimeout1 = setTimeout(() => {
      glitchAbout.init(aboutTextRef.current);
    }, 3000);

    const glitchTimeout3 = setTimeout(() => {
      glitchCmd1.init(cmd1Ref.current);
    }, 5000);

    const glitchTimeout4 = setTimeout(() => {
      glitchCmd3.init(cmd3Ref.current);
    }, 6000);

    // クリーンアップ関数
    return () => {
      typer.destroy();
      glitchAbout.destroy();
      glitchCmd1.destroy();
      glitchCmd3.destroy();
      clearTimeout(glitchTimeout1);
      clearTimeout(glitchTimeout3);
      clearTimeout(glitchTimeout4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />

      <main className="font-vt323 text-xl md:text-2xl md:w-[700px] w-full p-8 mx-auto leading-relaxed">
        <div>
          <div
            className="flex items-center my-4 gap-2 opacity-0"
            id="terminal-line-1"
          >
            <span className="text-green-600 dark:text-green-400 font-bold">
              $
            </span>
            <span
              className="text-gray-800 dark:text-white"
              id="terminal-cmd-1"
              ref={cmd1Ref}
            ></span>
          </div>
          <div className="my-4 mb-6 opacity-0" id="terminal-output-1">
            <div
              className="text-green-600 dark:text-green-400 opacity-0 whitespace-pre font-mono text-xs md:text-sm"
              id="terminal-name"
            ></div>
            <div
              className="text-green-600 dark:text-green-400 opacity-0 mt-4"
              id="terminal-about"
              ref={aboutTextRef}
            ></div>
          </div>

          <div
            className="flex items-center my-4 gap-2 opacity-0"
            id="terminal-line-3"
          >
            <span className="text-green-600 dark:text-green-400 font-bold">
              $
            </span>
            <span
              className="text-gray-800 dark:text-white"
              id="terminal-cmd-3"
              ref={cmd3Ref}
            ></span>
          </div>
          <div className="my-4 mb-6 opacity-0" id="terminal-output-3">
            <div
              className="text-green-600 dark:text-green-400 opacity-0"
              id="terminal-links"
            >
              <div className="flex flex-col gap-0.5">
                <a
                  href="/docs"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  <DocumentIcon className="w-5 h-5 md:w-6 md:h-6 stroke-current" />
                  <span>Docs</span>
                </a>
                <a
                  href="/apps"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  <AppsIcon className="w-5 h-5 md:w-6 md:h-6 stroke-current" />
                  <span>Apps</span>
                </a>
                <a
                  href="/discord"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  <DiscordIcon className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <span>Discord</span>
                </a>
                <a
                  href="/youtube"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  <YouTubeIcon className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <span>YouTube</span>
                </a>
                <a
                  href="/github"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  <GitHubIcon className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div
            className="flex items-center my-4 gap-2 opacity-0"
            id="terminal-line-4"
          >
            <span className="text-green-600 dark:text-green-400 font-bold">
              $
            </span>
            <span className="text-gray-800 dark:text-white"></span>
            <span className="cursor text-green-600 dark:text-green-400 animate-cursor-blink">
              _
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

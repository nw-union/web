import { useEffect, useRef } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import type { Route } from "./+types/home";

/**
 * GlitchTextクラスは、文字化けアニメーションを制御します。
 */
class GlitchText {
  private originalText: string;
  private element: HTMLElement | null = null;
  private intervalId: number | null = null;
  private shouldStop = false;

  // 不気味な文字化けに使う文字セット
  private readonly glitchChars =
    "!<>-_\\/[]{}—=+*^?#________░▒▓█▄▀▌▐┤┘┴└├┬┼╬═╗╚║╠╦╬¤•°·÷×≈≠≤≥∞∑√∫∂∆∇∏∐∩∪⊂⊃⊆⊇∈∉∅∀∃∄∧∨⊕⊗⊙⊥∥∦⌐¬∟∠∡∢∴∵∶∷∼∽≃≅≆≇≈≉≊≋≌≍≎≏";

  constructor(text: string) {
    this.originalText = text;
  }

  init(element: HTMLElement | null) {
    this.element = element;
    if (!this.element) return;

    // ランダムな間隔で文字化けを発生させる（最低3秒以上）
    const startGlitch = () => {
      if (this.shouldStop) return;

      this.glitch();

      const nextInterval = Math.random() * 20000 + 10000; // 10-30秒
      setTimeout(startGlitch, nextInterval);
    };

    // 最初の文字化けを開始
    setTimeout(startGlitch, Math.random() * 3000 + 3000);
  }

  glitch() {
    if (!this.element || this.shouldStop) return;

    const duration = Math.random() * 1000 + 500; // 0.5-1.5秒
    const startTime = Date.now();
    let lastUpdateTime = 0;
    const updateInterval = 80; // 80msごとに更新（よりゆっくり）

    // 文字化けアニメーション
    const animate = () => {
      if (!this.element || this.shouldStop) return;

      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // 更新頻度を制限
        if (currentTime - lastUpdateTime >= updateInterval) {
          // 文字化け中
          const glitchedText = this.originalText
            .split("")
            .map((char) => {
              // 各文字をランダムな確率で文字化けさせる
              // 進行度が高いほど文字化けの確率を下げる（徐々に元に戻る）
              const glitchProbability = Math.sin(progress * Math.PI) * 0.6; // 0〜0.6の間で変動

              if (char === " ") return " "; // スペースはそのまま

              if (Math.random() < glitchProbability) {
                return this.glitchChars[
                  Math.floor(Math.random() * this.glitchChars.length)
                ];
              }
              return char;
            })
            .join("");

          this.element.textContent = glitchedText;
          lastUpdateTime = currentTime;
        }

        requestAnimationFrame(animate);
      } else {
        // 元に戻す
        this.element.textContent = this.originalText;
      }
    };

    requestAnimationFrame(animate);
  }

  destroy() {
    this.shouldStop = true;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }
}

interface TerminalElements {
  line1: HTMLElement | null;
  cmd1: HTMLElement | null;
  output1: HTMLElement | null;
  nameText: HTMLElement | null;
  aboutText: HTMLElement | null;
  line3: HTMLElement | null;
  cmd3: HTMLElement | null;
  output3: HTMLElement | null;
  socialText: HTMLElement | null;
  line4: HTMLElement | null;
}

/**
 * TerminalTyperクラスは、ターミナル風のアニメーションを制御します。
 */
class TerminalTyper {
  // 定数化
  private readonly TYPE_SPEED = 50;
  private readonly COMMAND_SPEED = 100;
  private readonly FADE_IN_DELAY = 300;
  private readonly SHORT_DELAY = 400;
  private readonly MEDIUM_DELAY = 800;

  private shouldStop = false;
  private timeoutIds: number[] = [];
  private elements: TerminalElements;

  constructor(elements: TerminalElements) {
    this.elements = elements;
  }

  init() {
    this.animateStep(0);
  }

  destroy() {
    this.shouldStop = true;
    // すべてのタイムアウトをクリア
    for (const id of this.timeoutIds) {
      clearTimeout(id);
    }
    this.timeoutIds = [];
  }

  async animateStep(step: number) {
    if (this.shouldStop) return;

    switch (step) {
      case 0: {
        await this.showElement(this.elements.line1);
        await this.typeCommand(this.elements.cmd1, "whoami");
        await this.showElement(this.elements.output1);
        const asciiArt = ` ███╗   ██╗ ██╗    ██╗ ██╗   ██╗
 ████╗  ██║ ██║    ██║ ██║   ██║
 ██╔██╗ ██║ ██║ █╗ ██║ ██║   ██║
 ██║╚██╗██║ ██║███╗██║ ██║   ██║
 ██║ ╚████║ ╚███╔███╔╝ ╚██████╔╝
 ╚═╝  ╚═══╝  ╚══╝╚══╝   ╚═════╝`;
        await this.showAsciiArt(this.elements.nameText, asciiArt);
        await this.delay(this.SHORT_DELAY);
        await this.typeText(
          this.elements.aboutText,
          "Hangout crew. Lovers of Culture, Art and Tech!",
        );
        await this.delay(this.MEDIUM_DELAY);
        this.animateStep(1);
        break;
      }
      case 1:
        await this.showElement(this.elements.line3);
        await this.typeCommand(this.elements.cmd3, "ls -la social/");
        await this.showElement(this.elements.output3);
        await this.showSocialLinks();
        await this.delay(this.MEDIUM_DELAY);
        this.animateStep(2);
        break;
      case 2:
        await this.showElement(this.elements.line4);
        break;
    }
  }

  async showElement(element: HTMLElement | null) {
    if (this.shouldStop) return;
    if (element) {
      element.style.opacity = "1";
      element.style.animation = "fadeIn 0.3s ease-in-out";
    }
    await this.delay(this.FADE_IN_DELAY);
  }

  async typeCommand(element: HTMLElement | null, text: string) {
    if (this.shouldStop) return;
    if (!element) return;

    element.textContent = "";
    for (let i = 0; i < text.length; i++) {
      if (this.shouldStop) return;
      element.textContent += text[i];
      await this.delay(this.COMMAND_SPEED);
    }
    await this.delay(this.FADE_IN_DELAY);
  }

  async typeText(element: HTMLElement | null, text: string) {
    if (this.shouldStop) return;
    if (!element) return;

    element.style.opacity = "1";

    if (text.includes("\n")) {
      const lines = text.split("\n");
      element.innerHTML = "";
      for (let i = 0; i < lines.length; i++) {
        if (this.shouldStop) return;
        if (i > 0) element.innerHTML += "<br>";
        await this.typeTextLine(element, lines[i]);
      }
    } else {
      await this.typeTextLine(element, text);
    }
  }

  async typeTextLine(element: HTMLElement, text: string) {
    if (this.shouldStop) return;
    const currentContent = element.innerHTML;
    for (let i = 0; i < text.length; i++) {
      if (this.shouldStop) return;
      element.innerHTML = currentContent + text.substring(0, i + 1);
      await this.delay(this.TYPE_SPEED);
    }
  }

  async showSocialLinks() {
    if (this.shouldStop) return;
    const element = this.elements.socialText;
    if (element) {
      element.style.opacity = "1";
      element.style.animation = "fadeIn 0.5s ease-in-out";
    }
  }

  async showAsciiArt(element: HTMLElement | null, text: string) {
    if (this.shouldStop) return;
    if (!element) return;

    element.textContent = text;
    element.style.opacity = "0";
    element.style.transition = "opacity 1.0s ease-in-out";

    // 次のフレームでopacityを変更することでtransitionを適用
    await this.delay(50);
    if (this.shouldStop) return;
    element.style.opacity = "1";
    await this.delay(1000); // transition完了を待つ
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => {
        const index = this.timeoutIds.indexOf(id);
        if (index > -1) {
          this.timeoutIds.splice(index, 1);
        }
        resolve();
      }, ms);
      this.timeoutIds.push(id);
    });
  }
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "NWU" },
    {
      name: "description",
      content: "We are Hangout crew. Lovers of Culture, Art and Tech!",
    },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
  ];
}

export default function Index() {
  const line1Ref = useRef<HTMLDivElement>(null);
  const cmd1Ref = useRef<HTMLSpanElement>(null);
  const output1Ref = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const cmd3Ref = useRef<HTMLSpanElement>(null);
  const output3Ref = useRef<HTMLDivElement>(null);
  const socialTextRef = useRef<HTMLDivElement>(null);
  const line4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // prefers-reduced-motionをチェック
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // アニメーションなしで即座にすべて表示
      const elements = [
        line1Ref,
        cmd1Ref,
        output1Ref,
        nameTextRef,
        aboutTextRef,
        line3Ref,
        cmd3Ref,
        output3Ref,
        socialTextRef,
        line4Ref,
      ];

      elements.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
        }
      });

      // テキストコンテンツも即座に設定
      if (cmd1Ref.current) cmd1Ref.current.textContent = "whoami";
      if (cmd3Ref.current) cmd3Ref.current.textContent = "ls -la social/";
      if (nameTextRef.current) {
        nameTextRef.current.textContent = ` ███╗   ██╗ ██╗    ██╗ ██╗   ██╗
 ████╗  ██║ ██║    ██║ ██║   ██║
 ██╔██╗ ██║ ██║ █╗ ██║ ██║   ██║
 ██║╚██╗██║ ██║███╗██║ ██║   ██║
 ██║ ╚████║ ╚███╔███╔╝ ╚██████╔╝
 ╚═╝  ╚═══╝  ╚══╝╚══╝   ╚═════╝`;
      }
      if (aboutTextRef.current)
        aboutTextRef.current.textContent =
          "Hangout crew. Lovers of Culture, Art and Tech!";

      return; // クリーンアップ不要
    }

    const typer = new TerminalTyper({
      line1: line1Ref.current,
      cmd1: cmd1Ref.current,
      output1: output1Ref.current,
      nameText: nameTextRef.current,
      aboutText: aboutTextRef.current,
      line3: line3Ref.current,
      cmd3: cmd3Ref.current,
      output3: output3Ref.current,
      socialText: socialTextRef.current,
      line4: line4Ref.current,
    });
    typer.init();

    // 各テキスト要素に文字化けアニメーションを適用
    const glitchAbout = new GlitchText(
      "Hangout crew. Lovers of Culture, Art and Tech!",
    );

    const glitchCmd1 = new GlitchText("whoami");
    const glitchCmd3 = new GlitchText("ls -la social/");

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
    <>
      <ThemeToggle />

      <main className="font-vt323 text-xl md:text-2xl md:w-[700px] w-full p-8 mx-auto leading-relaxed">
        <div>
          <div
            className="flex items-center my-4 gap-2 opacity-0"
            ref={line1Ref}
          >
            <span className="text-green-600 dark:text-green-400 font-bold">
              $
            </span>
            <span
              className="text-gray-800 dark:text-white"
              ref={cmd1Ref}
            ></span>
          </div>
          <div className="my-4 mb-6 opacity-0" ref={output1Ref}>
            <div
              className="text-green-600 dark:text-green-400 opacity-0 whitespace-pre font-mono text-xs md:text-sm"
              ref={nameTextRef}
            ></div>
            <div
              className="text-green-600 dark:text-green-400 opacity-0 mt-4"
              ref={aboutTextRef}
            ></div>
          </div>

          <div
            className="flex items-center my-4 gap-2 opacity-0"
            ref={line3Ref}
          >
            <span className="text-green-600 dark:text-green-400 font-bold">
              $
            </span>
            <span
              className="text-gray-800 dark:text-white"
              ref={cmd3Ref}
            ></span>
          </div>
          <div className="my-4 mb-6 opacity-0" ref={output3Ref}>
            <div
              className="text-green-600 dark:text-green-400 opacity-0"
              ref={socialTextRef}
            >
              <div className="flex flex-col gap-0.5">
                <a
                  href="https://discord.gg/faPNeuCQdF"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  {/* Discord SVG Icon  {{{ */}
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Discord"
                  >
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  {/* }}} */}
                  <span>Discord Server</span>{" "}
                  <span className="text-yellow-400 ml-2 animate-pulse">
                    &lt;- join us!
                  </span>
                </a>
                <a
                  href="https://www.youtube.com/@nw-union"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  {/* YouTube SVG Icon  {{{ */}
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="YouTube"
                  >
                    <title>YouTube</title>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {/* }}} */}
                  <span>YouTube</span>
                </a>
                <a
                  href="https://github.com/nw-union"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 no-underline flex items-center gap-2 py-1 transition-colors duration-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                  {/* GitHub SVG Icon  {{{ */}
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="GitHub"
                  >
                    <title>GitHub</title>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  {/* }}} */}
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div
            className="flex items-center my-4 gap-2 opacity-0"
            ref={line4Ref}
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
    </>
  );
}

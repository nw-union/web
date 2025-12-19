export const createMetaTags = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const tags = [
    { charset: "utf-8" },
    { title },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    // iPhoneホーム画面追加時の全画面表示設定
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
  ];

  if (description) {
    tags.push({ name: "description", content: description });
  }

  return tags;
};

export type Theme = "light" | "dark";

const THEME_COOKIE_NAME = "theme";

export function getThemeFromCookie(cookieHeader: string | null): Theme | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const themeCookie = cookies.find((c) =>
    c.startsWith(`${THEME_COOKIE_NAME}=`),
  );

  if (!themeCookie) return null;

  const theme = themeCookie.split("=")[1];
  return theme === "light" || theme === "dark" ? theme : null;
}

export function createThemeCookie(theme: Theme): string {
  return `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

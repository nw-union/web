import rss from '@astrojs/rss';

export async function GET(context) {
  const allDocs = Object.values(import.meta.glob("./docs/*.md", { eager: true }));

  // ドキュメントを新しい順に並び替えて、hiddenListがtrueのものを除外
  const sortedDocs = allDocs
    .sort((a, b) => {
      const aDate = new Date(a.frontmatter.pubDate);
      const bDate = new Date(b.frontmatter.pubDate);
      return bDate.getTime() - aDate.getTime();
    })
    .filter((doc) => !doc.frontmatter.hiddenList);

  return rss({
    title: "Docs | NWU",
    description: "ドキュメント一覧",
    site: `${context.site}/docs`,
    items: sortedDocs.map((doc) => ({
      title: doc.frontmatter.title,
      pubDate: doc.frontmatter.pubDate,
      description: doc.frontmatter.description,
      customData: doc.frontmatter.customData,
      link: `${doc.url}`,
    })),
  });
}

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
  ];

  if (description) {
    tags.push({ name: "description", content: description });
  }

  return tags;
};

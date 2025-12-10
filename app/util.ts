export const metaArray = ({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) => {
  const array = [
    { charset: "utf-8" },
    { title: title },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
  ];
  if (desc) {
    array.push({ name: "description", content: desc });
  }
  return array;
};

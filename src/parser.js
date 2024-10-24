export default ({ contents }) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(contents, 'text/xml');

  if (parsedData.querySelector('parsererror')) {
    const error = new Error("Link doesn't contain valid RSS");
    error.isParserError = true;
    throw error;
  }

  const feed = {
    title: parsedData.querySelector('channel > title').textContent,
    description: parsedData.querySelector('channel > description').textContent,
  };
  const posts = [];
  const items = parsedData.querySelectorAll('channel > item');
  items.forEach((item) => {
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const link = item.querySelector('link');
    const post = {
      title: title.textContent,
      description: description.textContent,
      link: link.textContent,
    };
    posts.push(post);
  });
  return { feed, posts };
};

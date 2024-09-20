import _ from 'lodash';

export default ({ contents, status }) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(contents, 'text/xml');
  if (parsedData.querySelector('parsererror')) {
    return { error: parsedData.querySelector('parsererror > div').textContent };
  }
  const feed = {
    url: status.url,
    id: _.uniqueId('feed_'),
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
      id: _.uniqueId('post_'),
      feedId: feed.id,
      title: title.textContent,
      description: description.textContent,
      link: link.textContent,
    };
    posts.push(post);
  });
  return { feed, posts };
};

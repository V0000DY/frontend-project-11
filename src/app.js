import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser';

export default async () => {
  const elements = {
    pageTitle: document.querySelector('title'),
    heading: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('label'),
    button: document.querySelector('button'),
    example: document.querySelector('.text-muted'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };

  const defaultLang = 'ru';

  const state = {
    feeds: [],
    posts: [],
    viewedPosts: null,
    form: {
      status: null,
      // valid: false,
      errors: '',
    },
    loadingProcess: {
      status: null,
      errors: '',
    },
    parsingError: '',
    ui: {},
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.url' }),
    },
  });

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const watchedState = watch(elements, i18n, state);
  watchedState.form.status = 'filling';

  const validate = (inputObject, urls) => {
    const schema = yup.object({
      url: yup
        .string()
        .url()
        .notOneOf(urls),
    });

    return schema
      .validate(inputObject)
      .then(() => null)
      .catch((error) => error.message);
  };

  const loadRSS = (RSSlink) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(RSSlink)}`)
    .then(({ data }) => data)
    .catch((error) => {
      watchedState.loadingProcess.status = 'fail';
      watchedState.loadingProcess.errors = error;
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { url } = Object.fromEntries(formData);
    const urls = state.feeds.map((feed) => feed.url);

    validate(Object.fromEntries(formData), urls)
      .then((error) => {
        if (error) {
          watchedState.form.errors = error;
          return;
        }

        loadRSS(url).then((data) => {
          const { feed, posts, parsingError } = parser(data);
          if (error) {
            watchedState.parsingError = parsingError;
            return;
          }
          // watchedState.parsingError = '';
          watchedState.posts = [...posts, ...watchedState.posts];
          watchedState.feeds = [feed, ...watchedState.feeds];
        });

        watchedState.form.errors = '';
      });
  });

  const checkFeed = (feed) => {
    loadRSS(feed.url).then((data) => {
      const { posts } = parser(data, feed.id);
      const oldPosts = state.posts.filter((post) => post.feedId === feed.id);
      const oldPostsLinks = oldPosts.map((oldPost) => oldPost.link);
      const newPosts = posts.filter((post) => !oldPostsLinks.includes(post.link));
      if (newPosts.length === 0) {
        console.log('newPosts.length === 0');
        return;
      }
      watchedState.posts = [...newPosts, ...watchedState.posts];
    });
  };

  const delay = 5000;

  const updatePosts = () => {
    state.feeds.forEach((feed) => checkFeed(feed));
    setTimeout(updatePosts, delay);
  };

  setTimeout(updatePosts, delay);
};

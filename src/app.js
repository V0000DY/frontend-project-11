/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser.js';

export default async () => {
  const defaultLang = 'ru';
  const elements = {
    pageTitle: document.querySelector('title'),
    heading: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('label'),
    submit: document.querySelector('.col-auto > button'),
    exampleRSSlink: document.querySelector('.text-muted'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: {
      header: document.querySelector('.modal-header > h5'),
      body: document.querySelector('.modal-body'),
      viewBtn: document.querySelector('.modal-footer > a'),
    },
  };

  const state = {
    feeds: [],
    posts: [],
    form: {
      status: null,
      errors: '',
    },
    loadingProcess: {
      data: {},
      status: 'idle',
      errors: '',
    },
    parsingError: '',
    ui: {
      viewedPosts: [],
      modal: null,
    },
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.url' }),
    },
  });

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

  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: defaultLang,
      debug: false,
      resources,
    })
    .then(() => {
      const watchedState = watch(elements, i18n, state);
      watchedState.form.status = 'filling';
      return watchedState;
    })
    .then((watchedState) => {
      const loadRSS = (RSSlink) => axios({
        method: 'get',
        url: `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(RSSlink)}`,
        timeout: 10000,
      }).then(({ data }) => {
        watchedState.loadingProcess.status = 'success';
        return data;
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { url } = Object.fromEntries(formData);
        const urls = state.feeds.map((feed) => feed.url);

        validate(Object.fromEntries(formData), urls)
          .then((error) => {
            if (error) {
              watchedState.form.status = 'error';
              watchedState.form.errors = error;
              return;
            }

            watchedState.loadingProcess.status = 'loading';

            loadRSS(url).then((data) => {
              if (!data) return;
              watchedState.parsingError = '';
              const { feed, posts, parsingError } = parser(data);
              if (parsingError) {
                watchedState.parsingError = parsingError;
                return;
              }
              feed.url = url;
              feed.id = _.uniqueId('feed_');
              const relatedPosts = posts.map((post) => ({
                id: _.uniqueId('post_'),
                feedId: feed.id,
                ...post,
              }));
              watchedState.posts = [...relatedPosts, ...watchedState.posts];
              watchedState.feeds = [feed, ...watchedState.feeds];
              watchedState.loadingProcess.status = 'success';
            }).catch((loadingError) => {
              watchedState.loadingProcess.status = 'fail';
              watchedState.loadingProcess.errors = loadingError;
            });
          });
      });

      const checkFeed = (feed) => {
        loadRSS(feed.url).then((data) => {
          if (!data) return;
          const { posts } = parser(data);
          const oldPosts = state.posts.filter((post) => post.feedId === feed.id);
          const oldPostsLinks = oldPosts.map((oldPost) => oldPost.link);
          const newPosts = posts.filter((post) => !oldPostsLinks.includes(post.link));
          if (newPosts.length === 0) {
            return;
          }
          const relatedPosts = newPosts.map((post) => ({
            id: _.uniqueId('post_'),
            feedId: feed.id,
            ...post,
          }));
          watchedState.posts = [...relatedPosts, ...watchedState.posts];
        }).catch((error) => {
          console.log(error);
        });
      };

      const delay = 5000;

      const updatePosts = () => {
        state.feeds.forEach((feed) => checkFeed(feed));
        setTimeout(updatePosts, delay);
      };

      setTimeout(updatePosts, delay);
    });
};

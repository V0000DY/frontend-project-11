/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser.js';
import yupLocale from './locales/custom.js';

export default async () => {
  const defaultLang = 'ru';
  const updatePostsDelay = 5000;
  const axiosGetTimeout = 10000;

  const elements = {
    pageTitle: document.querySelector('title'),
    heading: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('label'),
    submit: document.querySelector('.col-auto > button'),
    exampleRSSlink: document.getElementById('exampleLink'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: {
      header: document.querySelector('.modal-header > h5'),
      body: document.querySelector('.modal-body'),
      viewBtn: document.querySelector('.modal-footer > a'),
    },
  };

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      status: null,
      errors: '',
    },
    loadingProcess: {
      status: 'idle',
      errors: '',
    },
    ui: {
      viewedPosts: new Set(),
      modal: null,
    },
  };

  const getUrl = (link) => {
    const baseURL = 'https://allorigins.hexlet.app';
    const url = new URL('/get', baseURL);
    url.searchParams.set('disableCache', true);
    url.searchParams.set('url', link);
    return url;
  };

  const loadRSS = (RSSlink, state) => {
    const axiosConfig = {
      method: 'get',
      url: getUrl(RSSlink),
      timeout: axiosGetTimeout,
    };

    state.loadingProcess.status = 'loading';

    axios(axiosConfig)
      .then(({ data }) => {
        if (!data) return;
        const { feed, posts } = parser(data);
        feed.url = RSSlink;
        feed.id = _.uniqueId('feed_');
        const relatedPosts = posts.map((post) => ({
          id: _.uniqueId('post_'),
          feedId: feed.id,
          ...post,
        }));
        state.posts = [...relatedPosts, ...state.posts];
        state.feeds = [feed, ...state.feeds];
        state.loadingProcess.status = 'success';
      })
      .catch((loadingError) => {
        state.loadingProcess.status = 'fail';
        state.loadingProcess.errors = loadingError;
      });
  };

  const updatePosts = (state) => {
    const promises = state.feeds.map((feed) => {
      const axiosConfig = {
        method: 'get',
        url: getUrl(feed.url),
        timeout: axiosGetTimeout,
      };

      return axios(axiosConfig)
        .then(({ data }) => {
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

          state.posts = [...relatedPosts, ...state.posts];
        })
        .catch((error) => {
          console.log(error);
        });
    });

    Promise.all(promises)
      .finally(() => {
        setTimeout(() => updatePosts(state), updatePostsDelay);
      });
  };

  yup.setLocale(yupLocale);

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
      const watchedState = watch(elements, i18n, initialState);
      watchedState.form.status = 'filling';

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { url } = Object.fromEntries(formData);
        const urls = initialState.feeds.map((feed) => feed.url);

        validate(Object.fromEntries(formData), urls)
          .then((error) => {
            if (error) {
              watchedState.form.status = 'error';
              watchedState.form.errors = error;
              return;
            }

            watchedState.form.status = 'valid';
            watchedState.form.errors = null;

            loadRSS(url, watchedState);
          });
      });

      elements.posts.addEventListener('click', ({ target }) => {
        const { tagName } = target;
        const { id } = target.dataset;
        if (id) {
          watchedState.ui.viewedPosts.add(id);
        }
        if (tagName === 'BUTTON') {
          watchedState.ui.modal = watchedState.posts.find((post) => post.id === id);
        }
      });

      updatePosts(watchedState);
    });
};

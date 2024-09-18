import './style.scss';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './view.js';

const elements = {
  mainContainer: document.querySelector('.text-white'),
  form: null,
  urlInput: null,
  errorField: null,
};

const defaultLang = 'ru';

const state = {
  feeds: [],
  form: {
    status: null,
    // valid: false,
    errors: '',
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

const i18n = i18next.createInstance();
await i18n.init({
  lng: defaultLang,
  debug: false,
  resources,
});

const watchedState = watch(elements, i18n, state);
watchedState.form.status = 'filling';

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();

  const schema = yup.object({
    url: yup
      .string()
      .url()
      .notOneOf(watchedState.feeds),
  });

  const formData = new FormData(e.target);

  schema
    .validate(Object.fromEntries(formData))
    .then(({ url }) => {
      watchedState.feeds = [...watchedState.feeds, url];
      watchedState.form.errors = '';
    })
    .catch((error) => {
      const { message } = error;
      watchedState.form.errors = message;
    });
});

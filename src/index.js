import './style.scss';
import 'bootstrap';
import * as yup from 'yup';
import render from './view.js';

const state = {
  feeds: [],
  form: {
    error: '',
  },
};

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.getElementById('url-input'),
  paragraph: document.querySelector('.feedback'),
};

const watchedState = render(state, elements);

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const schema = yup.object({
    inputValue: yup
      .string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(watchedState.feeds, 'RSS уже существует'),
  });

  schema
    .validate({ inputValue: formData.get('url') })
    .then(({ inputValue }) => {
      watchedState.feeds = [...watchedState.feeds, inputValue];
    })
    .catch((error) => {
      watchedState.form.error = error;
    });
});

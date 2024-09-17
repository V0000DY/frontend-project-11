import onChange from 'on-change';

const render = (state, elements) => {
  const {
    form,
    input,
    paragraph,
  } = elements;

  const watcher = (path, value, previousValue) => {
    input.classList.remove('is-invalid');
    paragraph.textContent = '';

    if (path === 'form.error') {
      input.classList.add('is-invalid');
      paragraph.textContent = value.errors;
      return;
    }

    console.log(`path = ${path}, value = ${value}, previousValue = ${previousValue}`);
    form.reset();
    input.focus();
  };

  const watchedState = onChange(state, watcher);

  return watchedState;
};

export default render;

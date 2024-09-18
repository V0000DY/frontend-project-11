/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const watch = (elements, i18n, state) => {
  const { mainContainer } = elements;

  const generateFormControl = (fieldType, fieldName, fieldId, fieldText) => {
    const divEl = document.createElement('div');
    const inputEl = document.createElement('input');
    const labelEl = document.createElement('label');

    divEl.classList.add('form-floating');
    inputEl.classList.add('form-control', 'w-100');

    inputEl.id = fieldId;
    inputEl.type = fieldType;
    inputEl.name = fieldName;
    labelEl.htmlFor = fieldId;
    labelEl.textContent = fieldText;

    inputEl.autofocus = true;
    inputEl.required = true;
    inputEl.ariaLabel = fieldName;
    inputEl.placeholder = fieldText;
    inputEl.autocomplete = false;

    divEl.append(inputEl);
    divEl.append(labelEl);

    return divEl;
  };

  const generateForm = (buttonType, buttonAriaLabel, buttonText) => {
    const formEl = document.createElement('form');
    const divRow = document.createElement('div');
    const divCol = document.createElement('div');
    const divColAuto = document.createElement('div');
    const urlInput = generateFormControl('text', 'url', 'url-input', i18n.t('urlInputLabel'));
    const button = document.createElement('button');

    formEl.classList.add('rss-form', 'text-body');
    divRow.classList.add('row');
    divCol.classList.add('col');
    divColAuto.classList.add('col-auto');
    button.classList.add('h-100', 'btn', 'btn-lg', 'btn-primary', 'px-sm-5');

    formEl.action = '';
    button.type = buttonType;
    button.ariaLabel = buttonAriaLabel;

    button.textContent = buttonText;

    divCol.append(urlInput);
    divColAuto.append(button);
    divRow.append(divCol);
    divRow.append(divColAuto);
    formEl.append(divRow);

    return formEl;
  };

  const renderMain = () => {
    const headingEl = document.createElement('h1');
    const lead = document.createElement('p');
    const mainForm = generateForm('submit', 'add', i18n.t('addBtn'));
    const example = document.createElement('p');
    const feedback = document.createElement('p');

    headingEl.classList.add('display-3', 'mb-0');
    lead.classList.add('lead');
    example.classList.add('mt-2', 'mb-0', 'text-muted');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');

    example.dataset.bsTheme = 'dark';

    headingEl.textContent = i18n.t('heading');
    lead.textContent = i18n.t('lead');
    example.textContent = i18n.t('example');

    mainContainer.append(headingEl);
    mainContainer.append(lead);
    mainContainer.append(mainForm);
    mainContainer.append(example);
    mainContainer.append(feedback);
  };

  const getElements = () => {
    elements.form = document.querySelector('.rss-form');
    elements.urlInput = document.getElementById('url-input');
    elements.errorField = document.querySelector('.feedback');
  };

  const handleErrors = () => {
    if (!state.form.errors) {
      elements.urlInput.classList.remove('is-invalid');
      elements.urlInput.classList.add('is-valid');
      elements.errorField.textContent = '';
      elements.form.reset();
      elements.urlInput.focus();
    } else {
      elements.urlInput.classList.add('is-invalid');
      elements.urlInput.classList.remove('is-valid');
      elements.errorField.textContent = i18n.t(state.form.errors.key);
    }
  };

  const clearErrors = () => {
    elements.errorField.textContent = '';
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status':
        renderMain();
        getElements();
        break;
      case 'form.errors':
        clearErrors();
        handleErrors();
        break;
      // case 'form.valid':
      //   clearErrors();
      //   break;
      default:
        break;
    }
  });

  return watchedState;
};

export default watch;

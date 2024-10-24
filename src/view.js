import onChange from 'on-change';

const watch = (elements, i18n, state) => {
  const {
    pageTitle,
    heading,
    lead,
    form,
    input,
    label,
    submit,
    exampleRSSlink,
    feedback,
    posts,
    feeds,
    modal,
  } = elements;

  const renderTexts = () => {
    pageTitle.textContent = i18n.t('heading');
    heading.textContent = i18n.t('heading');
    lead.textContent = i18n.t('lead');
    input.placeholder = i18n.t('label');
    label.textContent = i18n.t('label');
    submit.textContent = i18n.t('button');
    exampleRSSlink.textContent = i18n.t('example');
  };

  const createCard = (cardName) => {
    const card = document.createElement('div');
    const body = document.createElement('div');
    const cardTitle = document.createElement('h2');
    const ul = document.createElement('ul');

    card.classList.add('card', 'border-0');
    body.classList.add('card-body');
    cardTitle.classList.add('card-title', 'h4');
    ul.classList.add('list-group', 'border-0', 'rounded-0');

    cardTitle.textContent = cardName;
    body.append(cardTitle);
    card.append(body);
    card.append(ul);

    return card;
  };

  const renderFeeds = () => {
    const card = createCard(i18n.t('feedsTitle'));

    state.feeds.forEach((feed) => {
      const { title, description } = feed;
      const li = document.createElement('li');
      const feedTitle = document.createElement('h3');
      const feedDescription = document.createElement('p');

      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedTitle.classList.add('h6', 'm-0');
      feedDescription.classList.add('m-0', 'small', 'text-black-50');

      feedTitle.textContent = title;
      feedDescription.textContent = description;

      li.append(feedTitle);
      li.append(feedDescription);
      card.lastChild.append(li);
    });

    feeds.innerHTML = '';

    feeds.append(card);
  };

  const renderModal = () => {
    const {
      header,
      body,
      viewBtn,
    } = modal;
    const {
      title,
      description,
      link,
    } = state.ui.modal;
    header.textContent = title;
    body.textContent = description;
    viewBtn.href = link;
  };

  const renderPosts = () => {
    const card = createCard(i18n.t('postsTitle'));

    state.posts.forEach((post) => {
      const {
        title,
        link,
        id,
      } = post;
      const li = document.createElement('li');
      const postAnchor = document.createElement('a');
      const viewButton = document.createElement('button');

      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      if (state.ui.viewedPosts.has(id)) {
        postAnchor.classList.add('fw-normal');
        postAnchor.classList.add('link-secondary');
      } else {
        postAnchor.classList.add('fw-bold');
      }

      viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');

      postAnchor.href = link;
      postAnchor.target = '_blank';
      postAnchor.rel = 'noopener noreferrer';
      postAnchor.dataset.id = id;
      viewButton.dataset.id = id;
      viewButton.dataset.bsToggle = 'modal';
      viewButton.dataset.bsTarget = '#modal';

      postAnchor.textContent = title;
      viewButton.textContent = i18n.t('viewButton');

      li.append(postAnchor);
      li.append(viewButton);
      card.lastChild.append(li);
    });

    posts.innerHTML = '';

    posts.append(card);
  };

  const renderSuccess = () => {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
  };

  const renderError = (error) => {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
  };

  const clearErrors = () => {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
  };

  const updateInput = () => {
    form.reset();
    input.focus();
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        if (value === 'filling') {
          renderTexts();
        }
        break;
      case 'form.errors':
        clearErrors();
        if (value) {
          renderError(i18n.t(state.form.errors.key));
        }
        break;
      case 'loadingProcess.status':
        clearErrors();
        switch (value) {
          case 'loading':
            submit.disabled = true;
            input.disabled = true;
            break;
          case 'success':
            input.disabled = false;
            submit.disabled = false;
            renderFeeds();
            renderSuccess();
            updateInput();
            break;
          default:
            input.disabled = false;
            submit.disabled = false;
            break;
        }
        break;
      case 'loadingProcess.errors':
        clearErrors();
        if (value.isParserError) {
          renderError(i18n.t('errors.parsingError'));
        }
        if (value.isAxiosError) {
          renderError(i18n.t('errors.loadingError'));
        }
        break;
      case 'posts':
        renderPosts();
        break;
      case 'ui.viewedPosts':
        renderPosts();
        break;
      case 'ui.modal':
        renderModal();
        break;
      default:
        break;
    }
  });

  return watchedState;
};

export default watch;

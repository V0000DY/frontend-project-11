const yupLocale = {
  mixed: {
    notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
  },
  string: {
    url: () => ({ key: 'errors.validation.url' }),
  },
};

export default yupLocale;

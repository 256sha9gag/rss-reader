import validation from './validation.js';
import watchedState from './view.js';
import state from './model.js';
import load from './loader.js';
import parse from './parser.js';
import loadUpdate from './update-loader.js';

export default () => {
  const form = document.querySelector('form');
  const changeLanguage = document.querySelectorAll('[data-lang="lang"]');
  const listPosts = document.querySelector('[data-ul="posts"]');
  const body = document.querySelector('body');
  loadUpdate();

  body.addEventListener('click', (e) => {
    const data = e.target;
    if (data.dataset.bsDismiss === 'modal' || data.id === 'modal') {
      watchedState.modalId = null;
    }
  });

  changeLanguage.forEach((button) => {
    button.addEventListener('click', (e) => {
      watchedState.lng = e.target.id;
    });
  });

  listPosts.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    console.log(e.target.dataset);

    if (!state.pressedLinkId.includes(id)) {
      watchedState.pressedLinkId.push(id);
    }

    if (e.target.type === 'button') {
      watchedState.modalId = id;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.errors = null;
    watchedState.state = 'processing';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validation(url)
      .then(() => {
        if (state.errors) {
          watchedState.state = 'failed';
        } else {
          load(url)
            .then((data) => parse(data, url.toString()))
            .then((parsed) => {
              if (!parsed) {
                state.errors = 'invalidRSS';
                watchedState.state = 'failed';
              } else {
                const [feed, posts] = parsed;
                state.links.push(url.toString());
                state.feeds.push(feed);
                state.posts = [...posts, ...state.posts];
                console.log(state);
                watchedState.state = 'processed';
              }
            });
        }
      });
  });
};

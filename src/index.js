import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import fetchPictures from './fetchPictures.js';
import { throttle } from 'throttle-debounce';

let getEl = selector => document.querySelector(selector);
getEl('.search-form').addEventListener('submit', onFormSubmit);

let searchSubject = '';
let pageCount = 1;
let lightbox;

async function onFormSubmit(evt) {
  clearMarkup();

  evt.preventDefault();

  pageCount = 1;
  searchSubject = evt.currentTarget.elements.searchQuery.value;
  if (searchSubject !== '') {
    try {
      const data = await fetchPictures(searchSubject, pageCount);

      renderMarkup(data);

      makeLightbox();
      //  makeSmoothScrolling()
      pageCount += 1;
      if (data.totalHits !== 0) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function renderMarkup(data) {
  if (data.hits.length === 0) {
    Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        user,
      }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}">
        <img class="photo-card-pic" src="${webformatURL}" alt="${tags}" author="${user}" width=220px height=180px loading="lazy" />
        </a>
        <div class="info">
        <p class="info-item">
          <b>Likes:</b><span class="info-text">${likes}</span>
        </p>
        <p class="info-item">
          <b>Views:</b><span class="info-text">${views}</span>
        </p>
        <p class="info-item">
          <b>Comments:</b><span class="info-text">${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads:</b><span class="info-text"> ${downloads}</span>
        </p>
  </div>
                </div>`;
      }
    )
    .join('');

  getEl('.gallery').insertAdjacentHTML('beforeend', markup);
}

function clearMarkup() {
  getEl('.gallery').innerHTML = '';
}

function makeLightbox() {
  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'author',
    captionDelay: 250,
  });
  lightbox.refresh();
}

const onEntry = entries => {
  searchSubject = getEl('.search-form input').value;
  try {
    entries.forEach(async entry => {
      if (entry.isIntersecting && searchSubject !== '') {
        const data = await fetchPictures(searchSubject, pageCount);
        if (data.hits.length === 0) {
          return;
        }
        renderMarkup(data);
        makeLightbox();
        // makeSmoothScrolling()

        if (pageCount > data.totalHits / 40 || data.hits.length < 40) {
          Notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(target);
          return;
        }
        pageCount += 1;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

window.addEventListener('scroll', () => {
  const documentRect = document.documentElement.getBoundingClientRect();
  if (documentRect.bottom < document.documentElement.clientHeight + 150) {
    fetchPictures(searchSubject, pageCount);
    pageCount++;
  }
});

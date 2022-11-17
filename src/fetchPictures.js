import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31327437-8bf2c9266649ad69df4fd7cc5';
export default async function fetchPictures(searchSubject, pageCount) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: searchSubject,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: pageCount,
    per_page: 40,
  });
  const response = await axios.get(`${BASE_URL}?${searchParams}`);
  return response.data;
}

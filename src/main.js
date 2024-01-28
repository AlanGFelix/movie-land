const callbackObserver = function(entries){
  entries.forEach((entry)=>{
    if(entry.isIntersecting){
      let img = entry.target;
      let url = img.getAttribute('data-img');
  
      img.setAttribute('src',url);
    }
  });
}
let lazyLoader = new IntersectionObserver(callbackObserver);

let api;

function GetLenguageIndex(){
  const selectedLanguage = selectLanguage.value;
  const language = langs.find(language =>language.lang == selectedLanguage)
  const index = langs.indexOf(language);

  return index;
}

function ChangeLanguage(){
  const indexTitle = GetLenguageIndex();
  const language = langs[GetLenguageIndex()]
  localStorage.setItem('language',JSON.stringify(language));
  location.reload();
}

function GetRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function GetTrendingMovies({pagination}){
  let response;
  if(pagination){
    response = await api.get('movie/popular',{
      params: {
        page: pagesActual,
      },
    });
  }else{
    response = await api.get('movie/popular');
  }
  return response.data.results;
}

async function RandomHeader(){
  let moviesPopular = await GetTrendingMovies({'pagination': false});
  let randomNumber = GetRandomInt(moviesPopular.length-1);
  let {title,poster_path} = moviesPopular[randomNumber];
  ChangeImageHeader(title, poster_path);
}

function GetMoviesLiked(){
  const item = localStorage.getItem('likedMovies');
  const moviesLiked = item ? JSON.parse(item) :[];

  return moviesLiked;
}

function CreateMovies(container, movies){
  movies.forEach(movie=>{
    let divContainer = document.createElement('div');
    divContainer.addEventListener('click',()=>location.hash=`#details=${movie.id}-${movie.title}`);
    divContainer.classList.add('movie_container');
  
    let bannerContainer = document.createElement('div');
    bannerContainer.classList.add('movie-banner');

    let image = document.createElement('img');
    image.setAttribute('alt',movie.title);
    image.setAttribute('width',150);
    image.setAttribute('height',225);
    image.setAttribute('alt',movie.title);
    let poster_path = movie.poster_path;
    if (poster_path != null) {
      image.setAttribute('data-img',`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`);
    }

    let likeButton = document.createElement('button');
    likeButton.type = 'button';
    likeButton.classList.add('like-button');
    let moviesLiked = GetMoviesLiked();
    const isSaved = moviesLiked.some(movieArray=> movieArray.id == movie.id);
    if(isSaved){
      likeButton.classList.add('liked');
    }
    likeButton.addEventListener('click', (event)=>{
      event.stopPropagation();
      const movieClicked = {id:movie.id, title:movie.title, poster_path: movie.poster_path};
      let moviesLiked = GetMoviesLiked();
      const isSaved = moviesLiked.some(movieArray=> movieArray.id == movieClicked.id)
      
      if(isSaved){
        moviesLiked = moviesLiked.filter(movieArray=> movieArray.id != movieClicked.id);
        likeButton.classList.remove('liked');
      }else{
        moviesLiked.push(movieClicked);
        likeButton.classList.add('liked');
      }
      
      localStorage.setItem('likedMovies',JSON.stringify(moviesLiked));
      GetFavoritesMovies();
    });

    bannerContainer.append(image, likeButton);

    let h3 = document.createElement('h3');
    h3.classList.add('movie-title');
    let movieTitle = document.createTextNode(movie.title);
    h3.appendChild(movieTitle);
    divContainer.append(bannerContainer,h3);
    container.appendChild(divContainer);
    lazyLoader.observe(image);
  });
}

async function GetMoviesByCategorie(genre,{pagination=false}){
  let responseMovies;

  if(pagination){
    responseMovies = await api.get('discover/movie',{
      params:{
        with_genres: genre,
      }
    });
  }else{
    responseMovies = await api.get('discover/movie',{
      params:{
        with_genres: genre,
        page:pagesActual,
      }
    });
  }
  return responseMovies.data.results;
}

async function GetMoviesBysearch(search,{pagination=false}){
  let responseMovies;

  if(pagination){
    responseMovies = await api.get('/search/movie',{
      params:{
        query: search,
        page:pagesActual
      }
    });
  }else{
    responseMovies = await api.get('/search/movie',{
      params:{
        query: search,
      }
    });
  }

  return responseMovies.data.results;
}

async function GetGenresMovies(){
  const response = await api.get('genre/movie/list');
  
  const indexTitle = GetLenguageIndex();
  const titles = langs[indexTitle].captions
  const genres = response.data.genres;
  const containerGenres = document.querySelector('.main_article.article__genres');
  containerGenres.innerHTML = '';
  const h2 = document.createElement('h2');
  const text = document.createTextNode(titles.genres);
  h2.appendChild(text);
  containerGenres.appendChild(h2);
  
  genres.forEach(async genre => {
    let name = genre.name;
    genre = genre.id;
    let sectionContainer = document.createElement('section');
    sectionContainer.classList.add('article_container', 'genre__container');
    
    let containerTitle =document.createElement('div');
    containerTitle.classList.add('article--title-container');
    let titleH2 =document.createElement('h2');
    let title = document.createTextNode(name);
    titleH2.appendChild(title);
    let button =document.createElement('button');
    let buttonText = document.createTextNode(titles.trendMore);
    button.appendChild(buttonText);
    button.addEventListener('click',()=>location.hash=`#categorie=${genre}-${name}`);
    titleH2.appendChild(title);
    containerTitle.append(titleH2, button);
    
    let containerMovies = document.createElement('div');
    containerMovies.classList.add('article_container');
    sectionContainer.append(containerTitle,containerMovies);
    containerGenres.appendChild(sectionContainer);
    
    let movies = await GetMoviesByCategorie(genre, {'pagination': false});
    CreateMovies(containerMovies, movies);
  });
}


function ShowMoviesLong(){
  header.classList.remove('header-movies--details');
  headerNav.classList.add('article-nav--long');
  exitButon.classList.remove('inactive');
  search.classList.remove('inactive');
  imgLong.classList.add('inactive');
  footer.classList.remove('inactive');

  detailsCategorie.classList.add('inactive');
  detailsSimilar.classList.add('inactive');
  genresCategorie.classList.add('inactive');
  
  trendingCategorie.classList.add('inactive');
}

async function GetFavoritesMovies(){
  favoritesmoviesContainer.innerHTML = '';
  const favoriteMovies = GetMoviesLiked();

  CreateMovies(favoritesmoviesContainer,favoriteMovies);
}

async function GetHome(){
  let claseLoad = 'load';
  let titleHomeContainer = document.querySelector('.article--title-container');
  let articleHomeContainer = document.querySelector('.trending--article-trends .article_container');
  let titlesHome = document.querySelector('.principal-title');
  let buttonHome = document.querySelector('.principal-button');
  
  imgLong.classList.remove(claseLoad);
  titleHomeContainer.classList.remove(claseLoad);
  articleHomeContainer.classList.remove(claseLoad);
  titlesHome.classList.remove(claseLoad);
  buttonHome.classList.remove(claseLoad);
  favoritesmoviesContainer.classList.remove(claseLoad);
  RandomHeader();
  header.classList.remove('header-movies--details');
  headerNav.classList.remove('article-nav--long');
  exitButon.classList.add('inactive');
  imgLong.classList.remove('inactive');
  footer.classList.remove('inactive');

  // Creamos las peliculas favoritas
  GetFavoritesMovies();
  
  detailsCategorie.classList.add('inactive');
  detailsInfo.classList.add('inactive');
  detailsSimilar.classList.add('inactive');
  search.classList.add('inactive');

  genresCategorie.classList.remove('inactive');
  trendingCategorie.classList.remove('inactive');
  trendingCategorie.classList.replace('article__details', 'article--trending');
  trends.classList.remove('inactive');

  // Creamos las peliculas populares
  let container = document.querySelector('.trending--article-trends .article_container');
  let trendingMovies = await GetTrendingMovies({'pagination': false});
  CreateMovies(container, trendingMovies);
  GetGenresMovies();
}

async function GetSearch(){
  moviesSearch.classList.add('load');
  genreTitle.classList.add('inactive');
  let search = location.hash.split('=')[1];
  search = search.replaceAll('%20',' ');
  moviesSearch.innerHTML = '';
  ShowMoviesLong();
  let movies = await GetMoviesBysearch(search, {'pagination': false});
  CreateMovies(moviesSearch,movies);
  moviesSearch.classList.remove('load');
}

async function GetCategorie(){
  genreTitle.classList.remove('inactive');
  genreTitle.innerHTML = '';
  genreTitle.classList.add('load');
  
  containerMoviesCategorie.classList.add('load');
  containerMoviesCategorie.innerHTML = '';
  ShowMoviesLong();
  let categorie = location.hash.split('=')[1];
  if(categorie == 'trends'){
    let movies = await GetTrendingMovies({'pagination': false});
    containerMoviesCategorie.classList.remove('load');
    genreTitle.classList.remove('load');
    genreTitle.innerText = 'Trends';
    CreateMovies(containerMoviesCategorie,movies);
  }else{
    let categorieId = categorie.split('-')[0];
    let categorieName = categorie.split('-')[1];
    genreTitle.innerText = categorieName;

    let movies = await GetMoviesByCategorie(categorieId, {'pagination': false});
    containerMoviesCategorie.classList.remove('load');
    genreTitle.classList.remove('load');
    CreateMovies(containerMoviesCategorie, movies);
  }
}

function ChangeImageHeader(title, poster_path){
  let imgBackground = document.createElement('img');
  imgBackground.classList.add('article-movies_image');
  imgBackground.alt = title;
  imgBackground.id = 'background-header';
  if (poster_path != null) {
    imgBackground.setAttribute('data-img',`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`);
  }
  imgLong.appendChild(imgBackground);
  lazyLoader.observe(imgBackground);
}

async function GetDetails(){
  footer.classList.add('inactive');
  let claseLoad = 'load';
  imgLong.classList.add(claseLoad);
  detailsInfo.classList.add(claseLoad);
  movieGenres.classList.add(claseLoad);
  detailsSimilar.classList.add(claseLoad);
  similarMoviesContainer.innerHTML = '';
  movieTitle.innerText = '';
  movieOverview.innerText = '';
  movieGenres.innerText = '';
  header.classList.add('header-movies--details');
  headerNav.classList.add('article-nav--long');
  exitButon.classList.remove('inactive');
  imgLong.classList.remove('inactive');
  
  trendingCategorie.classList.remove('inactive');
  trendingCategorie.classList.replace('article--trending', 'article__details');

  detailsInfo.classList.remove('inactive');
  detailsCategorie.classList.remove('inactive');
  search.classList.add('inactive');
  detailsSimilar.classList.remove('inactive');
  genresCategorie.classList.add('inactive');
  
  trends.classList.add('inactive');

  let [hash, movie] = location.hash.split('=');
  let [id,name] = movie.split('-');
  
  let resultDetails = await api.get(`movie/${id}`);
  let {title, overview, genres, poster_path} = resultDetails.data;
  ChangeImageHeader(title, poster_path);
  imgLong.classList.remove(claseLoad);
  let titleText = document.createTextNode(title);
  movieTitle.appendChild(titleText);
  movieTitle.classList.remove('load');
  let overviewText = document.createTextNode(overview);
  movieOverview.appendChild(overviewText);
  movieOverview.classList.remove('load');

  movieGenres.classList.remove('load');
  detailsInfo.classList.remove(claseLoad);
  detailsSimilar.classList.remove(claseLoad);
  genres.forEach(genre=>{
    let span = document.createElement('span');
    span.innerText = genre.name;

    movieGenres.appendChild(span);
  });

  let resultRecommendations = await api.get(`movie/${id}/recommendations`);
  let moviesRecommendations = resultRecommendations.data.results;
  CreateMovies(similarMoviesContainer,moviesRecommendations);
}

selectLanguage.addEventListener('change', ChangeLanguage);

window.addEventListener('DOMContentLoaded',()=>{
  let claseLoad = 'load';
  let titleHomeContainer = document.querySelector('.article--title-container');
  let articleHomeContainer = document.querySelector('.trending--article-trends .article_container');
  let titlesHome = document.querySelector('.principal-title');
  let buttonHome = document.querySelector('.principal-button');

  imgLong.classList.remove(claseLoad);
  titleHomeContainer.classList.remove(claseLoad);
  articleHomeContainer.classList.remove(claseLoad);
  titlesHome.classList.remove(claseLoad);
  buttonHome.classList.remove(claseLoad);
  detailsInfo.classList.remove(claseLoad);
  movieGenres.classList.remove(claseLoad);
  detailsSimilar.classList.remove(claseLoad);
  
  let language = localStorage.getItem('language');
  let titles;
  let index;
  if(language){
    language = JSON.parse(language);
    let languageSelected = langs.find(languageSelected =>languageSelected.lang == language.lang);
    index = langs.indexOf(languageSelected);
    titles = language.captions;
  }else{
    index = 0;
    language = langs[index];
    titles = language.captions;
  }
  selectLanguage.children[index].selected = true;
  categoriesTitle.innerText = titles.category;
  similarTitle.innerText = titles.similarTitle;
  trendsTitle.innerText = titles.trends;
  favoriteTitle.innerText = titles.likedTitle;
  genresTitle.innerText = titles.genres;
  trendingButton.innerText = titles.trendMore;
  api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers:{
      accept: 'application/json',
    },
    params: {
      api_key:'349addc21a4cef2c51b020379c9efa28',
      language: language.lang
    },
  });

  ValidateHash();
})
let historysUrl = [];
let api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers:{
    accept: 'application/json',
  },
  params: {
    api_key:'349addc21a4cef2c51b020379c9efa28'
  },
})

function GetRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function RandomHeader(){
  let moviesPopular = await GetTrendingMovies();
  let randomNumber = GetRandomInt(moviesPopular.length-1);
  let {title,poster_path} = moviesPopular[randomNumber];
  ChangeImageHeader(title, poster_path);
}

searchButton.addEventListener('click',(e)=>{
  let busqueda = e.target.parentNode.parentNode.children[0].value;
  location.hash = `#search=${busqueda}`;
});

searchInput.addEventListener('keypress',(e)=>{
  if(e.key=='Enter'){
    let busqueda = e.target.parentNode.children[0].value;
    location.hash = `#search=${busqueda}`;
  }
});

exitButon.addEventListener('click',()=>{
  console.log(historysUrl);
  if(historysUrl.length <= 1){
    location.hash = '#home';
  }else{
    location.hash = historysUrl[historysUrl.length-2];
    historysUrl.pop();
  }
  console.log(historysUrl);
});

trendingButton.addEventListener('click',()=>location.hash = '#categorie=trends');

function createMovies(container, movies){
  movies.forEach(movie=>{
    let divContainer = document.createElement('div');
    divContainer.addEventListener('click',()=>location.hash=`#details=${movie.id}-${movie.title}`);
    divContainer.classList.add('movie_container');
  
    let image = document.createElement('img');
    image.setAttribute('alt',movie.title);
    if (movie.poster_path != null) {
      image.src = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`;
    }
    let h3 = document.createElement('h3');
    h3.classList.add('movie-title');
    let movieTitle = document.createTextNode(movie.title);
    h3.appendChild(movieTitle);
    divContainer.append(image,h3);
    container.appendChild(divContainer);
  });
}

async function GetTrendingMovies(){
  let response = await api.get('movie/popular');
  return response.data.results;
}

async function GetMoviesByCategorie(genre){
  let responseMovies = await api.get('discover/movie',{
    params:{
      with_genres: genre,
    }
  });
  return responseMovies.data.results;
}

async function GetMoviesBysearch(search, container){
  let responseMovies = await api.get('/search/movie',{
    params:{
      query: search,
    }
  });

  let movies = responseMovies.data.results;
  createMovies(container,movies);
}

async function GetGenresMovies(){
  let response = await api.get('genre/movie/list');
  
  let genres = response.data.genres;
  let containerGenres = document.querySelector('.main_article.article__genres');
  containerGenres.innerHTML = '';
  let h2 = document.createElement('h2');
  let text = document.createTextNode('Genres');
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
    let buttonText = document.createTextNode('Ver mas');
    button.appendChild(buttonText);
    button.addEventListener('click',()=>location.hash=`#categorie=${genre}-${name}`);
    titleH2.appendChild(title);
    containerTitle.append(titleH2, button);
    
    let containerMovies = document.createElement('div');
    containerMovies.classList.add('article_container');
    sectionContainer.append(containerTitle,containerMovies);
    containerGenres.appendChild(sectionContainer);
    
    let movies = await GetMoviesByCategorie(genre);
    createMovies(containerMovies, movies);
  });
}


function ShowMoviesLong(){
  header.classList.remove('header-movies--details');
  headerNav.classList.add('article-nav--long');
  exitButon.classList.remove('inactive');
  search.classList.remove('inactive');
  imgLong.classList.add('inactive');

  detailsCategorie.classList.add('inactive');
  detailsSimilar.classList.add('inactive');
  genresCategorie.classList.add('inactive');
  
  trendingCategorie.classList.add('inactive');
}

async function GetHome(){
  header.classList.remove('header-movies--details');
  headerNav.classList.remove('article-nav--long');
  exitButon.classList.add('inactive');
  imgLong.classList.remove('inactive');

  detailsCategorie.classList.add('inactive');
  detailsInfo.classList.add('inactive');
  detailsSimilar.classList.add('inactive');
  
  search.classList.add('inactive');
  
  genresCategorie.classList.remove('inactive');
  trendingCategorie.classList.remove('inactive');
  trendingCategorie.classList.replace('article__details', 'article--trending');
  trends.classList.remove('inactive');
  let container = document.querySelector('.trending--article-trends .article_container');
  let trendingMovies = await GetTrendingMovies();
  createMovies(container, trendingMovies);
  GetGenresMovies();
}

function GetSearch(){
  genreTitle.classList.add('inactive');
  let search = location.hash.split('=')[1];
  search = search.replaceAll('%20',' ');
  let container = document.querySelector('.search .movies_container');
  container.innerHTML = '';
  ShowMoviesLong();
  GetMoviesBysearch(search, container);
}

async function GetCategorie(){
  genreTitle.classList.remove('inactive');
  let container = document.querySelector('.main_article.movies_container');
  container.innerHTML = '';
  ShowMoviesLong();
  let categorie = location.hash.split('=')[1];
  if(categorie == 'trends'){
    let movies = await GetTrendingMovies();
    genreTitle.innerText = 'Trends';
    createMovies(container,movies);
  }else{
    let categorieId = categorie.split('-')[0];
    let categorieName = categorie.split('-')[1];
    genreTitle.innerText = categorieName;

    let movies = await GetMoviesByCategorie(categorieId);
    createMovies(container, movies);
  }
  
}

function ChangeImageHeader(title, poster_path){
  imgLong.innerHTML = '';
  let imgBackground = document.createElement('img');
  imgBackground.classList.add('article-movies_image');
  imgBackground.alt = title;
  imgBackground.id = 'background-header';
  if (poster_path != null) {
    imgBackground.src = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`;
  }
  imgLong.appendChild(imgBackground);
}

async function GetDetails(){
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
  let titleText = document.createTextNode(title);
  movieTitle.innerText = '';
  movieTitle.appendChild(titleText);
  let overviewText = document.createTextNode(overview);
  movieOverview.innerText = '';
  movieOverview.appendChild(overviewText);
  movieGenres.innerText = '';

  genres.forEach(genre=>{
    let span = document.createElement('span');
    span.innerText = genre.name;

    movieGenres.appendChild(span);
  });

  let resultRecommendations = await api.get(`movie/${id}/recommendations`);
  let moviesRecommendations = resultRecommendations.data.results;
  similarMoviesContainer.innerHTML = '';
  createMovies(similarMoviesContainer,moviesRecommendations);
}

function ValidateHash(){
  RandomHeader();
  let ubication = location.hash;

  ubication.startsWith('#home') ? GetHome():
  ubication.startsWith('#search') ? GetSearch(): 
  ubication.startsWith('#categorie') ? GetCategorie(): 
  ubication.startsWith('#details') ? GetDetails(): 
  location.hash = '#home';

  if(historysUrl[historysUrl.length - 1] != ubication)
    historysUrl.push(ubication);
  window.scrollTo(0,0);
}

ValidateHash();

window.addEventListener('hashchange',()=>{
  ValidateHash();
}, false);
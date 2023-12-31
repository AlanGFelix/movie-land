let api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers:{
    accept: 'application/json',
  },
  params: {
    api_key:'349addc21a4cef2c51b020379c9efa28'
  },
})
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

exitButon.addEventListener('click',()=>location.hash = '#home');

async function GetTrendingMovies(){
  let response = await api.get('movie/popular');
  let movies = response.data.results;
  let container = document.querySelector('.trending--article-trends .article_container');
  container.innerHTML = '';

  movies.forEach(movie=> {
    createMoviePreview(container,movie);
  });
}

async function GetMoviesByCategorie(genre, container){
  let responseMovies = await api.get('discover/movie',{
    params:{
      with_genres: genre,
    }
  });
  let movies = responseMovies.data.results;
  console.log(movies);
  movies.forEach(movie=> {
    createMoviePreview(container,movie);
  });
}

async function GetMoviesBysearch(search, container){
  let responseMovies = await api.get('discover/movie',{
    params:{
      with_genres: genre,
    }
  });
  let movies = responseMovies.data.results;
  movies.forEach(movie=> {
    createMoviePreview(container,movie);
  });
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
    
    GetMoviesByCategorie(genre,containerMovies);
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

function GetHome(){
  header.classList.remove('header-movies--details');
  headerNav.classList.remove('article-nav--long');
  exitButon.classList.add('inactive');
  imgLong.classList.remove('inactive');

  detailsCategorie.classList.add('inactive');
  detailsInfo.classList.add('inactive');
  detailsSimilar.classList.add('inactive');
  
  search.classList.add('inactive');
  
  genresCategorie.classList.remove('inactive');
  if(detailsArticle){
    detailsArticle.classList.remove('inactive');
    detailsArticle.classList.replace('article__details', 'article--trending');
  }else{
    trendingCategorie.classList.remove('inactive');
  }
  trends.classList.remove('inactive');
  GetTrendingMovies();
  GetGenresMovies();
}

function GetSearch(){
  let search = location.hash.split('=')[1];
  ShowMoviesLong();

}

function GetCategorie(){
  let categorie = location.hash.split('=')[1];
  let categorieId = categorie.split('-')[0];
  let categorieName = categorie.split('-')[1];
  let title = document.querySelector('#search-title');
  title.innerText = categorieName;
  let container = document.querySelector('.main_article.movies_container');
  container.innerHTML = '';
  ShowMoviesLong();
  GetMoviesByCategorie(categorieId, container);
}

function GetDetails(){
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
}

function ValidateHash(){
  let ubication = location.hash;

  ubication.startsWith('#home') ? GetHome():
  ubication.startsWith('#search') ? GetSearch(): 
  ubication.startsWith('#categorie') ? GetCategorie(): 
  ubication.startsWith('#details') ? GetDetails(): 
  location.hash = '#home';

  window.scrollTo(0,0);
}

ValidateHash();

window.addEventListener('hashchange',()=>{
  ValidateHash();
}, false);

function createMoviePreview(container, movie){
  let divContainer = document.createElement('div');
  divContainer.classList.add('movie_container');

  let image = document.createElement('img');
  image.setAttribute('alt',movie.title);
  image.src = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`;
  let h3 = document.createElement('h3');
  h3.classList.add('movie-title');
  let movieTitle = document.createTextNode(movie.title);
  h3.appendChild(movieTitle);
  divContainer.append(image,h3);
  container.appendChild(divContainer);
}
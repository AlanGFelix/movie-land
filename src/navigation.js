let historysUrl = [];

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
  if(historysUrl.length <= 1){
    location.hash = '#home';
  }else{
    location.hash = historysUrl[historysUrl.length-2];
    historysUrl.pop();
  }
});

trendingButton.addEventListener('click',()=>location.hash = '#categorie=trends');

async function validateScroll(){
  let alturaPantalla = document.documentElement.clientHeight ;
  let scrollActual = document.documentElement.scrollTop;
  let alturaAplicacion = document.documentElement.scrollHeight;

  let validacion = alturaAplicacion <= (alturaPantalla + scrollActual); 
  if (validacion) {
    pagesActual = pagesActual++;
    
    let ubication = location.hash;
    let movies;

    if(ubication.startsWith('#search')){
      let search = location.hash.split('=')[1];
      search = search.replaceAll('%20',' ');
      movies = await GetMoviesBysearch(search,{'pagination':true});
    }else if(ubication.startsWith('#categorie=trends')){
      movies = await GetTrendingMovies({'pagination':true});
    }else{
      let categorie = ubication.split('=')[1];
      let categorieId = categorie.split('-')[0];
      movies = await GetMoviesByCategorie(categorieId,{'pagination':true});
    }
    CreateMovies(containerMoviesCategorie, movies);
  }
}

let pagesActual = 1; 

function ValidateHash(){
  imgLong.classList.add('load');
  imgLong.innerHTML = '';
  window.removeEventListener('scroll',validateScroll);
  let ubication = location.hash;

  function executeScroll(callback){
    callback();
    window.scrollTo(0,0);
    window.addEventListener('scroll',()=>{
      validateScroll();
    }, false);
  }


  ubication.startsWith('#home') ? GetHome():
  ubication.startsWith('#search') ? executeScroll(GetSearch): 
  ubication.startsWith('#categorie') ? executeScroll(GetCategorie): 
  ubication.startsWith('#details') ? GetDetails(): 
  location.hash = '#home';

  if(historysUrl[historysUrl.length - 1] != ubication)
    historysUrl.push(ubication);
}

window.addEventListener('hashchange',()=>{
  pagesActual = 1;
  ValidateHash();
}, false);
try{
  reach.setUrl("http://reachstaging.herokuapp.com/api/");
  reach.key = "";
}catch(e){

  module.exports = function(reach){
    reach.setUrl("http://reachstaging.herokuapp.com/api/");
    reach.key = "";
  }
}




//Main Window.js
angular.module('guessTomato', ['ngAnimate', 'ui.bootstrap'])
.controller('movieSearch', function($scope, $http, OMDb, Movie){
  $scope.gameOn = false;
  $scope.searchOn = false;
  $scope.searches = {results: []};

  $scope.getMovie = function(imdbID) {
    console.log("ding ding ding");
    $scope.gameOn = true;
    $scope.searchOn = false;
    $http({
      method:"GET",
      url: OMDb.getify(imdbID, "i")//'t' for title GET request
    }).then(function(resp) {
      resp.data.Tomato = "public/assets/" + resp.data.tomatoImage + ".png";
      //sets the tomatoMeter Image.
      resp.data.gameOn = true;
      resp.data.gameOver = false;

      Movie.data = resp.data;
    });
  };
  $scope.searchMovie = function() {
    $scope.searchOn = true;
    $scope.gameOn = false;
    $http({
      method:"GET",
      url: OMDb.getify($scope.query, "s")//'s' for search GET request
    }).then(function(resp) {
      $scope.searches.results = resp.data.Search;
      // $scope.searches.results.forEach(function (result) {
      //   result.Poster = "https" + results.Poster.slice(4);
      // });
    });
  };
})
.controller('gameWindow', function ($scope, Movie, HistoryNode) {
  $scope.$watch(function(){return Movie.data;}, function(newV, oldV){
    $scope.userMessage = "Guess the TomatoMeter";
    $scope.guess="";
    $scope.range = "5";
    if (newV.tomatoUserRating > 4) {
      newV.userTomato = "/public/assets/smiley.png";
    } else
    if (newV.tomatoUserRating < 3) {
      newV.userTomato = "/public/assets/angry.png";
    }
    else {
      newV.userTomato = "/public/assets/neutral.png";
    }
    $scope.mov=newV;//tracks Movie.data's changes from 'old' to 'new'
  });//needed to trigger dirty-variable update from 'guessTomato GET request
  $scope.hist = {guesses: []};

  $scope.guessMovie = function() {
    var max = $scope.guess + $scope.range/1,
        min = $scope.guess - $scope.range,
        tomato = Number(Movie.data.tomatoMeter);
    $scope.mov.gameOver = true;

    if (tomato <= max && tomato >= min) {
      var message = tomato === $scope.guess ? "nailed it" : "guessed right";
      $scope.userMessage = "You guessed it!";
      $scope.hist.guesses.push(HistoryNode.build(Movie.data, $scope.guess, message));
    } else {
      $scope.userMessage = "You didn't guess it...";
      $scope.hist.guesses.push(HistoryNode.build(Movie.data, $scope.guess, "guessed wrong"));
    }
  };
  $scope.newSearch = function(){
    $scope.mov.gameOn=false;
  };
})
.service('OMDb', function() {
  var serialize = function(searchQuery) {
    return searchQuery.split(" ").join("+");
  };//normalizes a search query for JSON GET requests

  var getify = function(query, type) {
    var url = "https://www.omdbapi.com/?",
        searchType = type + "=",
        movie = serialize(query),
        params = "&plot=short&tomatoes=true";

    return url+searchType + movie+params;
  };//builds an HTTP request from a search Query

  return {getify: getify};
})
.service("HistoryNode", function(){
  var build = function (movie, guess, message) {
    var range = movie.tomatoMeter > guess ?
      movie.tomatoMeter - guess : guess - movie.tomatoMeter;
    if (!message.includes("nailed")){
        message += " within " + range + "%";
    }
    return {
      Title: movie.Title,
      Tomato: movie.Tomato,
      tomatoMeter: movie.tomatoMeter,
      Message: message + "!",
      range: range
    };
  };

  return {build: build};
})
.factory('Movie', function() {
  var data = {Title: "blah",Year: 2005,Director: "Kenton",
    Plot: "A movie",
    Tomato: "",
    gameOn: false
  };//temp data.

  return {
    data: data,
  };
});

// console.log("Inside weather.js");
// const apiUrl = "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather";
const apiUrl = "https://uwpce-weather-proxy.herokuapp.com/data/2.5/weather";
const weatherAPIId = "d1d1639242e70d95bfcfa804bd279455";
const googleAPI = "AIzaSyD9HFIVhhN6NNCDR4-qyNhoLq2L84UxXmc";
let currentWeather = null;
let latitude = null;
let longitude = null;
let tempUnit = null;

let cityGeoLoc = {
    seattle: {name: "Seattle", country: "US", lat: 47.6762, lon: -122.3182, unit: "imperial"},
    london:  {name: "London", country: "UK", lat: 51.5074, lon: 0.1278, unit: "metric"},
    currLoc: {name: "", country: "US", lat: 51.5074, lon: 0.1278, unit: "metric"},
};

//
//
// function clearList()
// {
//     var ul = document.querySelector("ul");
//     var orderList = document.querySelectorAll("li");
//
//     for(let li of orderList)
//       ul.removeChild(li);
//
// }


function cityWeatherUrlBuilder(queryObj) {
  let holder = [];

  // loop through queryObj key value pairs
  for(let key in queryObj){
    // turn each one into "key=value"
    let convert = `${encodeURIComponent(key)}=${encodeURIComponent(queryObj[key])}`;

    // encodeURIComponent converts spaces and & to URI friendly values so we don't have to worry about them
    holder.push(convert);
  }
  // concatenate the pairs together, with & between
  let longString = holder.join("&");
  // prepend a ? to concatenated string, return
  return `${apiUrl}?${longString}`;
}


function windDirection(deg) {
    if (deg > 337.5) return 'N';
    if (deg > 292.5) return 'NW';
    if (deg > 247.5) return 'W';
    if (deg  > 202.5) return 'SW';
    if (deg > 157.5) return 'S';
    if (deg > 122.5) return 'SE';
    if (deg > 67.5)  return 'E';
    if (deg > 22.5) return 'NE';
    return 'N';
}



function processRequest(cityUrl) {
    let request = new XMLHttpRequest();

    // starts talk to API - 3 params
    // request method, url, (optional) async flag (default true)
    // open() - initializes the request; does the network stuff to make async
    // request possible
    request.open("GET", cityUrl, true);
    // console.log(cityUrl);
    // first when the request is complete
    // long term - I want to update the dom
    // short term - just show me what I got
    // onload() - callback that fires when the async request completes.
    // Handles both success (server gave us data) and failure (server tried,
    // but something went wrong)
    request.onload = function () {
      let weatherDiv = document.getElementById('weatherInfo');
      // let response = JSON.parse(request.response);
      let response = JSON.parse(request.response).body;

      currentWeather = response.main;
      currentWeather.name = response.name;
      currentWeather.country = response.sys.country;
      currentWeather.sunrise = new Date(response.sys.sunrise * 1000);
      currentWeather.sunset = new Date(response.sys.sunset * 1000);
      currentWeather["wind speed"] = response.wind.speed;
      currentWeather["wind direction"] = windDirection(response.wind.deg);
      currentWeather.cloudiness = response.clouds.all + " %";
      currentWeather.weather = response.weather[0].main + " ( " + response.weather[0].description + " )";
      currentWeather.unit = tempUnit;

      let icon = response.weather[0].icon
      currentWeather.icon = `<img src=http://openweathermap.org/img/w/${icon}.png>`;

      drawList();
    }

    // fires if something goes wrong
    // error() - second place things can go wrong; this
    // is a callback for handling network errors
    request.onerror = function (errorObject) {
      console.log("broken : (" );
      console.log(errorObject);
    }

    // additionalWeatherInfo();
    // send the request
    // send() - send our formatted request to the remote server
    request.send();
}



function cityWeather(city) {
      event.preventDefault(); //to prevent the form from submitting to server and refreshing the page

      latitude = city.lat;
      longitude = city.lon;
      tempUnit = city.unit;
      let cityCord =  {units: city.unit, appid: weatherAPIId, lat: city.lat, lon: city.lon};
      let formatted = cityWeatherUrlBuilder(cityCord);

      let h1 = document.querySelector("h1");
      h1.innerHTML = `Current Weather and Forecast Of ${city.name}`;

      // var div1 = document.getElementById("list-container");
      var parent = document.querySelector("#weatherInfo");
      //clear out any existing staff
      parent.innerHTML = `<h3>Weather in ${city.name}, ${city.country}: </h3>`;

      processRequest(formatted);
}


// the following function is triggered when the "current Loc" button is clicked
function currentLocationWeather() {
      // get user's location from the browser
      navigator.geolocation.getCurrentPosition(geolocSuccess, geolocError);
}

// callback for successfully getting location from user's browser
function geolocSuccess(position) {
      const newPos = {lat: position.coords.latitude, lng: position.coords.longitude};
      getLocation(newPos);

      let h1 = document.querySelector("h1");
      h1.innerHTML = "Current Weather and Forecast of " + currentWeather.name;

      // update city name in main page
      let pageTitle = document.querySelector("#weatherInfo");
      let city = `<h3>Weather in ${currentWeather.name}, ${currentWeather.country}</h3>`
      pageTitle.innerHTML = city;
}


// callback for no success getting location from user's browser
function geolocError() {
      console.log("Error getting user's location :(");
}


// helper method to call API and convert longitude & latitude to a human friendly address
function getLocation(currLoc) {

      latitude = Math.floor(currLoc.lat * 10000 + 0.5) / 10000;
      longitude = Math.floor(currLoc.lng * 10000 + 0.5) / 10000;
      tempUnit = "imperial"
      // let cityCord =  {appid: weatherAPIId, lat: latitude, lon: longitude, units: "imperial" };
      let cityCord =  {units: tempUnit, appid: weatherAPIId, lat: latitude, lon: longitude};
      let formatted = cityWeatherUrlBuilder(cityCord);

      processRequest(formatted);
}


function displayCurrentTime () {
      let dateTime = document.getElementById("dateTime");
      let d = (new Date()).toTimeString().slice(0,8);

      dateTime.innerHTML = "<p> current time:  " + d;

      let t = setTimeout(displayCurrentTime, 500);
}



function drawList() {
      // to display currenttime
      displayCurrentTime();

      let wthIcon = document.querySelector(".weatherDetail");
      let tmpDiv = document.querySelector(".currentTemp");
      let cldDiv = document.querySelector(".currentCloud");
      let hmdDiv = document.querySelector(".currentHumidity");
      let wndDiv = document.querySelector(".currentWind");
      wthIcon.innerHTML = currentWeather.icon;

      let unit = currentWeather.unit;
      let temp = "<span id=tempCity>" + Math.round(currentWeather.temp, 0) + "</span>";

      temp = (unit == "metric") ?  temp  + " &degC" : temp  + " &degF";
      tmpDiv.innerHTML = temp;
      let span = document.getElementById("tempCity");
      span.style.fontSize = "5rem";
      cldDiv.innerHTML = "Cloudiness:  " + currentWeather.cloudiness ;

      hmdDiv.innerHTML = "Humidity:  " + currentWeather.humidity + " %";
      wndDiv.innerHTML = "Wind:  " + Math.round(currentWeather["wind speed"],0) + " mph, " + currentWeather["wind direction"];

      showGeoLocation();
}


function showGeoLocation() {
      let imgUrl = "https://maps.googleapis.com/maps/api/staticmap";

      let latlong = latitude + "," + longitude
      let zoom = "&zoom=14&size=400x300&sensor=false"
      let geoMapUrl = `${imgUrl}?center=${latlong}${zoom}&key=${googleAPI}`;

      let positionMap = document.getElementById("showGeoPosition");
      positionMap.innerHTML = "<img src='" + geoMapUrl + "'>";
}


document.addEventListener("DOMContentLoaded", function () {
      console.log('All resouces finished loading and are ready!');

      let seaWeather = document.querySelector('#seattleWeather');
      let lonWeather = document.querySelector('#londonWeather');
      let currLocation = document.querySelector('#currentLocation');

      // seaWeather.addEventListener("click", seattleWeather);
      seaWeather.addEventListener("click", function() {
        cityWeather(cityGeoLoc.seattle); }, false);

      // lonWeather.addEventListener("click", londonWeather);
      lonWeather.addEventListener("click", function() {
        cityWeather(cityGeoLoc.london); }, false );

      currLocation.addEventListener("click", currentLocationWeather);
})


window.onload  = function () {
    currentLocationWeather();
}

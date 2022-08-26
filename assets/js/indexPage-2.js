// ---------------------> Storing all lat/long for ISS & Current Location

let locationData = {
  issLat: "",
  issLong: "",
  currentLat: "",
  currentLong: "",
};

let confirmed = false; // -------------------> Controlling alert notification

// Creating Map

let map = L.map("myMap", {
  center: [25, -100],
  zoom: 4,
});

// Adding Layers/scale to Map

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  format: "jpg70",
  minZoom: 1,
  maxZoom: 10,
  reuseTiles: true,
  unloadInvisibleTiles: true,
}).addTo(map);
L.control.scale().addTo(map);

// Adding Icon

const myIcon = L.icon({
  iconUrl: "./assets/icon/iss.png",
  iconSize: [38, 95],
});

// Adding ISS Marker

let issmarker = new L.Marker([40, -100], {
  draggable: false,
  autoPan: false,
  icon: myIcon,
  title: "International Space Station",
});

// Getting Your Current Geolocation

let getGeolocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showExactPosition);
  } else {
    alert("Geolocation is not supported");
    return;
  }
  function showExactPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    locationData.currentLat = lat;
    locationData.currentLong = long;

    L.marker([lat, long])
      .addTo(map)
      .bindPopup("Your Current Location")
      .openPopup();
  }
};

// Calling API to get the International Space Station Location

let getIssLocation = () => {
  fetch("https://api.wheretheiss.at/v1/satellites/25544")
    .then((response) => response.json())
    .then((data) => {
      let issLat = data.latitude;
      let issLong = data.longitude;

      locationData.issLat = issLat;
      locationData.issLong = issLong;
      issmarker
        .setLatLng([issLat, issLong])
        .addTo(map)
        .bindPopup(
          `<p>Altitude: ${(data.altitude / 1.6).toFixed(1)}ml</p>
          <p>Velocity: ${(data.velocity / 1.6).toFixed(
            1
          )}mph</p><span><a target = "_blank" href="https://eol.jsc.nasa.gov/ESRS/HDEV/">To Find Out more Follow the link</a></span>`
        );
      let issLocation = new L.circleMarker([issLat, issLong], {
        radius: 40,
        color: "blue",
        fillColor: "blue",
      }).addTo(map);
      setInterval(() => {
        map.removeLayer(issLocation);
      }, 2000);
    });
};

// Setting Interval to move ISS marker Periodically

function isISSnearBy() {
  let radiusLimitDeg = 250 / 69;
  let currentRadius = Math.sqrt(
    parseFloat(locationData.issLat - locationData.currentLat) ** 2 +
      parseFloat((locationData.issLong - locationData.currentLong) ** 2)
  );

  if (currentRadius <= radiusLimitDeg && !confirmed) {
    confirmed = true;
    confirm("Look Up You might See International Space Station!");
  }
}

// Getting Parks -------------------------->

function getParks() {
  let queryString = document.location.search;
  console.log(queryString);
  let state = queryString.split(/[?%\d]/).filter((el) => el.length !== 0);
  if (state.length > 1) {
    state = `${state[0]} ${state[1]}`;
  } else {
    state = state[0];
  }
  console.log(state);
  let stateCode = statesAbr[states.indexOf(state)];
  console.log(stateCode);

  fetch(
    `https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&limit=10&api_key=pxrVjAGe1sTiPq6v7V9uFyScwJL6rhZb4dJig11J`
  )
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data.data.length; i++) {
        $(`#${i}`).removeClass(`hidden`);
        $(`#${i} h3`).text(`${data.data[i].fullName}, ${data.data[i].states}`);
        $(`#${i} h3`)
          .attr("data-lat", data.data[i].latitude)
          .attr("data-long", data.data[i].longitude)
          .attr("data-name", data.data[i].name);
        $(`#${i} .description`).text(`${data.data[i].description}`);
      }
    });
}
getParks();
getGeolocation();
getIssLocation();
// Updating ISS Location in the Map and checking if it is within 250 miles vicinity of current location

let interval = setInterval(() => {
  getIssLocation();
  isISSnearBy();
}, 2000);

// Calling functions ------------>

function getWeather(lat, long) {
  return fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=a2cf3270f3154f0e89b161101222308&q=${lat},${long}&days=5&aqi=no`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}

let parks = document.querySelectorAll(".parkContent h3");
parks.forEach((el) => {
  el.addEventListener("click", (e) => {
    let latitudePark = e.target.dataset.lat;
    let longitudePark = e.target.dataset.long;
    getWeather(latitudePark, longitudePark).then((data) => {
      let h3 = document.querySelector("#locationName");
      console.log(data.forecast.forecastday[0].astro.sunrise);
      h3.innerHTML = data.location.name;

      /* <------- weather-wrapper-1 info -------> */
      $("#sunrise").text(`${data.forecast.forecastday[0].astro.sunrise}`);
      $("#sunset").text(` ${data.forecast.forecastday[0].astro.sunset}`);
      $("#icondata img").attr("src", data.current.condition.icon);
      $("#temperature").text(`Temp: ${data.current.temp_f}F`);
      $("#humidity").text(`humidity: ${data.current.humidity}`);
      $("#wind__direction").text(`wind: ${data.current.wind_dir}`);
      $("#precipitations").text(`prec: ${data.current.precip_in}`);

      /* <------- weather-wrapper-2 info -------> */
      const forecastDays = data.forecast.forecastday;
      forecastDays.forEach((el, idx) => {
        $(`#f${idx} .forecastdate`).text(`${el.date}`);
        $(`#f${idx} .forecasticon img`).attr("src", el.day.condition.icon);
        $(`#f${idx} .forecasttemp`).text(`Temp: ${el.day.maxtemp_f}°F`);
        $(`#f${idx} .forecastwind`).text(`Wind: ${el.day.maxwind_mph}`);
        $(`#f${idx} .forecastprecip`).text(`${el.day.totalprecip_in}`);
      });
    });
  });
});

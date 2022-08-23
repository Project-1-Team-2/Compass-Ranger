// Creating Map
let map = L.map("myMap", {
  center: [40, -100],
  zoom: 5,
});

// Adding Layers to Map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  format: "jpg70",
  minZoom: 1,
  maxZoom: 10,
  reuseTiles: true,
  unloadInvisibleTiles: true,
}).addTo(map);

// Adding Icon
const myIcon = L.icon({
  iconUrl: "iss.png",
  iconSize: [38, 95],
});

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
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    L.marker([lat, long])
      .addTo(map)
      .bindPopup("Your Current Location")
      .openPopup();
  }
};

// Calling API to get
let getIssLocation = () => {
  fetch("https://api.wheretheiss.at/v1/satellites/25544")
    .then((response) => response.json())
    .then((data) => {
      let issLat = data.latitude;
      let issLong = data.longitude;
      issmarker
        .setLatLng([issLat, issLong])
        .addTo(map)
        .bindPopup(
          `<p>Altitude: ${data.altitude.toFixed(1)} km</p>
          <p>Velocity: ${data.velocity.toFixed(
            1
          )} km/hr</p><span><a target = "_blank" href="https://en.wikipedia.org/wiki/International_Space_Station">To Find Out more Follow the link</a></span>`
        );
      let location = new L.circleMarker([issLat, issLong], {
        radius: 40,
        color: "blue",
        fillColor: "blue",
      }).addTo(map);
      setInterval(() => {
        map.removeLayer(location);
      }, 1500);
    });
};

// Setting Interval to move ISS marker Periodically
let interval = setInterval(() => {
  getIssLocation();
}, 1500);

getGeolocation();
getIssLocation();

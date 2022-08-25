let locationData = {
  issLat: "",
  issLong: "",
  currentLat: "",
  currentLong: "",
};
let confirmed = false;
// Creating Map
let map = L.map("myMap", {
  center: [40, -100],
  zoom: 5,
});
let latlong = [];

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

// Calling API to get
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
  isISSnearBy();
}, 1500);

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

getGeolocation();
getIssLocation();

// Getting Parks -------------------------->
function getParks() {}

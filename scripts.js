/* Update and display the current time */
function showTime() {
  var currentTimeElem = document.getElementById('currentTime');
  if (currentTimeElem) {
    currentTimeElem.innerHTML = new Date().toUTCString();
  }
}

/* Initialize the live traffic map using Leaflet.js */
function initMap() {
  var mapElem = document.getElementById('map');
  if (!mapElem) return;

  // Use geolocation to get the user's current position and center the map on it
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var userCoords = [position.coords.latitude, position.coords.longitude];

      // Initialize map centered on the user's location
      var map = L.map('map').setView(userCoords, 13);

      // Use OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add marker for user's current location
      L.marker(userCoords).addTo(map)
        .bindPopup("Your current location")
        .openPopup();

      // Fetch and simulate live traffic alerts (accidents, congestion) near the user's location
      fetchAccidents(userCoords, map);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

/* Simulate fetching accidents near the current location */
function fetchAccidents(userCoords, map) {
  // Simulating accident data near user's location (You would replace this with a real API)
  var accidents = [
    { id: 1, lat: userCoords[0] + 0.001, lon: userCoords[1] + 0.002, message: 'Accident reported on Main Street', time: '2025-02-13T10:30:00' },
    { id: 2, lat: userCoords[0] + 0.002, lon: userCoords[1] - 0.003, message: 'Collision at Elm & 5th', time: '2025-02-13T10:45:00' },
    { id: 3, lat: userCoords[0] - 0.003, lon: userCoords[1] + 0.004, message: 'Multiple vehicle crash on Highway 45', time: '2025-02-13T11:00:00' }
  ];

  // Display accidents on the map and list them below
  accidents.forEach(function(accident) {
    var accidentIcon = L.icon({
      iconUrl: 'images/accident.png', // Example accident icon
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add marker to map for each accident
    L.marker([accident.lat, accident.lon], { icon: accidentIcon }).addTo(map)
      .bindPopup(`${accident.message} at ${new Date(accident.time).toLocaleTimeString()}`)
      .openPopup();
  });

  // List accidents below the map
  listAccidents(accidents);
}

/* List accidents below the map */
function listAccidents(accidents) {
  var accidentsListElem = document.getElementById('accidents-list');
  if (!accidentsListElem) return;

  // Generate HTML for the accidents list
  if (accidents.length === 0) {
    accidentsListElem.innerHTML = "<p>No accidents reported nearby.</p>";
  } else {
    accidentsListElem.innerHTML = "<ul>" + accidents.map(a => {
      return `
        <li>
          <strong>${a.message}</strong> <br>
          Location: Lat ${a.lat.toFixed(4)}, Lon ${a.lon.toFixed(4)} <br>
          Reported at: ${new Date(a.time).toLocaleTimeString()}
        </li>
      `;
    }).join("") + "</ul>";
  }
}

/* Simulate live traffic status updates and store emergency alerts */
function updateTrafficStatus() {
  var trafficElem = document.getElementById('traffic-status');
  var trafficImgElem = document.getElementById('traffic-img');
  if (!trafficElem) return;

  var statuses = [
    { text: "Clear", image: "images/clear-traffic.png" },
    { text: "Moderate Traffic", image: "images/moderate-traffic.png" },
    { text: "Heavy Traffic", image: "images/heavy-traffic.png" },
    { text: "Accident Reported", image: "images/accident.png" },
    { text: "Congestion Detected", image: "images/congestion.png" }
  ];

  var randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  trafficElem.innerHTML = randomStatus.text;
  trafficImgElem.src = randomStatus.image;

  // If status indicates an emergency, store it as an alert.
  if (randomStatus.text === "Accident Reported" || randomStatus.text === "Congestion Detected") {
    let alerts = JSON.parse(localStorage.getItem("emergencyAlerts")) || [];
    let alertMessage = randomStatus.text + " at " + new Date().toLocaleTimeString();

    // Add alert only if it is not a duplicate of the last one.
    if (alerts.length === 0 || alerts[alerts.length - 1] !== alertMessage) {
      alerts.push(alertMessage);
      localStorage.setItem("emergencyAlerts", JSON.stringify(alerts));
    }
  }
}

/* Display emergency alerts on the alerts page */
function displayEmergencyAlerts() {
  var alertsElem = document.getElementById('alerts-list');
  if (!alertsElem) return;

  let alerts = JSON.parse(localStorage.getItem("emergencyAlerts")) || [];
  if (alerts.length === 0) {
    alertsElem.innerHTML = "<p>No alerts available at this moment.</p>";
  } else {
    alertsElem.innerHTML = "<ul>" + alerts.map(a => "<li>" + a + "</li>").join("") + "</ul>";
  }
}

/* Initialize the contact form submission to the backend */
function initContactForm() {
  let form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let message = document.getElementById('message').value;

    fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      form.reset();
    })
    .catch(err => {
      console.error(err);
      alert("Your form is submitted successfully.");
    });
  });
}

/* Run functions once the DOM is fully loaded */
document.addEventListener("DOMContentLoaded", function() {
  showTime();
  updateTrafficStatus();

  // Initialize the live traffic map if the page contains the map element.
  if (document.getElementById('map')) {
    initMap();
  }

  // Update current time every second.
  setInterval(showTime, 1000);
  // Update traffic status every 5 seconds.
  setInterval(updateTrafficStatus, 5000);

  // If on the alerts page, display stored emergency alerts.
  if (document.getElementById('alerts-list')) {
    displayEmergencyAlerts();
    // Optionally, refresh alerts every 10 seconds.
    setInterval(displayEmergencyAlerts, 10000);
  }

  // Initialize the contact form if present.
  if (document.getElementById('contact-form')) {
    initContactForm();
  }
});

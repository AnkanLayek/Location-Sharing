const speedLine = document.querySelector("#speed");

const socket = io();
let watchId;

// Tracking the user location and sending to server
if(navigator.geolocation){
    watchId = navigator.geolocation.watchPosition((position) => {
        const {latitude, longitude, accuracy, speed} = position.coords;
        console.log(latitude, longitude, accuracy/1000);
        socket.emit("send-location", { latitude, longitude, speed });
    },
    (error) => {
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

// Setting the initial map view (default view if no loactio provided)
const map = L.map("map").setView([0,0], 13);

// Adding the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Ankan Layek"
}).addTo(map);

// Adding center location button 
const centerCircle = document.createElement("div");
centerCircle.id = "centerCircle";

const centerIcon = document.createElement("i");
centerIcon.classList.add("fa-solid", "fa-location-crosshairs");
centerIcon.id = "centerIcon";

centerCircle.appendChild(centerIcon);
document.querySelector("#map").appendChild(centerCircle);

const markers = {};
let autoCenter = true;

// Disabling auto center map when view changed manually
map.on("dragstart", ()=> {
    console.log("auto center disabled for dragging");
    autoCenter = false;
});
map.on("zoomstart", ()=> {
    console.log("auto center disabled for zooming");
    autoCenter = false;
});

let userData;

// Enabling auto center map
const centerMap = () => {
    let {latitude, longitude} = userData;
    console.log(`Map centered at ${latitude}, ${longitude}`);
    map.setView([latitude, longitude], 13);
    autoCenter = true;
}
centerIcon.addEventListener("click", () => {
    centerMap();
    setTimeout(centerMap, 10);
})

// Receiving user location from server and setting map view
socket.on("receive-location", (data) => {
    let {id, latitude, longitude, speed} = data;
    userData = data;

    if(autoCenter){
        map.setView([latitude, longitude], 13);
    }

    if(markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    }
    else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }


    let kmph

    if(speed == null){
        kmph = "null"
    } else{
        kmph = 3.6*speed;
        kmph = Math.round(kmph*100)/100
    }

    speedLine.innerText = `${kmph}`;
    console.log("autoCenter = ", autoCenter);
});

// Removing marker on user disconnect
socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    if(watchId){
        navigator.geolocation.clearWatch(watchId);
    }
});
const speedLine = document.querySelector("#speed");

const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position) => {
        const {latitude, longitude, accuracy, speed} = position.coords;
        // console.log(latitude, longitude, accuracy/1000);
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

const map = L.map("map").setView([0,0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Ankan Layek"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    let {id, latitude, longitude, speed} = data;
    map.setView([latitude, longitude], 13);
    if(markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    }
    else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    if(speed == null){
        speed = "null"
    }

    speedLine.innerText = `${speed}`;
});

socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})
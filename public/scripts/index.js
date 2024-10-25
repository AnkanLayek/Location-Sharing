const speedLine = document.querySelector("#speed");

const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position) => {
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

const map = L.map("map").setView([0,0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Ankan Layek"
}).addTo(map);

const centerCircle = document.createElement("div");
centerCircle.id = "centerCircle";

const centerIcon = document.createElement("i");
centerIcon.classList.add("fa-solid", "fa-location-crosshairs");
centerIcon.id = "centerIcon";

centerCircle.appendChild(centerIcon);
document.querySelector("#map").appendChild(centerCircle);

const markers = {};
let autoCenter = true;

map.on("movestart", ()=> {
    console.log("auto center disabled");
    autoCenter = false;
})

socket.on("receive-location", (data) => {
    let {id, latitude, longitude, speed} = data;

    if(autoCenter){
        map.setView([latitude, longitude], 13);
        autoCenter = true
    }

    const centerMap = () => {
        console.log("Map centered");
        map.setView([latitude, longitude], 13);
        autoCenter = true;
    }
    centerIcon.addEventListener("click", () => {
        centerMap();
        setTimeout(centerMap, 10);
    })

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
    console.log(autoCenter)
});

socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
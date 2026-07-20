/*====================================================
 Ancient World Explorer 3D
 app.js
 Part 1 of 6
====================================================*/

// ----------------------------
// Scene
// ----------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

// ----------------------------
// Camera
// ----------------------------

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 4);

// ----------------------------
// Renderer
// ----------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document
    .getElementById("globeContainer")
    .appendChild(renderer.domElement);

// ----------------------------
// Orbit Controls
// ----------------------------

const controls = new THREE.OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enablePan = false;

controls.minDistance = 1.8;
controls.maxDistance = 8;

// ----------------------------
// Lights
// ----------------------------

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.2
);

scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunLight.position.set(5, 3, 5);

scene.add(sunLight);

// ----------------------------
// Earth
// ----------------------------

const earthGeometry = new THREE.SphereGeometry(
    1,
    64,
    64
);

const earthTexture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
);

const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 25
});

const earth = new THREE.Mesh(
    earthGeometry,
    earthMaterial
);

scene.add(earth);

// ----------------------------
// Realistic Planets + Satellites
// ----------------------------

const textureLoader = new THREE.TextureLoader();


// Mars
const marsTexture = textureLoader.load(
    "https://threejs.org/examples/textures/planets/mars_1k_color.jpg"
);

const mars = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 64, 64),
    new THREE.MeshPhongMaterial({
        map: marsTexture
    })
);

mars.position.set(3, 0, 0);

scene.add(mars);


// Moon (real texture)
const moonTexture = textureLoader.load(
    "https://threejs.org/examples/textures/planets/moon_1024.jpg"
);

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 64, 64),
    new THREE.MeshPhongMaterial({
        map: moonTexture
    })
);

// Moon orbit system
const moonOrbit = new THREE.Group();

moonOrbit.add(moon);

scene.add(moonOrbit);


// Satellite
const satelliteGeometry = new THREE.BoxGeometry(
    0.04,
    0.04,
    0.12
);

const satelliteMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff
});

const satellite = new THREE.Mesh(
    satelliteGeometry,
    satelliteMaterial
);

scene.add(satellite);

// ----------------------------
// Atmosphere
// ----------------------------

const atmosphereGeometry =
new THREE.SphereGeometry(
    1.04,
    64,
    64
);

const atmosphereMaterial =
new THREE.MeshBasicMaterial({

    color: 0x66ccff,

    transparent: true,

    opacity: 0.18,

    side: THREE.BackSide

});

const atmosphere = new THREE.Mesh(
    atmosphereGeometry,
    atmosphereMaterial
);

scene.add(atmosphere);

// ----------------------------
// Stars
// ----------------------------

const starGeometry =
new THREE.BufferGeometry();

const starVertices = [];

for(let i = 0; i < 8000; i++){

    starVertices.push(

        (Math.random()-0.5)*250,

        (Math.random()-0.5)*250,

        (Math.random()-0.5)*250

    );

}

starGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(
        starVertices,
        3
    )

);

const starMaterial =
new THREE.PointsMaterial({

    color: 0xffffff,

    size: 0.25

});

const stars =
new THREE.Points(
    starGeometry,
    starMaterial
);

scene.add(stars);

// ----------------------------
// Clock
// ----------------------------

const clock = new THREE.Clock();

// ----------------------------
// Variables
// ----------------------------

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();

const markers = [];

const infoTitle =
document.getElementById("siteTitle");

const infoDescription =
document.getElementById("siteDescription");

const loadingScreen =
document.getElementById("loadingScreen");
/*====================================================
 Part 2 of 6
 Animation System
====================================================*/

// ----------------------------
// Rotation Speed
// ----------------------------

const EARTH_ROTATION_SPEED = 0.0015;

// ----------------------------
// Resize
// ----------------------------

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

// ----------------------------
// Mouse Position
// ----------------------------

window.addEventListener("pointermove", (event) => {

    mouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;

});

// ----------------------------
// Loading Screen
// ----------------------------

window.addEventListener("load", () => {

    setTimeout(() => {

        loadingScreen.style.transition =
            "opacity 1s ease";

        loadingScreen.style.opacity = "0";

        setTimeout(() => {

            loadingScreen.style.display = "none";

        }, 1000);

    }, 800);

});

// ----------------------------
// Animation Loop
// ----------------------------

function animate(){

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Rotate Earth

    earth.rotation.y += EARTH_ROTATION_SPEED;
    
    // Moon orbit
moonOrbit.rotation.y += 0.01;

moon.position.set(
    1.4,
    0,
    0
);


// Satellite orbit
const time = clock.getElapsedTime();

satellite.position.set(
    Math.cos(time) * 1.5,
    0.2,
    Math.sin(time) * 1.5
);

    // Rotate atmosphere slightly faster

    atmosphere.rotation.y +=
        EARTH_ROTATION_SPEED * 1.05;

    // Rotate star field

    stars.rotation.y =
        elapsed * 0.01;

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

// Start animation

animate();
/*====================================================
 Part 3 of 6
 Monument Markers
====================================================*/

// ----------------------------
// Convert Latitude & Longitude
// ----------------------------

function latLngToVector3(lat, lng, radius){

    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;

    return new THREE.Vector3(

        -radius * Math.sin(phi) * Math.cos(theta),

         radius * Math.cos(phi),

         radius * Math.sin(phi) * Math.sin(theta)

    );

}

// ----------------------------
// Create Monument Markers
// ----------------------------

function createMarkers(){

    if(typeof MONUMENTS === "undefined"){

        console.error("MONUMENTS not found in data.js");

        return;

    }

    MONUMENTS.forEach(site=>{

        const marker = new THREE.Mesh(

            new THREE.SphereGeometry(0.02,16,16),

            new THREE.MeshBasicMaterial({

                color:0xff3333

            })

        );

        marker.position.copy(

            latLngToVector3(

                site.lat,

                site.lng,

                1.03

            )

        );

        marker.userData = site;

        earth.add(marker);

        markers.push(marker);

    });

}

createMarkers();
/*====================================================
 Part 4 of 6
 Marker Interaction
====================================================*/

// ----------------------------
// Click Monument Marker
// ----------------------------

window.addEventListener("click", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(markers);

    if (hits.length === 0) return;

    const marker = hits[0].object;
    const site = marker.userData;

    // Update Information Panel

    infoTitle.textContent = site.name;

    infoDescription.innerHTML = `
        <strong>Country:</strong> ${site.country}<br><br>

        <strong>Category:</strong> ${site.category}<br><br>

        <strong>Mainstream Explanation</strong><br>
        ${site.mainstream}<br><br>

        <strong>Alternative Theory (Speculative)</strong><br>
        ${site.alternative}
    `;

    // Reset all markers

    markers.forEach(m => {

        m.material.color.set(0xff3333);
        m.scale.set(1,1,1);

    });

    // Highlight selected marker

    marker.material.color.set(0x00ffff);
    marker.scale.set(2,2,2);

});

// ----------------------------
// Hover Cursor
// ----------------------------

window.addEventListener("pointermove", () => {

    raycaster.setFromCamera(mouse, camera);

    const hit = raycaster.intersectObjects(markers);

    document.body.style.cursor =
        hit.length ? "pointer" : "default";

});
/*====================================================
 Part 5 of 6
 Search + Marker Animation
====================================================*/

// ----------------------------
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", function () {

    const query = this.value.toLowerCase().trim();

    markers.forEach(marker => {

        const site = marker.userData;

        const match =
            site.name.toLowerCase().includes(query) ||
            site.country.toLowerCase().includes(query) ||
            site.category.toLowerCase().includes(query);

        marker.visible = query === "" || match;

    });

   });
   
// ----------------------------
// Pulsing Marker Animation
// ----------------------------

let pulseTime = 0;

// Save the current animation function
const previousAnimate = animate;

// Replace it with an enhanced version
animate = function () {

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    pulseTime += 0.05;

    earth.rotation.y += EARTH_ROTATION_SPEED;
    atmosphere.rotation.y += EARTH_ROTATION_SPEED * 1.05;
    stars.rotation.y = elapsed * 0.01;

    // Pulse all visible markers
    markers.forEach(marker => {

        const pulse = 1 + Math.sin(pulseTime) * 0.15;

        if (marker.visible) {

            marker.scale.set(pulse, pulse, pulse);

        }

    });

    controls.update();

    renderer.render(scene, camera);

};

// Restart animation with the enhanced loop
animate();
/*====================================================
 Part 6 of 6
 Final Improvements
====================================================*/

// ----------------------------
// Camera Fly-To
// ----------------------------

let flyTarget = null;

function flyToMarker(marker){

    flyTarget = marker.getWorldPosition(
        new THREE.Vector3()
    );

    flyTarget.normalize();

    flyTarget.multiplyScalar(2.4);

}

// ----------------------------
// Click Handler (Fly To)
// ----------------------------

window.addEventListener("click",(event)=>{

    mouse.x=(event.clientX/window.innerWidth)*2-1;
    mouse.y=-(event.clientY/window.innerHeight)*2+1;

    raycaster.setFromCamera(mouse,camera);

    const hits = raycaster.intersectObjects(markers);

    if(hits.length){

        flyToMarker(hits[0].object);

    }

});

// ----------------------------
// Smooth Camera Update
// ----------------------------

const originalUpdate = controls.update;

controls.update = function(){

    if(flyTarget){

        camera.position.lerp(
            flyTarget,
            0.03
        );

        camera.lookAt(earth.position);

        if(
            camera.position.distanceTo(flyTarget)
            <0.05
        ){

            flyTarget = null;

        }

    }

    originalUpdate.call(this);

};

// ----------------------------
// Startup Message
// ----------------------------

console.log(
    "Ancient World Explorer Version 1.0 Ready"
);
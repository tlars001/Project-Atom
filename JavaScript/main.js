/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This is the main file for the program. It will direct the program and call
 *  functions to make Project Atom work.
*******************************************************************************/

// Necessary global variables for the project
var scene, camera, renderer, particles, particleSystem, particleCount = 2000;
var textureLoader, controls, raycaster, mouse, keepParticles = true;
var INTERSECTED, rotation = 0, cameraSphere, isMobile = false;
var isTable = false, isCenter = true, isMoving = true;
var elementView = false, mainLight, showUI = false;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000);
  camera.position.set(0,0,-500);
  mouse = new THREE.Vector2();
  scene = new THREE.Scene();

   // Check if user is on a mobile device
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    document.getElementById('titleHeader').style.fontSize = '10vw';
    document.getElementById('soundIcon').style.width = '40px';
    document.getElementById('settingsWindow').style.width = '70%';
    //document.getElementById('settingsWindow').style.right = '-70%';
    isMobile = true;
  }

  // Resize when the orientation changes on mobile
  window.addEventListener("orientationchange", function() {
    setTimeout(changeOrientation, 250); // Adds a delay for chrome
  });


  // Add the space skybox
  textureLoader = new THREE.TextureLoader();
  var mainBackground = new textureLoader.load( 'Resources/skyBox.png');
  var particleTexture = new textureLoader.load( 'Resources/particle.png');
  var boxGeometry = new THREE.BoxGeometry( 30000, 30000, 30000);
  var skyMaterial = new THREE.MeshBasicMaterial({map: mainBackground,
                                                 side: THREE.BackSide});
  var skybox = new THREE.Mesh(boxGeometry, skyMaterial);
  
  scene.background = skybox;
  scene.add(skybox);


  // Needed for particles for some reason
  geometry = new THREE.SphereGeometry(0.01, 10, 9);
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  cameraSphere = mesh;
  cameraSphere.position.set(0,0,0);
  scene.add(cameraSphere);
  camera.lookAt(cameraSphere.position);
  //cameraSphere.add(camera);

  raycaster = new THREE.Raycaster();
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );

  
  setPanControls();
  controls.enabled = false;

  addLights(0,0,0);
  var ambientLight = new THREE.AmbientLight( 0x404040, 2 ); // soft white light
  scene.add( ambientLight );
  createParticles(particleTexture);

  generateTable()

  document.body.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function animate() {

  if (keepParticles) {
    updateParticles();
  }

  if (cameraSphere.position.z === -1002 && !controls.enabled) {
    showUI = false;
    setTableMovement();
  }

  if (cameraSphere.position.x === 390 && isTable) {
    scene.remove(elementItemsGroup);
    elementItemsGroup = new THREE.Group();
    if (protons) {
      protons.forEach(removeFromWorld);
      neutrons.forEach(removeFromWorld);
    }
    
    //scene.add(mainLight);
    elementGenerated = false;
    electronRotation = 0;
  }

  if (cameraSphere.position.x === 390 && elementView && !elementGenerated) {
    elementInit();
  }

  if (isTable) {
    if (cameraSphere.position.z > -1000) {
      //rotation += 0.01;
      cameraSphere.position.z -= 3;
      camera.lookAt(cameraSphere.position);
      if (cameraSphere.position.z > -500)
        cameraSphere.position.x += 3;
      else
        cameraSphere.position.x -= 3;
    }

    if (!isMoving && isTable) {
      checkPanRange();
    }
  }

  if (isSelected && elementView) {
    controls.enabled = false;
    adjustCameraPosition();
  }

  if (elementView && !isMoving && !showUI) {
    displayUI();
    showUI = true;
    console.log("test");
  }

  if (goingBack) {
    rotation = 0;
    controls.enabled = false;
    adjustCameraPosition();
  }

  if (elementView && cameraSphere.position.z > -1 && isSelected) {
    cameraSphere.position.set(0,0,0);
    isSelected = false;
    isMoving = false;
    setOrbitControls();
    scene.remove(outlineMesh);
    scene.remove(elementGroup);
    //scene.remove(mainLight);
    //elementInit();
  }

  if (elementGenerated) {
    rotateElectron();
    updatePhysics();
  }


  if (!isMobile && isTable && !isMoving) {
    checkIntersection();
  }

  requestAnimationFrame(animate);

  if (!isMoving)
    controls.update();

  renderer.render(scene, camera);

}

function checkPanRange() {
  if (controls.target.y < -200) {
    controls.target.y = -200;
    controls.target.z = -1000;
    camera.position.y = -200;
  }

  if (controls.target.y > 200) {
    controls.target.y = 200;
    controls.target.z = -1000;
    camera.position.y = 200;
  }

  if (controls.target.x < -350) {
    controls.target.x = -350;
    controls.target.z = -1000;
    camera.position.x = -350;
  }

  if (controls.target.x > 350) {
    controls.target.x = 350;
    controls.target.z = -1000;
    camera.position.x = 350;
  }
}

function adjustCameraPosition() {

  if (goingBack && camera.position.z > 0) {
    camera.position.z -= 3;
    if (camera.position.x < 0)
      camera.position.x -= 1;
    else
      camera.position.x += 0;
  }
  else {
    if (camera.position.x > 2)
      camera.position.x -= 3;

    if (camera.position.x < -2)
      camera.position.x+= 3;

    if (camera.position.y > 2)
      camera.position.y-= 3;

    if (camera.position.y < -2)
      camera.position.y+= 3;

    if (camera.position.z > -498)
      camera.position.z-= 3;

    if (camera.position.z < -502)
      camera.position.z+= 3;
}

  if (camera.position.x > -2 && camera.position.x < 2 &&
      camera.position.y > -2 && camera.position.y < 2 &&
      camera.position.z > -502 && camera.position.z < -498) {
    if (goingBack) {
      camera.lookAt(cameraSphere.position);
      isTable = true;
      goingBack = false;
      elementView = false;
      isMoving = true;
      scene.add(elementGroup);
    }
    else {
      moveToElementView();
    }
  }
  else {
    if (!goingBack) {
      cameraSphere.position.set(0,0,-1000);
    }
  }
}

function moveToElementView() {
  //console.log("test2");
  //rotation += 0.01;
  camera.lookAt(cameraSphere.position);
  if (cameraSphere.position.z < 0) {
    cameraSphere.position.z += 3;
    if (cameraSphere.position.z < -500)
      cameraSphere.position.x += 3;
    else
      cameraSphere.position.x -= 3;
  }
}

function setPanControls() {
  controls = new THREE.PanControls( camera, renderer.domElement);
  controls.enableDamping = true; 
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.3;
  controls.screenSpacePanning = true;
  controls.minDistance = 50;
  controls.maxDistance = 800;
  controls.panSpeed = 0.2;
}

function setOrbitControls() {
  controls = new THREE.OrbitControls( camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.enablePan = false;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.3;
  controls.minDistance = 70;
  controls.maxDistance = 800;

  controls.enabled = true;
}

/*******************************************************************************
 *  Function: changeSound()
 *  Description: This function will change the sound icon and mute/unmute sound.
*******************************************************************************/
function changeSound() {
  var theSound = document.getElementById("theSound");
  var isMuted = theSound.muted;
  if (isMuted == true) {
    theSound.muted = false;
    document.getElementById("soundIcon").src = 'Resources/sound.png'
  }
  else {
    theSound.muted = true;
    document.getElementById("soundIcon").src = 'Resources/mute.png'
  }
}

/*******************************************************************************
 *  Function: changeOrientation()
 *  Description: This function will resize the canvas when the orientation 
 *  changes
*******************************************************************************/
function changeOrientation() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

/*******************************************************************************
 *  Function: addLights()
 *  Description: This function adds a point light to the scene.
*******************************************************************************/
function addLights(x,y,z) {
  mainLight = new THREE.PointLight(0xffffff, 0.5);
  mainLight.position.set(x, y, z);
  scene.add(mainLight);
}

function createParticles(texture) {
  // create the particle variables
  particles = new THREE.Geometry();
  var pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 1,
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

  // now create the individual particles
  for (var p = 0; p < particleCount; p++) {

    // create a particle with random
    var pX = Math.random() * 300 - 150,
        pY = Math.random() * 200 - 100,
        pZ = Math.random() * 150 - 150,
        particle = new THREE.Vector3(pX, pY, pZ);

    particle.velocity = new THREE.Vector3(
      0,        // x
      -Math.random(), // y
      0);       // z

    // add it to the geometry
    particles.vertices.push(particle);
  }

  // create the particle system
  particleSystem = new THREE.Points(
      particles,
      pMaterial);
  particleSystem.sortParticles = true;

  // add it to the scene
  scene.add(particleSystem);
  particleSystem.position.set(0,0,-300);
}

function updateParticles() {  
  var verts = particleSystem.geometry.vertices;
  for(var i = 0; i < verts.length; i++) {
    var vert = verts[i];
    if (vert.y < -60) {
      vert.y = Math.random() * 200;
    }
    vert.y = vert.y - (10 * 0.002);
  }
  particleSystem.geometry.verticesNeedUpdate = true;
  
  particleSystem.rotation.y -= .1 * 0.002;
}

function startProgram() {
  console.log("test");
  document.getElementById("theSound").play();
  document.getElementById("titleHeader").classList.add("titleHidden");
  document.getElementById("startButton").classList.add("titlehidden");
  document.getElementById("startButton").disabled = true;
  setTimeout(function() {
    scene.remove(particleSystem)
    keepParticles = false;
  }, 6000); // Delete all particles after 8 seconds

  isCenter = false;
  isTable = true;
  isMoving = true;
  //setTimeout(setTableMovement, 9000);

  //generateTable();
}

function setTableMovement() {
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  isMoving = false;
  setPanControls();
  controls.target.set(0,0,-1000);
  controls.update();
  controls.enabled = true;
}

function onDocumentMouseMove( event ) 
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();
  
  // update the mouse variable
  if (isTable)
  {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
}
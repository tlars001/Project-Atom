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
var INTERSECTED, rotation = 0, isMobile = false, programStarted = false;
var isTable = false, isCenter = true, isMoving = true;
var elementView = false, mainLight, showUI = false, playAudio = true;
var loader, audioLoader, audioListener, theSound, theFont, isLoaded = false;
var manager = new THREE.LoadingManager();

loader = new THREE.FontLoader(manager);
loader.load('Resources/helvetiker_regular.typeface.json', function(response) {
  theFont = response;
});

audioListener = new THREE.AudioListener();
theSound = new THREE.Audio(audioListener);
audioLoader = new THREE.AudioLoader(manager);
audioLoader.load('Resources/bensound-relaxing.mp3', function (buffer) {
  theSound.setBuffer(buffer);
  theSound.setLoop(true);
});

textureLoader = new THREE.TextureLoader(manager);
var mainBackground = textureLoader.load( 'Resources/skyBox.png');
var particleTexture = textureLoader.load( 'Resources/particle.png');
var electronTexture = textureLoader.load( 'Resources/glow.png');

manager.onLoad = function() {
  init();
  animate();
  isLoaded = true;

  setTimeout(function() {
    document.getElementById("curtain").classList.replace("curtainVisible", "curtainHidden");
  }, 500);
}

function init() {
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000);
  mouse = new THREE.Vector2();
  scene = new THREE.Scene();

  camera.add(audioListener);

  // Resize when the orientation changes on mobile
  window.addEventListener("orientationchange", function() {
    setTimeout(changeOrientation, 250); // Adds a delay for chrome
  });

  // Check if user is on a mobile device
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    document.getElementById('soundIcon').style.width = '40px';
    document.getElementById('infoWindow').style.height = '100%';
    document.getElementById('elementName').style.bottom = '-28px';
    isMobile = true;

    if (window.innerHeight > window.innerWidth) {
      if (/iPad/i.test(navigator.userAgent)) {
        document.getElementById('settingsWindow').style.width = '40%';
      }
      else {
        document.getElementById('settingsWindow').style.width = '70%';
      }
    }
    else {
      document.getElementById('settingsWindow').style.width = '40%';
    }
  }


  // Add the space skybox
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

  raycaster = new THREE.Raycaster();
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  setPanControls();
  controls.enabled = false;

  addLights(0,0,0);
  var ambientLight = new THREE.AmbientLight( 0x404040, 2 ); // soft white light
  scene.add( ambientLight );
  createParticles(particleTexture);

  camera.position.set(0,0,-100);
  document.body.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function animate() {

  if (keepParticles) {
    updateParticles();
  }

  if (isTable && goingBack) {
    goingBack = false;
    scene.remove(elementItemsGroup);
    elementItemsGroup = new THREE.Group();
    if (protons) {
      protons.forEach(removeFromWorld);
      neutrons.forEach(removeFromWorld);
    }
    
    elementGenerated = false;
    electronRotation = 0;
  }

  if (isTable && !elementView) {
      checkPanRange();
  }

  if (elementView && !isMoving && !showUI) {
    displayUI();
    showUI = true;
  }

  if (goingBack && controls.enabled) {
    rotation = 0;
    controls.enabled = false;
  }

  if (!pauseMovement) {
    if (elementGenerated) {
      rotateElectron();
      updatePhysics();
    }
  } 

  if (!isMobile && isTable && !isMoving) {
    checkIntersection();
  }

  requestAnimationFrame(animate);

  if (!isMoving) {
    controls.update();
  }

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

function setPanControls() {
  camera.position.set(0,0,-500);
  camera.lookAt(new THREE.Vector3(0,0,-1000));
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
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000);
  camera.position.set(0,0,-500);
  controls = new THREE.OrbitControls( camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.enablePan = false;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.3;
  controls.minDistance = 150;
  controls.maxDistance = 800;

  controls.enabled = true;
}

/*******************************************************************************
 *  Function: changeSound()
 *  Description: This function will change the sound icon and mute/unmute sound.
*******************************************************************************/
function changeSound() {
  var soundIconSrc = document.getElementById("soundIcon").src;
  var isPlaying = theSound.isPlaying;
  if (soundIconSrc.includes('Resources/mute.png')) {
    if (programStarted) {
    theSound.play();
    }

    document.getElementById("soundIcon").src = 'Resources/sound.png'
    playAudio = true;
  }
  else {
    theSound.pause();
    document.getElementById("soundIcon").src = 'Resources/mute.png'
    playAudio = false;
  }
}

/*******************************************************************************
 *  Function: changeOrientation()
 *  Description: This function will resize the canvas when the orientation 
 *  changes
*******************************************************************************/
function changeOrientation() {
  if (isLoaded) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    if (isMobile) {
      if (window.innerHeight > window.innerWidth) {
        if (/iPad/i.test(navigator.userAgent)) {
          document.getElementById('settingsWindow').style.width = '40%';
        }
        else {
          document.getElementById('settingsWindow').style.width = '70%';
        }
      }
      else {
          document.getElementById('settingsWindow').style.width = '40%';
          //document.getElementById('loading').style.transform = 'translateY(320%)';
      }
    }
  }
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
    var pX = Math.random() * 200 - 100,
        pY = Math.random() * 200 - 100,
        pZ = Math.random() * 200 - 100,
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
  
  particleSystem.rotation.y -= .1 * 0.005;
}

function startProgram() {
  programStarted = true;

  if (playAudio) {
  theSound.play();
  }

  document.getElementById("titleHeader").classList.replace("titleVisible", "titleHidden");
  document.getElementById("startButton").classList.replace("titleVisible", "titleHidden");
  document.getElementById("startButton").disabled = true;
  document.getElementById("curtain").classList.replace("curtainHidden", "curtainVisible");

  setTimeout(function() {
    scene.remove(particleSystem)
    keepParticles = false;

    isCenter = false;
    isTable = true;
    isMoving = true;
    camera.lookAt(new THREE.Vector3(0,0,-1000));
    generateTable();
    setTableMovement();
    document.getElementById("curtain").classList.replace("curtainVisible", "curtainHidden");
  }, 1000); // Change the scene after 1 second
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

function onDocumentMouseMove( event ) {  
  // update the mouse variable
  if (isTable)
  {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
}
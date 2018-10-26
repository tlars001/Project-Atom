/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This is the main file for the program. It will direct the program and call
 *  functions to make Project Atom work.
*******************************************************************************/

var scene, camera, renderer, particles, particleSystem, particleCount = 1800;
var controls, raycaster, mouse, keepParticles = true, spawnParticles = true;
var INTERSECTED;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0,50,70);
  mouse = new THREE.Vector2();
  scene = new THREE.Scene();

   // Check if user is on a mobile device
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    document.getElementById('titleHeader').style.fontSize = '10vw';
    document.getElementById('soundIcon').style.width = '40px';
  }

  // Resize when the orientation changes on mobile
  window.addEventListener("orientationchange", function() {
    setTimeout(changeOrientation, 250); // Adds a delay for chrome
  });

  // Add the space skybox
  var textureLoader = new THREE.TextureLoader();
  var mainBackground = new textureLoader.load( 'Resources/skyBox.png');
  var particleTexture = new textureLoader.load( 'Resources/particle.png');
  var boxGeometry = new THREE.BoxGeometry( 1000, 1000, 1000);
  var skyMaterial = new THREE.MeshBasicMaterial({map: mainBackground,
                                                 side: THREE.BackSide});
  var skybox = new THREE.Mesh(boxGeometry, skyMaterial);
  
  scene.background = skybox;
  scene.add(skybox);


  // Needed for particles for some reason
  geometry = new THREE.BoxGeometry( 5, 5, 5 );
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );

  raycaster = new THREE.Raycaster();
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );

  controls = new THREE.OrbitControls( camera, renderer.domElement);
  //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  //controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 50;
  controls.maxDistance = 500;
  //controls.maxPolarAngle = Math.PI / 2;

  var axesHelper = new THREE.AxesHelper( 50 );
  scene.add(axesHelper);
  camera.lookAt(axesHelper.position);


  var ambientLight = new THREE.AmbientLight( 0x404040, 1 ); // soft white light
  scene.add( ambientLight );
  createParticles(particleTexture);

  document.body.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function animate() {

  if (keepParticles) {
    updateParticles();
  }

  checkIntersection();

  requestAnimationFrame(animate);

  renderer.render(scene, camera);

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

  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
}

/*******************************************************************************
 *  Function: addLights()
 *  Description: This function adds a point light to the scene.
*******************************************************************************/
function addLights(x,y,z) {
  var light = new THREE.PointLight(0xffffff, 1);
  light.position.set(x, y, z);
  scene.add(light);
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
    // position values, -250 -> 250
    var pX = Math.random() * 400 - 200,
        pY = Math.random() * 400 - 200,
        pZ = Math.random() * 400 - 200,
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
    if (vert.y < -200 && spawnParticles) {
      vert.y = Math.random() * 800 - 400;
    }
    vert.y = vert.y - (10 * 0.01);
  }
  particleSystem.geometry.verticesNeedUpdate = true;
  
  particleSystem.rotation.y -= .1 * 0.01;
}

function startProgram() {
  document.getElementById("theSound").play();
  document.getElementById("titleHeader").classList.add("hidden");
  document.getElementById("startButton").classList.add("hidden");
  spawnParticles = false;
  setTimeout(function() {
    scene.remove(particleSystem)
    keepParticles = false;
  }, 65000); // Delete all particles after 65 seconds

  generateTable();
}

function onDocumentMouseMove( event ) 
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();
  
  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}



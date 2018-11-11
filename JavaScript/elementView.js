var electronMesh, elementGenerated = false;
var goingBack = false;
var elementItemsGroup = new THREE.Group();
var electronRotation = 0;

function elementInit()
{
	document.getElementById("backBtn").classList.replace("hidden", "visible");
	document.getElementById("settingsBtn").classList.replace("hidden", "visible");
	document.getElementById("infoBtn").classList.replace("hidden", "visible");
	createProton();
	createNeutron();
	createElectron();
	elementItemsGroup.name = "elementItemsGroup";
	scene.add(elementItemsGroup);
	elementGenerated = true;
}

function createProton() {
	var protonGeometry = new THREE.SphereGeometry(10, 10, 9);
  var protonMaterial = new THREE.MeshPhongMaterial({color: "blue"});
  var protonMesh = new THREE.Mesh( protonGeometry, protonMaterial );
  protonMesh.position.set(-10,0,0);
  elementItemsGroup.add(protonMesh);
  //scene.add(protonMesh);
}

function createNeutron() {
	var neutronGeometry = new THREE.SphereGeometry(10, 10, 9);
  var neutronMaterial = new THREE.MeshPhongMaterial({color: "grey"});
  var neutronMesh = new THREE.Mesh( neutronGeometry, neutronMaterial );
  neutronMesh.position.set(10,0,0);
  elementItemsGroup.add(neutronMesh);
  //scene.add(neutronMesh);
}

function createElectron() {
	var electronGeometry = new THREE.SphereGeometry(1, 10, 9);
  var electronMaterial = new THREE.MeshBasicMaterial({color: "yellow"});
  electronMesh = new THREE.Mesh( electronGeometry, electronMaterial );
  electronMesh.position.set(0,10,-20);
  addGlow(electronMesh);
  addElectronLight(electronMesh);
  elementItemsGroup.add(electronMesh);
  //scene.add(electronMesh);
}

/*******************************************************************************
 *  Function: addGlow()
 *  Description: This creates a glow effect that is added to the desired object.
*******************************************************************************/
function addGlow(theMesh) {
  var spriteMaterial = new THREE.SpriteMaterial(
  {
    map: textureLoader.load( 'Resources/glow.png' ),
    color: "yellow", transparent: false, blending: THREE.AdditiveBlending });
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(10, 10, 1.0);
  theMesh.add(sprite); // this centers the glow at the mesh
}

function addElectronLight(theMesh) {
  var light = new THREE.PointLight(0xffffff, 1);
  theMesh.add(light);
}

function rotateElectron() {
  electronRotation += 0.05;

  electronMesh.position.x = Math.sin(electronRotation) * 50;
  electronMesh.position.y = Math.cos(electronRotation) * 50;
  electronMesh.position.z = Math.cos(electronRotation) * 50;
}

function returnToTable() {
	goingBack = true;
	document.getElementById("backBtn").classList.replace("visible", "hidden");
	document.getElementById("settingsBtn").classList.replace("visible", "hidden");
	document.getElementById("infoBtn").classList.replace("visible", "hidden");
}
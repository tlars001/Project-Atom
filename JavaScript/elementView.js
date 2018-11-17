var electronMesh, elementGenerated = false;
var goingBack = false;
var elementItemsGroup = new THREE.Group();
var electronRotations, electronSpeed, selectedElement, electronDistance;
var electronAngle, world, protons, neutrons, pullCount;

function elementInit() {
	var numProtons = +data[selectedElement].number;
	var numElectrons = +numProtons;
	electronRotations = [];
	electronDistance = [];
	electronSpeed = [];
	electronAngle = [];
	for (var i = 0; i < numElectrons; i++) {
		electronRotations.push(getRandomNumber(0,200));
		electronDistance.push(getRandomNumber(50,100));
		electronSpeed.push(getRandomNumber(-50,50));
		electronAngle.push(getRandomNumber(-100,100) / 100);
	}

	var numNeutrons = calculateNeutrons(numProtons, data[selectedElement].mass);
	pullCount = 0;
	//console.log(data[selectedElement].name);
	//console.log("Protons: " + numProtons);
	//console.log("Electrons: " + numElectrons);
	//console.log("Neutrons: " + numNeutrons);

	document.getElementById("backBtn").classList.replace("hidden", "visible");
	document.getElementById("settingsBtn").classList.replace("hidden", "visible");
	document.getElementById("infoBtn").classList.replace("hidden", "visible");
	
	//addLights(0,0,0);

	world = new CANNON.World();
	world.gravity.set(0, 0, 0);
	world.solver.iterations = 10;
	world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 4;

	createAtom(numProtons, numNeutrons, numElectrons);
}

function calculateNeutrons(number, mass) {
	if (mass.includes("(")) {
		mass = mass.replace('(', '');
		mass = mass.replace(')', '');
	}

	var temp = Math.round(+mass);

	return +(temp - number);
}

function createAtom(numProtons, numNeutrons, numElectrons) {

	protons = Array(numProtons).fill(0).map( () => Proton() );
	neutrons = Array(numNeutrons).fill(0).map( () => Neutron() );

	protons.forEach(addToWorld);
	neutrons.forEach(addToWorld);
	createElectrons(numElectrons);

	elementItemsGroup.name = "elementItemsGroup";
	scene.add(elementItemsGroup);
	elementGenerated = true;
}

function Proton(){
	let radius = 5;

	return {
		// Cannon
		body: new CANNON.Body({
			mass: 1, // kg
			position: randomPosition(6),
			shape: new CANNON.Sphere(radius)
		}),
		// THREE
		mesh: new THREE.Mesh(
			new THREE.SphereGeometry( radius, 32, 32 ),
			new THREE.MeshPhongMaterial( { color: 0xdd5555, specular: 0x999999, shininess: 13} )
		)
	}
}

function Neutron(){
	let radius = 5;

	return {
		// Cannon
		body: new CANNON.Body({
			mass: 1, // kg
			position: randomPosition(6),
			shape: new CANNON.Sphere(radius)
		}),
		// THREE
		mesh: new THREE.Mesh(
			new THREE.SphereGeometry( radius, 32, 32 ),
			new THREE.MeshPhongMaterial( { color: 0x55dddd, specular: 0x999999, shininess: 13} )
		)
	}
}

function randomPosition(outerRadius){
	let x = (2 * Math.random() - 1 ) * outerRadius,
		y = (2 * Math.random() - 1 ) * outerRadius,
		z = (2 * Math.random() - 1 ) * outerRadius
	return new CANNON.Vec3(x, y, z);
}

function createElectrons(numElectrons) {

	for (var i = 0; i < numElectrons; i++) {
		var electronGeometry = new THREE.SphereGeometry(1, 10, 9);
		var electronMaterial = new THREE.MeshBasicMaterial({color: "yellow"});
		electronMesh = new THREE.Mesh( electronGeometry, electronMaterial );
	  electronMesh.position.set(0,10,-20);
	  addGlow(electronMesh);
	  //addElectronLight(electronMesh);
	  elementItemsGroup.add(electronMesh);
	}
}

/*******************************************************************************
 *  Function: addGlow()
 *  Description: This creates a glow effect that is added to the desired object.
*******************************************************************************/
function addGlow(theMesh) {
  var spriteMaterial = new THREE.SpriteMaterial(
  {
    map: textureLoader.load( 'Resources/glow.png' ),
    color: "yellow", transparent: true, blending: THREE.AdditiveBlending });
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(7, 7, 1.0);
  theMesh.add(sprite); // this centers the glow at the mesh
}

function addElectronLight(theMesh) {
  var light = new THREE.PointLight(0xffffff, 0.1);
  theMesh.add(light);
}

function rotateElectron() {
  var numElectrons = elementItemsGroup.children.length;

  for (var i = 0; i < numElectrons; i++) {
  	if (electronSpeed[i] < 10 && electronSpeed[i] > -10) {
  		electronSpeed[i] *= 2;
  	}
  	electronRotations[i] += (electronSpeed[i] * 0.001);
  	electronMesh = elementItemsGroup.children[i];
  	electronMesh.position.x = Math.sin(electronRotations[i]) * electronDistance[i];

  	// Make the electrons orbit completely around the atom
  	if (i < numElectrons / 2) {
  		electronMesh.position.y = Math.cos(electronRotations[i]) * electronAngle[i] * electronDistance[i];
  		electronMesh.position.z = Math.cos(electronRotations[i]) * electronDistance[i];
  	}
  	else {
	  	electronMesh.position.y = Math.cos(electronRotations[i]) * electronDistance[i];
	  	electronMesh.position.z = Math.cos(electronRotations[i]) * electronAngle[i] * electronDistance[i];
  	}
  }
}

function getRandomNumber(min, max) {
	if (min <= 0 && max >= 0) {
		var temp = (Math.floor(Math.random() * (max-min+1)) + min);
		if (temp === 0) {
			return 20;
		}
		else {
			return temp;
		}
	}
	else {
		return (Math.floor(Math.random() * (max-min+1)) + min);
	}
}

function getRandomSpeed(min, max) {
	return (Math.floor(Math.random() * (max-min+1)) + min);
}

function addToWorld(object){
	world.add(object.body);
	scene.add(object.mesh);
}

function removeFromWorld(object){
	world.remove(object.body);
	scene.remove(object.mesh);
}

function updateMeshState(object){
	object.mesh.position.copy(object.body.position);
	object.mesh.quaternion.copy(object.body.quaternion);
}

function pullOrigin(object){
	object.body.force.set(
		-object.body.position.x,
		-object.body.position.y,
		-object.body.position.z
	);
}

function pushOrigin(object){
	object.body.force.set(
		object.body.position.x,
		object.body.position.y,
		object.body.position.z
	);
}

function resistance(object, val) {
	if(object.body.velocity.length() > 0)
		object.body.velocity.scale(val, object.body.velocity);
}

function updatePhysics() {

	if (pullCount < 200) {
		protons.forEach(pullOrigin);
		neutrons.forEach(pullOrigin);
	}

	else if (pullCount >= 200) {
		protons.forEach(pushOrigin);
		neutrons.forEach(pushOrigin);
	}

	if (pullCount > 230) {
		pullCount = 150;
	}

	pullCount++;

	neutrons.forEach((neutron) => resistance(neutron, 0.95));
	protons.forEach((proton) => resistance(proton, 0.95));

	world.step(1/45);

	protons.forEach(updateMeshState);
	neutrons.forEach(updateMeshState);

}

function returnToTable() {
	goingBack = true;
	document.getElementById("backBtn").classList.replace("visible", "hidden");
	document.getElementById("settingsBtn").classList.replace("visible", "hidden");
	document.getElementById("infoBtn").classList.replace("visible", "hidden");
}
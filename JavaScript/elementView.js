/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This file will contain all of the code related to the element view of the
 *  project.
*******************************************************************************/

// Global variables needed for element view
var electronMesh, elementGenerated = false, waitTime;
var goingBack = false, realisticMovement = false;
var elementItemsGroup = new THREE.Group();
var electronRotations, electronSpeed, selectedElement, electronDistance;
var electronAngle, world, protons, neutrons, pullCount, pauseMovement = false;
var geometryPN, protonMaterial, neutronMaterial, electronGeometry, electronMaterial;

/*******************************************************************************
 *  Function: elementInit()
 *  Description: This initializes element view when the user has selected an
 *               element in table view.
*******************************************************************************/
function elementInit() {
	var numProtons = +data[selectedElement].number;
	var numElectrons = +numProtons;
	electronRotations = [];
	electronDistance = [];
	electronSpeed = [];
	electronAngle = [];
	waitTime = 3500;

	// Adjust the loading time depending on the size of the atom
	if (numProtons === 0) {
		waitTime = 1000
	}
	else if (numProtons === 1) {
		waitTime = 500;
	}
	else if (numProtons < 5 && numProtons > 1) {
		waitTime = 2000;
	}
	else if (numProtons < 45 && numProtons >= 5) {
		waitTime = 2700;
	}
	else if (numProtons > 45 && numProtons < 80) {
		waitTime = 3000;
	}

	resetSettings();

	// Initialize physics
	world = new CANNON.World();
	world.gravity.set(0, 0, 0);
	world.solver.iterations = 10;
	world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 4;

  // Create the geometries and materials
  geometryPN = new THREE.SphereGeometry( 5, 18, 18 );
  protonMaterial = new THREE.MeshPhongMaterial( { color: 0xdd5555, specular: 0x999999, shininess: 13} );
  neutronMaterial = new THREE.MeshPhongMaterial( { color: 0x55dddd, specular: 0x999999, shininess: 13} );
  electronGeometry = new THREE.SphereGeometry(1, 10, 10);
  electronMaterial = new THREE.MeshBasicMaterial({color: "yellow"});

  // Update items in the info window
  document.getElementById("theName").innerHTML = data[selectedElement].name;
	document.getElementById("elementName").innerHTML = data[selectedElement].name;
	document.getElementById("elementName").style.color = data[selectedElement].theColor;
	document.getElementById("theSymbol").innerHTML = data[selectedElement].symbol;
	document.getElementById("theNumber").innerHTML = data[selectedElement].number;
	document.getElementById("theMass").innerHTML = data[selectedElement].mass;
	document.getElementById("theDescription").innerHTML = data[selectedElement].info;

  var numNeutrons = calculateNeutrons(numProtons, data[selectedElement].mass);
	pullCount = 0;

	// Make adjustments if the user slects Proton, Neutron, or Electron in table view
	if (data[selectedElement].name === "Proton") {
		numProtons = 5;
		numNeutrons = 0;
		numElectrons = 0;
		document.getElementById("theNumber").innerHTML = "-";
		document.getElementById("theMass").innerHTML = "1.673 × 10<sup>-27</sup> kg";
	}
	else if (data[selectedElement].name === "Neutron") {
		numProtons = 0;
		numNeutrons = 5;
		numElectrons = 0;
		document.getElementById("theNumber").innerHTML = "-";
		document.getElementById("theMass").innerHTML = "1.675 × 10<sup>-27</sup> kg";
	}
	else if (data[selectedElement].name === "Electron") {
		numProtons = 0;
		numNeutrons = 0;
		numElectrons = 5;
		document.getElementById("theNumber").innerHTML = "-";
		document.getElementById("theMass").innerHTML = "9.109 × 10<sup>-31</sup> kg";
	}

	// Randomize electron movement
	for (var i = 0; i < numElectrons; i++) {
		electronRotations.push(getRandomNumber(0,200));
		electronDistance.push(getRandomNumber(50,100));
		electronSpeed.push(getRandomNumber(-50,50));
		electronAngle.push(getRandomNumber(-100,100) / 100);
	}

	createAtom(numProtons, numNeutrons, numElectrons);

	// Make the scene visible
	setTimeout(function() {
		document.getElementById("curtain").classList.replace("curtainVisible", "curtainHidden");
	}, waitTime);
}

/*******************************************************************************
 *  Function: displayUI()
 *  Description: This simply makes the UI visible when element view is
 *               initialized.
*******************************************************************************/
function displayUI() {
	document.getElementById("backBtn").classList.replace("hidden", "visible");
	document.getElementById("settingsBtn").classList.replace("hidden", "visible");
	document.getElementById("infoBtn").classList.replace("hidden", "visible");
	document.getElementById("elementName").classList.replace("hidden", "visible");
	document.getElementById("backBtn").disabled = false;
	document.getElementById("settingsBtn").disabled = false;
	document.getElementById("infoBtn").disabled = false;
}

/*******************************************************************************
 *  Function: calculateNeutrons()
 *  Description: This calculates the number of neutrons to create based on the
 *               element number and mass.
*******************************************************************************/
function calculateNeutrons(number, mass) {
	if (mass.includes("(")) {
		mass = mass.replace('(', '');
		mass = mass.replace(')', '');
	}

	var temp = Math.round(+mass);

	return +(temp - number);
}

/*******************************************************************************
 *  Function: createAtom()
 *  Description: This creates an atom with the given number of protons, neutrons,
 *	             and electrons.
*******************************************************************************/
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

/*******************************************************************************
 *  Function: Proton()
 *  Description: This generates each proton as well as the physics for it. See
 *               Credits.txt
*******************************************************************************/
function Proton() {
	let radius = 5;

	return {
		// Cannon
		body: new CANNON.Body({
			mass: 1,
			position: randomPosition(6),
			shape: new CANNON.Sphere(radius)
		}),
		// THREE
		mesh: new THREE.Mesh(
			geometryPN,
			protonMaterial
		)
	}
}

/*******************************************************************************
 *  Function: Neutron()
 *  Description: This generates each neutron as well as the physics for it. See
 *               Credits.txt
*******************************************************************************/
function Neutron() {
	let radius = 5;

	return {
		// Cannon
		body: new CANNON.Body({
			mass: 1, 
			position: randomPosition(6),
			shape: new CANNON.Sphere(radius)
		}),
		// THREE
		mesh: new THREE.Mesh(
			geometryPN,
			neutronMaterial
		)
	}
}

/*******************************************************************************
 *  Function: randomPosition()
 *  Description: This places the protons and neutrons in random positions when
 *               created. See Credits.txt
*******************************************************************************/
function randomPosition(outerRadius) {
	var x = (2 * Math.random() - 1 ) * outerRadius,
		y = (2 * Math.random() - 1 ) * outerRadius,
		z = (2 * Math.random() - 1 ) * outerRadius
	return new CANNON.Vec3(x, y, z);
}

/*******************************************************************************
 *  Function: createElectrons()
 *  Description: This will create the provided number of electrons.
*******************************************************************************/
function createElectrons(numElectrons) {
	for (var i = 0; i < numElectrons; i++) {
		electronMesh = new THREE.Mesh( electronGeometry, electronMaterial );
	  electronMesh.position.set(0,10,-20);
	  addGlow(electronMesh);
	  
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
    map: electronTexture,
    color: "yellow", transparent: true, blending: THREE.AdditiveBlending });
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(7, 7, 1.0);
  theMesh.add(sprite); // this centers the glow at the mesh
}

/*******************************************************************************
 *  Function: rotateElectron()
 *  Description: This will make the electrons orbit around the protons and
 *               neutrons using fancy math.
*******************************************************************************/
function rotateElectron() {
  var numElectrons = elementItemsGroup.children.length;
  var theSpeed = 0.001;

  if (realisticMovement) {
  	theSpeed = 0.1;
  }

  for (var i = 0; i < numElectrons; i++) {
  	if (electronSpeed[i] < 10 && electronSpeed[i] > -10) {
  		electronSpeed[i] *= 2;
  	}
  	electronRotations[i] += (electronSpeed[i] * theSpeed);
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

/*******************************************************************************
 *  Function: getRandomNumber()
 *  Description: This simply returns a random integer used to calculate a random
 *               speed for electrons.
*******************************************************************************/
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

/*******************************************************************************
 *  Function: getRandomSpeed()
 *  Description: Returns a random number between the min and the max provided.
*******************************************************************************/
function getRandomSpeed(min, max) {
	return (Math.floor(Math.random() * (max-min+1)) + min);
}

/*******************************************************************************
 *  Function: addToWorld()
 *  Description: Adds an object and its physics to the scene.
*******************************************************************************/
function addToWorld(object) {
	world.add(object.body);
	scene.add(object.mesh);
}

/*******************************************************************************
 *  Function: removeFromWorld()
 *  Description: Removes an object and its physics from the scene.
*******************************************************************************/
function removeFromWorld(object) {
	world.remove(object.body);
	scene.remove(object.mesh);
}

/*******************************************************************************
 *  Function: updateMeshState()
 *  Description: Makes sure the physics object is at the same position as the
 *               mesh associated with it. See Credits.txt
*******************************************************************************/
function updateMeshState(object) {
	object.mesh.position.copy(object.body.position);
	object.mesh.quaternion.copy(object.body.quaternion);
}

/*******************************************************************************
 *  Function: pullOrigin()
 *  Description: This function creates gravity for all objects with physics and
 *               pulls them towards the origin.
*******************************************************************************/
function pullOrigin(object) {
	object.body.force.set(
		-object.body.position.x,
		-object.body.position.y,
		-object.body.position.z
	);
}

/*******************************************************************************
 *  Function: pushOrigin()
 *  Description: Just like pullOrigin(), except this pushes the objects away
 *               from the origin.
*******************************************************************************/
function pushOrigin(object) {
	object.body.force.set(
		object.body.position.x,
		object.body.position.y,
		object.body.position.z
	);
}

/*******************************************************************************
 *  Function: resistance()
 *  Description: This adds resistance to objects with physics. See Credits.txt
*******************************************************************************/
function resistance(object, val) {
	if(object.body.velocity.length() > 0)
		object.body.velocity.scale(val, object.body.velocity);
}

/*******************************************************************************
 *  Function: updatePhysics()
 *  Description: This function creates the pulse with protons and neutrons. It
 *               makes them constantly push and pull from the origin.
*******************************************************************************/
function updatePhysics() {
	if (pullCount < 200) {
		protons.forEach(pullOrigin);
		neutrons.forEach(pullOrigin);
	}

	else if (pullCount >= 200) {
		protons.forEach(pushOrigin);
		neutrons.forEach(pushOrigin);
	}

	if (pullCount > 225) {
		pullCount = 150;
	}

	pullCount++;

	neutrons.forEach((neutron) => resistance(neutron, 0.95));
	protons.forEach((proton) => resistance(proton, 0.95));

	world.step(1/45);

	protons.forEach(updateMeshState);
	neutrons.forEach(updateMeshState);
}

/*******************************************************************************
 *  Function: returnToTable()
 *  Description: This returns the program to table view when the user presses
 *               the back button.
*******************************************************************************/
function returnToTable() {
	var isDisabled = document.getElementById("backBtn").disabled;
	if (!isDisabled) {
		goingBack = true;

		if (!document.getElementById("infoBtn").disabled) {
			document.getElementById("infoWindow").classList.replace("visible", "hidden");
		}

		if (!document.getElementById("settingsBtn").disabled) {
				document.getElementById("settingsWindow").classList.replace("visible", "hidden");
		}
		
		document.getElementById("backBtn").classList.replace("visible", "hidden");
		document.getElementById("backBtn").disabled = true;
		document.getElementById("settingsBtn").classList.replace("visible", "hidden");
		document.getElementById("settingsBtn").disabled = true;
		document.getElementById("infoBtn").classList.replace("visible", "hidden");
		document.getElementById("infoBtn").disabled = true;
		document.getElementById("elementName").classList.replace("visible", "hidden");
		document.getElementById("curtain").classList.replace("curtainHidden", "curtainVisible");

		setTimeout(function() {
			elementView = false;
			isCenter = false;
	    isTable = true;
	    isMoving = true;
	    camera.lookAt(new THREE.Vector3(0,0,-1000));
	   	scene.add(elementGroup);
	   	scene.add(keyGroup);
	   	isSelected = false;
	   	showUI = false;
	    setTableMovement();
	    document.getElementById("curtain").classList.replace("curtainVisible", "curtainHidden");
		}, 1500)


	}
}

/*******************************************************************************
 *  Function: showSettings()
 *  Description: This shows the settings when the user presses the settings icon.
*******************************************************************************/
function showSettings() {
	var isDisabled = document.getElementById("settingsBtn").disabled;
	if (!isDisabled) {
		if (document.getElementById("settingsWindow").classList.contains("hidden")) {
			// Close the info menu if it's open
			if (!document.getElementById("infoBtn").disabled) {
				document.getElementById("infoWindow").classList.replace("visible", "hidden");
			}
			document.getElementById("settingsWindow").classList.replace("hidden", "visible");
		}
		else {
			document.getElementById("settingsWindow").classList.replace("visible", "hidden");
		}
	}
}

/*******************************************************************************
 *  Function: showInfo()
 *  Description: This displays the info window then the user presses the info
 *               button.
*******************************************************************************/
function showInfo() {
	var isDisabled = document.getElementById("infoBtn").disabled;
	if (!isDisabled) {
		if (document.getElementById("infoWindow").classList.contains("hidden")) {
			// Close the settings if it's open
			if (!document.getElementById("settingsBtn").disabled) {
				document.getElementById("settingsWindow").classList.replace("visible", "hidden");
			}
			document.getElementById("infoWindow").classList.replace("hidden", "visible");
		}
		else {
			document.getElementById("infoWindow").classList.replace("visible", "hidden");
		}
	}
}

/*******************************************************************************
 *  Function: changeProtons()
 *  Description: This makes the protons appear/disappear when the user presses
 *               the checkbox in settings.
*******************************************************************************/
function changeProtons() {
	if (document.getElementsByName("protons")[0].checked) {
		protons.forEach(function(object) {
			scene.add(object.mesh);
		});
	}
	else {
		protons.forEach(function(object) {
			scene.remove(object.mesh);
		});
	}
}

/*******************************************************************************
 *  Function: changeNeutrons()
 *  Description: This makes the neutrons appear/disappear when the user presses
 *               the checkbox in settings.
*******************************************************************************/
function changeNeutrons() {
	if (document.getElementsByName("neutrons")[0].checked) {
		neutrons.forEach(function(object) {
			scene.add(object.mesh);
		});
	}
	else {
		neutrons.forEach(function(object) {
			scene.remove(object.mesh);
		});
	}
}

/*******************************************************************************
 *  Function: changeElectrons()
 *  Description: This makes the electrons appear/disappear when the user presses
 *               the checkbox in settings.
*******************************************************************************/
function changeElectrons() {
	if (document.getElementsByName("electrons")[0].checked) {
		scene.add(elementItemsGroup);
	}
	else {
		scene.remove(elementItemsGroup);
	}
}

/*******************************************************************************
 *  Function: changeMovement()
 *  Description: This pauses/unpauses the atom movement when the user presses
 *               the checkbox in settings.
*******************************************************************************/
function changeMovement() {
	if (document.getElementsByName("pause")[0].checked) {
		pauseMovement = true;
	}
	else {
		pauseMovement = false;
	}
}

/*******************************************************************************
 *  Function: changeRealism()
 *  Description: This changes the electron movement speed when the user presses
 *               the checkbox in settings.
*******************************************************************************/
function changeRealism() {
	if (document.getElementsByName("realistic")[0].checked) {
		realisticMovement = true;
	}
	else {
		realisticMovement = false;
	}
}

/*******************************************************************************
 *  Function: resetSettings()
 *  Description: This resets all of the settings back to their default when the
 *               user moves back to table view.
*******************************************************************************/
function resetSettings() {
	document.getElementsByName("protons")[0].checked = true;
	document.getElementsByName("neutrons")[0].checked = true;
	document.getElementsByName("electrons")[0].checked = true;
	document.getElementsByName("pause")[0].checked = false;
	document.getElementsByName("realistic")[0].checked = false;

	realisticMovement = false;
	pauseMovement = false;
}
/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This file will contain all of the code related to creating and using the
 *	periodic table of elements.
*******************************************************************************/

// Global variables needed for table view.
var changeGlow = true;
var selectedObject = [], keyGeometry, keyGroup = new THREE.Group();
var elements = [], elementGroup = new THREE.Group();
var outlineMesh, isSelected  = false;
var clickTimer = null, prevTapX = 0, prevTapY = 0;
var elementGeometry, textBackMaterial, eTextMaterial, eTitleMaterial;
var elementPartGeometry;

/*******************************************************************************
 *  Function: generateTable()
 *  Description: This will create the periodic table of elements when the user
 *  		         starts the program.
*******************************************************************************/
function generateTable() {
	var xIndex = -240;
	var yIndex = 120;

	// Create the geometries and materials before the loop
	elementGeometry = new THREE.BoxGeometry( 25, 25, 5 );
	elementPartGeometry = new THREE.BoxGeometry(50, 25, 5);
	keyGeometry = new THREE.BoxGeometry(10, 10, 5);
	textBackMaterial = new THREE.MeshBasicMaterial( { color: 0x228B22, overdraw: 0.5 } );
	eTitleMaterial = new THREE.MeshBasicMaterial( { color: 0xa9a9a9, overdraw: 0.5 } );
	eTextMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } );

	// Generate the table
	for (var key in data) {
		// Protons, neutrons, and electrons are a special case
		if (data[key].name === "Proton")
			break;

    if (data.hasOwnProperty(key)) {
      elements.push(createElement(data[key].number, data[key].symbol, data[key].name, data[key].mass, data[key].theColor, xIndex, yIndex));

      // Create the table structure
      if (data[key].symbol === "H") {
      	xIndex = 270;
      }
      else if (data[key].symbol === "Be") {
      	xIndex = 120;
      }
      else if (data[key].symbol === "Mg") {
      	xIndex = 120;
      }
      else if (data[key].symbol === "La") {
      	xIndex = -180;
      	yIndex = -105; 
      }
      else if (data[key].symbol === "Lu") {
      	xIndex = -150;
      	yIndex = -30;
      }
      else if (data[key].symbol === "Ac") {
      	xIndex = -180;
      	yIndex = -135;
      }
      else if (data[key].symbol === "Lr") {
      	xIndex = -150;
      	yIndex = -60;
      }
      else {
      	xIndex += 30;
      }

      if (xIndex > 270) {
      	xIndex = -240;
      	yIndex -= 30;
      }
    }
	}

	// Create selection boxes for protons, neutrons, and electrons
	elements.push(createElementPart("Proton", 0xdd5555, -100, -180));
	elements.push(createElementPart("Neutron", 0x55dddd, 0, -180));
	elements.push(createElementPart("Electron", "yellow", 100, -180));

	var theText = "Select An Element";
	if (isMobile) {
		theText = "Double Tap An Element"
	}

	// Add the heading to the table
	addText(theText, 20, 0, 150, -1000, false, true);

	createKey();

	scene.add(elementGroup);
	scene.add(keyGroup);
}

/*******************************************************************************
 *  Function: createKey()
 *  Description: This will generate the color key at the top of the periodic
 *               table.
*******************************************************************************/
function createKey() {
	// Horizontal line
	var geometry = new THREE.BoxGeometry(285, 0.2, 0.2);
  var mesh = new THREE.Mesh(geometry, eTitleMaterial );
 
 	mesh.position.x = -45;
	mesh.position.y = 105;
	mesh.position.z = -1000;

  keyGroup.add(mesh);

  // Vertical line
  geometry = new THREE.BoxGeometry(0.2, 70, 0.2);
  mesh = new THREE.Mesh(geometry, eTitleMaterial );
 
 	mesh.position.x = 4;
	mesh.position.y = 83;
	mesh.position.z = -1000;

  keyGroup.add(mesh);

	// Metals
	addText("Metals", 7, -100, 110, -1000, false, true);
	createKeySquare("goldenrod", -180, 95);
	addText("Alkali metals", 6, -146, 92, -1000, false, true);
	createKeySquare("dodgerblue", -180, 75);
	addText("Alkaline earth metals", 6, -131, 72, -1000, false, true);
	createKeySquare("indianred", -180, 55);
	addText("Lanthanoids", 6, -147, 52, -1000, false, true);
	createKeySquare("magenta", -80, 95);
	addText("Actinoids", 6, -52, 92, -1000, false, true);
	createKeySquare("red", -80, 75);
	addText("Transition metals", 6, -38, 72, -1000, false, true);
	createKeySquare("cyan", -80, 55);
	addText("Poor metals", 6, -46, 52, -1000, false, true);

	// Nonmetals
	addText("Nonmetals", 7, 50, 110, -1000, false, true);
	createKeySquare("green", 20, 95);
	addText("Other nonmetals", 6, 61, 92, -1000, false, true);
	createKeySquare("purple", 20, 75);
	addText("Noble gasses", 6, 57, 72, -1000, false, true);
}

/*******************************************************************************
 *  Function: createKeySquare()
 *  Description: This will generate each color square used in the key.
*******************************************************************************/
function createKeySquare(theColor, xPos, yPos) {
	var material = new THREE.MeshPhongMaterial({ color: theColor});
  var mesh = new THREE.Mesh( keyGeometry, material );
 
 	mesh.position.x = xPos;
	mesh.position.y = yPos;
	mesh.position.z = -1000;

  keyGroup.add(mesh);

  return mesh;
}

/*******************************************************************************
 *  Function: createElement()
 *  Description: This creates an individual element tile on the periodic table.
*******************************************************************************/
function createElement(number, symbol, name, mass, theColor, xPos, yPos) {
  var material = new THREE.MeshPhongMaterial({ color: theColor});
  material.name = symbol;
  var mesh = new THREE.Mesh( elementGeometry, material );
 
 	mesh.position.x = xPos;
	mesh.position.y = yPos;
	mesh.position.z = -1000;

 	addText(number, 3, mesh.position.x-12, mesh.position.y+8, -998, true);
  addText(symbol, 7, mesh.position.x, mesh.position.y-1, -998,);
  addText(name, 2.7, mesh.position.x, mesh.position.y-6, -998);
  addText(mass, 3, mesh.position.x, mesh.position.y-11, -998);
  elementGroup.add(mesh);

  return mesh;
}

/*******************************************************************************
 *  Function: createElementPart()
 *  Description: This function is similar to createElement, but handles the
 *               special case of the proton, neutron, and electron tiles at the
 *               bottom of the table.
*******************************************************************************/
function createElementPart(name, theColor, xPos, yPos) {
  var material = new THREE.MeshPhongMaterial({ color: theColor});
  material.name = name;
  var mesh = new THREE.Mesh( elementPartGeometry, material );
 
 	mesh.position.x = xPos;
	mesh.position.y = yPos;
	mesh.position.z = -1000;

  addText(name, 8, mesh.position.x, mesh.position.y-3, -998);
  elementGroup.add(mesh);

  return mesh;
}

/*******************************************************************************
 *  Function: addText()
 *  Description: This adds text to each element tile on the periodic table.
*******************************************************************************/
function addText(name, theSize, xPos, yPos, zPos, isNum=false, isTitle=false) {
	var geometry = new THREE.TextBufferGeometry( name, {
		font: theFont,
		size: theSize,
		height: 1,
		curveSegments: 2
	});
	geometry.computeBoundingBox();
	var centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
	var materials;

	if (isTitle) {
		materials = [
			eTitleMaterial,
			textBackMaterial
		];
	}
	else {
		materials = [
			eTextMaterial,
			textBackMaterial
		];
	}
	mesh = new THREE.Mesh( geometry, materials );
	if (isNum){
		mesh.position.x = xPos;
	}
	else {
		mesh.position.x = centerOffset + xPos;
	}
	mesh.position.y = yPos;
	mesh.position.z = zPos;
	mesh.rotation.x = 0;
	mesh.rotation.y = Math.PI * 2;
	elementGroup.add(mesh);
}

/*******************************************************************************
 *  Function: checkIntersection()
 *  Description: If the user is on desktop, this function checks if the mouse
 *               has intersected with a tile. If so, the tile is given an
 *               outline to give the user feedback that it is highlighted.
*******************************************************************************/
function checkIntersection() {
	// find intersections
	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	vector.unproject(camera);
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( elements );

	// INTERSECTED = the object in the scene currently closest to the camera 
	//		and intersected by the Ray projected from the mouse position 	

	// if there is one (or more) intersections
	if ( intersects.length > 0 && !isSelected) {
		INTERSECTED = intersects[ 0 ].object;

		if (changeGlow) {
			changeGlow = false;
			outlineMesh = addOutline(INTERSECTED);
		}

		if (INTERSECTED.position != outlineMesh.position) {
			scene.remove(outlineMesh);
			outlineMesh = addOutline(INTERSECTED);
		}
	} 
	else // there are no intersections
	{
		// restore previous intersection object (if it exists) to its original color
		if ( INTERSECTED ) {
			// When mousing off the object
			scene.remove(outlineMesh);
			changeGlow = true;
		}
			
		INTERSECTED = null;
	}
}

/*******************************************************************************
 *  Function: addOutline()
 *  Description: This function adds the outline to the current intersected tile.
*******************************************************************************/
function addOutline (object) {
	var elementGeometry = new THREE.BoxGeometry(object.geometry.parameters.width, object.geometry.parameters.height, object.geometry.parameters.depth);
	var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide, 
			transparent: true, opacity: 0.9 } );
	var outlineMesh1 = new THREE.Mesh( elementGeometry, outlineMaterial1 );
	outlineMesh1.position.x = (object.position.x);
	outlineMesh1.position.y = (object.position.y);
	outlineMesh1.position.z = (object.position.z);
	outlineMesh1.scale.multiplyScalar(1.1);
	scene.add( outlineMesh1 );
	return outlineMesh1;
}

/*******************************************************************************
 *  Function: onDocumentTouchStart()
 *  Description: If the device running the application is mobile, this will
 *               distinguish double taps from single taps and panning so elements
 *               are not accidentally selected while panning or zooming.
*******************************************************************************/
function onDocumentTouchStart(event) {
	if (event.touches.length === 1) {
	  event.clientX = event.touches[0].pageX;
	  event.clientY = event.touches[0].pageY;

	  if (clickTimer == null) {
	  	prevTapX = event.clientX;
	    prevTapY = event.clientY;

	    clickTimer = setTimeout(function () {
	      clickTimer = null;
	  	}, 200)
	  } 
	  else {
	    clearTimeout(clickTimer);
	    clickTimer = null;
	    var diffX = Math.abs(event.clientX - prevTapX);
	    var diffY = Math.abs(event.clientY - prevTapY);
	    if (diffX < 15 && diffY < 15 && isTable) {
	    	selectElement(event);
	  	}
	  }	
	}
}

/*******************************************************************************
 *  Function: onDocumentMouseDown()
 *  Description: Simply calls selectElement() if the user is on a desktop.
*******************************************************************************/
function onDocumentMouseDown(event) {		
	if (!isMobile && isTable) {
		selectElement(event);
	}
}

/*******************************************************************************
 *  Function: selectElement()
 *  Description: This function determines if a users click or double tap is on
 *               one of the element tiles. If so, the program transitions to
 *               element view.
*******************************************************************************/
function selectElement(event) {
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	// find intersections

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	vector.unproject(camera);
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersect = raycaster.intersectObjects(elements);

	// if there is one (or more) intersections
	if ( intersect.length > 0 && !isSelected ) {
		isTable = false;

		INTERSECTED = intersect[ 0 ].object;
		var theColor = INTERSECTED.material.color;
		selectedElement = INTERSECTED.material.name;
		// change the color of the closest face.
		INTERSECTED.material.color.setRGB( 0, 0, 1); 
		document.getElementById("curtain").classList.replace("curtainHidden", "curtainVisible");
		setTimeout(function() {
			isSelected = true;
			elementView = true;
			elementInit();
			setOrbitControls();
			scene.remove(outlineMesh);
    	scene.remove(elementGroup);
    	scene.remove(keyGroup);
		}, 1000)

		resetColor(INTERSECTED);
	}
}

/*******************************************************************************
 *  Function: resetColor()
 *  Description: This resets the selected tile color after the user selects an
 *               element.
*******************************************************************************/
function resetColor(object) {
	setTimeout(function() {
		var theColor = data[object.material.name].theColor;
		object.material.color.set(theColor);
  }, 1000);
}
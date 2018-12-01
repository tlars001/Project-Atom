/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This file will contain all of the code related to creating and using the
 *	periodic table of elements.
*******************************************************************************/

var changeGlow = true;
var selectedObject = [];
var elements = [], elementGroup = new THREE.Group();
var outlineMesh, isSelected  = false;
var clickTimer = null, prevTapX = 0, prevTapY = 0;
var elementGeometry, textBackMaterial, eTextMaterial, eTitleMaterial;

function generateTable() {
	var xIndex = -240;
	var yIndex = 120;

	elementGeometry = new THREE.BoxGeometry( 25, 25, 5 );
	textBackMaterial = new THREE.MeshBasicMaterial( { color: 0x228B22, overdraw: 0.5 } );
	eTitleMaterial = new THREE.MeshBasicMaterial( { color: 0xa9a9a9, overdraw: 0.5 } );
	eTextMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } );

	for (var key in data) {
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
	var theText = "Select An Element";
	if (isMobile) {
		theText = "Double Tap An Element"
	}

	addText(theText, 20, 0, 150, -1000, false, true);
	scene.add(elementGroup);
}


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
  //scene.add(mesh);
  return mesh;
}

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

function checkIntersection() {
	// find intersections
	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	//projector.unprojectVector( vector, camera );
	vector.unproject(camera);
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( elements );

	// INTERSECTED = the object in the scene currently closest to the camera 
	//		and intersected by the Ray projected from the mouse position 	

	// if there is one (or more) intersections
	if ( intersects.length > 0 && !isSelected)
	{
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

function addOutline (object) {
	var elementGeometry = new THREE.BoxGeometry( 25, 25, 5 );
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

function onDocumentMouseDown(event) 
{		
	if (!isMobile && isTable) {
		selectElement(event);
	}
}

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
	if ( intersect.length > 0 && !isSelected )
	{

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
		}, 1000)

		resetColor(INTERSECTED);
	}
}

function resetColor(object) {
	setTimeout(function() {
		var theColor = data[object.material.name].theColor;
		object.material.color.set(theColor);
  }, 1000);
}
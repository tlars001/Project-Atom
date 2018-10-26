/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This file will contain all of the code related to creating and using the
 *	periodic table of elements.
*******************************************************************************/

var changeGlow = true;
var selectedObject = [];
var elements = [];
var outlineMesh;

function generateTable() {
	elements.push(createElement("10", "MG", "Magnesium", "4.994", 0, 0));
  elements.push(createElement("1", "H", "Hydrogen", "4.994", 30, 0));
  elements.push(createElement("13", "Br", "Bromine", "4.994", -30, 0));
}


function createElement(number, symbol, name, mass, xPos, yPos) {
  var geometry = new THREE.BoxGeometry( 25, 25, 5 );
  var material = new THREE.MeshNormalMaterial();
  material.name = symbol;
  var mesh = new THREE.Mesh( geometry, material );
  //scene.add(mesh);
 	mesh.position.x = xPos;
	mesh.position.y = yPos;

 	addText(number, 3, mesh.position.x-12, mesh.position.y+8, 2, true);
  addText(symbol, 7, mesh.position.x, mesh.position.y-1, 2,);
  addText(name, 3, mesh.position.x, mesh.position.y-6, 2);
  addText(mass, 3, mesh.position.x, mesh.position.y-11, 2);
  scene.add(mesh);
  return mesh;
}

function addText(name, theSize, xPos, yPos, zPos, isNum=false) {
	var loader = new THREE.FontLoader();
	loader.load( 'Resources/helvetiker_regular.typeface.json', function ( font ) {
		var geometry = new THREE.TextBufferGeometry( name, {
			font: font,
			size: theSize,
			height: 1,
			curveSegments: 2
		});
		geometry.computeBoundingBox();
		var centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		var materials = [
			new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } ),
			new THREE.MeshBasicMaterial( { color: 0x00f000, overdraw: 0.5 } )
		];
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
		scene.add(mesh);
	});
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
	if ( intersects.length > 0 )
	{
		INTERSECTED = intersects[ 0 ].object;

		if (changeGlow) {
			changeGlow = false;
			outlineMesh = addOutline(INTERSECTED);
			//console.log(INTERSECTED.position);
		}

		if (INTERSECTED.position != outlineMesh.position) {
			scene.remove(outlineMesh);
			outlineMesh = addOutline(INTERSECTED);
		}
		// if the closest object intersected is not the currently stored intersection object
		//if ( intersects[ 0 ].object != INTERSECTED ) 
		//{
	    // restore previous intersection object (if it exists) to its original color
		
		//INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		// store reference to closest object as current intersection object
		// store color of closest object (for later restoration)
		//INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
		// set a new color for closest object
		//INTERSECTED.material.color.setHex( 0xffff00 );
		//}
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
	var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide, 
			transparent: true, opacity: 0.7 } );
	var outlineMesh1 = new THREE.Mesh( elementGeometry, outlineMaterial1 );
	outlineMesh1.position.x = (object.position.x);
	outlineMesh1.position.y = (object.position.y);
	outlineMesh1.position.z = (object.position.z);
	outlineMesh1.scale.multiplyScalar(1.05);
	scene.add( outlineMesh1 );
	return outlineMesh1;
}
/*******************************************************************************
 *  Author: Trevor Larson
 *
 *  Summary:
 *  This file will contain all of the code related to creating and using the
 *	periodic table of elements.
*******************************************************************************/


function generateTable() {
	createElement("10", "MG", "Magnesium", "4.994", 0, 0);
  createElement("1", "H", "Hydrogen", "4.994", 30, 0);
  var temp = createElement("13", "Br", "Bromine", "4.994", -30, 0);

  console.log(temp);
}


function createElement(number, symbol, name, mass, xPos, yPos) {
  var geometry = new THREE.BoxGeometry( 25, 25, 5 );
  var material = new THREE.MeshNormalMaterial();
  var mesh = new THREE.Mesh( geometry, material );
  //scene.add(mesh);
 	mesh.position.x = xPos;
	mesh.position.y = yPos;

	var theGroup = THREE.Group();
	theGroup.add(mesh);

 	theGroup.add(addText(number, 3, mesh.position.x-12, mesh.position.y+8, 2, true));
  theGroup.add(addText(symbol, 7, mesh.position.x, mesh.position.y-1, 2,));
  theGroup.add(addText(name, 3, mesh.position.x, mesh.position.y-6, 2));
  theGroup.add(addText(mass, 3, mesh.position.x, mesh.position.y-11, 2));
  return theGroup;
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
		//scene.add(mesh);
		return mesh;
	});
}

function checkIntersection() {
	// raycaster.setFromCamera(mouse, camera);
	// var intersects = raycaster.intersectObject( mesh );
	// if ( intersects.length > 0 ) {
	// 	var intersect = intersects[ 0 ];
	// 	var face = intersect.face;
	// 	var linePosition = line.geometry.attributes.position;
	// 	var meshPosition = mesh.geometry.attributes.position;
	// 	linePosition.copyAt( 0, meshPosition, face.a );
	// 	linePosition.copyAt( 1, meshPosition, face.b );
	// 	linePosition.copyAt( 2, meshPosition, face.c );
	// 	linePosition.copyAt( 3, meshPosition, face.a );
	// 	mesh.updateMatrix();
	// 	line.geometry.applyMatrix( mesh.matrix );
	// 	line.visible = true;
	// } else {
	// 	line.visible = false;
	// }
}
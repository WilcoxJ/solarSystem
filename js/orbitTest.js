const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new THREE.OrbitControls( camera, renderer.domElement );

const planeMaterial = new THREE.PointsMaterial({ 
    size: .01,
    // color: 0xFF005D //red
    // color: 0xff00dc // purple
    color: 0x5dff00 //green


    });
    planeMaterial.opacity = .75;



//geometry
const geometry = new THREE.PlaneGeometry( 50, 50, 3, 5 );
// const geometry = new THREE.CircleGeometry( 20, 32, 10 );
// const geometry = new THREE.BoxGeometry( 50, 50, 25, 3, 3, 3 );
// const geometry = new THREE.TetrahedronGeometry(20,3);

const plane = new THREE.Points( geometry, planeMaterial)
// const plane = new THREE.MeshBasicMaterial( geometry, planeMaterial)

scene.add( plane );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
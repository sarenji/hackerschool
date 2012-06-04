var $window = $(window);

$window.load(function() {

// set the scene size
var WIDTH = $window.width(),
    HEIGHT = $window.height();

var $container = $('#three');
var texture = THREE.ImageUtils.loadTexture('world.jpg');

var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

var camera = new THREE.PerspectiveCamera(VIEW_ANGLE,
                                ASPECT,
                                NEAR,
                                FAR);
camera.position.set(0, 0, 200);
camera.lookAt(scene.position);
scene.add(camera);

var controls = new THREE.TrackballControls(camera);
controls.keys = [65, 83, 68];

// create a new mesh with sphere geometry -
// we will cover the sphereMaterial next!
var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(50, 50, 50),
    new THREE.MeshLambertMaterial({ map: texture })
    // new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
);

// add the sphere to the scene
scene.add(sphere);

// initialize point lighting
var light = new THREE.PointLight( 0xfff5f2 );
light.position.set(-50, 50, 50);
scene.add( light );

// add subtle ambient lighting
var ambientLight = new THREE.AmbientLight(0xcccccc);
scene.add(ambientLight);

// repeatedly render
function render() {
  var delta = clock.getDelta();

  // rotate the sphere
  sphere.rotation.y += Math.PI * 2 * delta / 30;

  // also rotate the lights
  light.position.set(
    Math.cos(Math.PI * 2 * delta / 60) * 50,
    50,
    Math.sin(Math.PI * delta / 60) * 50
  );

  // update controls
  controls.update(delta);

  // render scene and call this function again on the next available frame
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

});

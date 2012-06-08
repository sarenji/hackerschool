var $window = $(window);

$window.load(function() {

// set the scene size
var WIDTH = $window.width(),
    HEIGHT = $window.height();

var $container = $('#three');
var texture = THREE.ImageUtils.loadTexture('world.jpg');

var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer({antialias: true});
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
controls.keys = [];

// create fresnel shader
var Shaders = {
  'earth' : {
    uniforms: {
      'texture': { type: 't', value: 0, texture: null },
      'rColor': { type: 'f', value: 0.47 },
      'gColor': { type: 'f', value: 0.84 },
      'bColor': { type: 'f', value: 1.0 }
    },
    vertexShader: [
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        'vNormal = normalize( normalMatrix * normal );',
        'vUv = uv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D texture;',
      'uniform float rColor;',
      'uniform float gColor;',
      'uniform float bColor;',
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'vec3 diffuse = texture2D( texture, vUv ).xyz;',
        'float intensity = 1.25 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
        'vec3 atmosphere = vec3( rColor, gColor, bColor ) * pow( intensity, 4.0 );',
        'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
      '}'
    ].join('\n')
  },
  'atmosphere' : {
    uniforms: {
      timer: { type: "f", value: 0.0 }
    },
    vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
        'vNormal = normalize( normalMatrix * normal );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'uniform float timer;',
      'void main() {',
        'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 4.0 );',
        'intensity *= 0.8 + 0.2 * cos( timer );',
        'gl_FragColor = vec4( 0.47, 0.84, 1.0, 1.0 ) * intensity;',
      '}'
    ].join('\n')
  }
};

// Taken from Google DAT.Globe
var shader, uniforms, material, atmosphereUniforms;
var geometry = new THREE.SphereGeometry(50, 50, 50);

shader = Shaders['atmosphere'];
atmosphereUniforms = THREE.UniformsUtils.clone(shader.uniforms);
material = new THREE.ShaderMaterial({
  uniforms: atmosphereUniforms,
  vertexShader: shader.vertexShader,
  fragmentShader: shader.fragmentShader
});

mesh = new THREE.Mesh(geometry, material);
mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
mesh.flipSided = true;
mesh.matrixAutoUpdate = false;
mesh.updateMatrix();
scene.add(mesh);

shader = Shaders['earth'];
uniforms = THREE.UniformsUtils.clone(shader.uniforms);
uniforms['texture'].texture = texture;
material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: shader.vertexShader,
  fragmentShader: shader.fragmentShader
});

// create a new mesh with sphere geometry -
// we will cover the sphereMaterial next!
var sphere = new THREE.Mesh(geometry, material);

// add the sphere to the scene
scene.add(sphere);

// add torus
geometry = new THREE.TorusGeometry(1, .2, 30, 30);
var torus = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
  color: 0x3bf4ff
}));
scene.add(torus);

// connects a torus and a position vector to Hacker School.
function connectToHS(torus, latitude, longitude) {
  var hsLat = 40.702964;
  var hsLong = 73.989481;
  var latitude = 37.7750;
  var longitude = 122.4183;
  var avgLatitude = (latitude + hsLat) / 2;
  var avgLongitude = (longitude + hsLong) / 2;
  var avgPosition = latlongToArray(avgLatitude, avgLongitude);
  var hsPosition = latlongToArray(hsLat, hsLong);
  var targetPosition = latlongToArray(latitude, longitude);
  var numDimensions = hsPosition.length;
  var radius = 0;

  // Calculate and apply the new scale of the torus
  for (var i = 0; i < numDimensions; i++) {
    radius += Math.abs(hsPosition[i] - targetPosition[i]) / numDimensions;
  }

  torus.position.set.apply(torus.position, avgPosition);
  torus.scale.x = torus.scale.y = torus.scale.z = radius;
  torus.lookAt(mesh.position);
}

function latlongToArray(latitude, longitude) {
  var phi = (90 - latitude) * Math.PI / 180;
  var theta = (90 - longitude) * Math.PI / 180;

  return [
    50 * Math.sin(phi) * Math.sin(theta),
    50 * Math.cos(phi),
    50 * Math.sin(phi) * Math.cos(theta)
  ];
}

connectToHS(torus);

// repeatedly render
function render() {
  var delta = clock.getDelta();

  // update timer for shader
  atmosphereUniforms.timer.value += delta;

  // rotate the sphere
  sphere.rotation.y += delta / 30;

  // update controls
  controls.update(delta);

  // render scene and call this function again on the next available frame
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

});

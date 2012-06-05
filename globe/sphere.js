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
controls.keys = [];

// create fresnel shader
var Shaders = {
  'earth' : {
    uniforms: {
      'texture': { type: 't', value: 0, texture: null }
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
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'vec3 diffuse = texture2D( texture, vUv ).xyz;',
        'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
        'vec3 atmosphere = vec3( 0.47, 0.84, 1.0 ) * pow( intensity, 4.0 );',
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
        'intensity = intensity * (0.8 + 0.2 * cos( timer ));',
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
sphere.matrixAutoUpdate = false;

// add the sphere to the scene
scene.add(sphere);

// repeatedly render
function render() {
  var delta = clock.getDelta();

  // update timer for shader
  atmosphereUniforms.timer.value += delta;

  // rotate the sphere
  sphere.rotation.y += Math.PI * 2 * delta / 30;

  // update controls
  controls.update(delta);

  // render scene and call this function again on the next available frame
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

});

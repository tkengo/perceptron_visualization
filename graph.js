var camera ,controls ,scene ,renderer;
var SIZE = 1;

window.onload = function() {
  initializeObjects();
  var axes = buildAxes();

  var data = generateData();

  var trueGeos = new THREE.Geometry();
  for (var i = 0; i < data[0].length; i++) {
    var data1 = data[0][i];
    var v = new THREE.Vector3(data1[0], data1[1], data1[2]);
    // trueGeos.vertices.push(v);
  }
  var falseGeos = new THREE.Geometry();
  for (var i = 0; i < data[1].length; i++) {
    var data2 = data[1][i];
    var v = new THREE.Vector3(data2[0], data2[1], data2[2]);
    // falseGeos.vertices.push(v);
  }
  var texture = new THREE.Texture(createCircleCanvas('#e38692', '#d04255'));
  texture.needsUpdate = true;
  var truePoint = new THREE.PointCloudMaterial({
    size: 0.5,
    map: texture,
    alphaTest: 0.5,
    transparent: true
  });
  var texture = new THREE.Texture(createCircleCanvas('#6a8cc7', '#3261ab'));
  texture.needsUpdate = true;
  var falsePoint = new THREE.PointCloudMaterial({
    size: 0.5,
    map: texture,
    alphaTest: 0.5,
    transparent: true
  });

  var trueCloud = new THREE.PointCloud(trueGeos, truePoint);
  var falseCloud = new THREE.PointCloud(falseGeos, falsePoint);

  scene.add(axes);
  scene.add(trueCloud);
  scene.add(falseCloud);

  (function() {
    requestAnimationFrame(arguments.callee);
    controls.update();
    renderer.render(scene, camera);
  })();
};

function generateData() {
  // true-data
  // 0.0 <= x <  0.5
  // 0.0 <= x <  0.5
  // 0.5 <= z <= 1.0
  var data1 = [];
  for (var i = 0; i < 20; i++) {
    data1.push([
            Math.abs(Math.random() - 0.5),
            Math.abs(Math.random() - 0.5),
      0.5 + Math.abs(Math.random() - 0.5)
    ]);
  }

  // false-data
  // 0.5 <= x <= 1.0
  // 0.5 <= x <= 1.0
  // 0.0 <= z <  0.5
  var data2 = [];
  for (var i = 0; i < 20; i++) {
    data2.push([
      0.5 + Math.abs(Math.random() - 0.5),
      0.5 + Math.abs(Math.random() - 0.5),
            Math.abs(Math.random() - 0.5)
    ]);
  }

  return [ data1, data2 ];
}

function initializeObjects() {
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  camera.position.x = 12;
  camera.position.y = 7;
  camera.position.z = 12;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 5.0;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerHeight, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.scale.x = 5;
  scene.scale.y = 5;
  scene.scale.z = 5;
}

function buildAxes() {
  var axes = new THREE.Object3D();

  var mainMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
  var subMaterial  = new THREE.LineBasicMaterial({ color: 0xdddddd });

  var mainGeo = new THREE.Geometry();
  var subGeo  = new THREE.Geometry();

  mainGeo.vertices.push(
    // x軸
    new THREE.Vector3(0,  0, 0),
    new THREE.Vector3(SIZE, 0, 0),

    // y軸
    new THREE.Vector3(0,  0, 0),
    new THREE.Vector3(0, SIZE, 0),

    // z軸
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, SIZE)
  );

  for (var i = 0.1; i <= SIZE; i += 0.1) {
    subGeo.vertices.push(
      // x-z 平面
      new THREE.Vector3(0,  0, i),
      new THREE.Vector3(SIZE, 0, i),
      new THREE.Vector3(i,  0, 0),
      new THREE.Vector3(i,  0, SIZE),

      // x-y 平面
      new THREE.Vector3(0,  i, 0),
      new THREE.Vector3(SIZE, i, 0),
      new THREE.Vector3(i,  0, 0),
      new THREE.Vector3(i, SIZE, 0),

      // y-z 平面
      new THREE.Vector3(0,  0, i),
      new THREE.Vector3(0, SIZE, i),
      new THREE.Vector3(0,  i, 0),
      new THREE.Vector3(0,  i, SIZE)
    );
  }

  axes.add(new THREE.Line(mainGeo, mainMaterial, THREE.LinePieces));
  axes.add(new THREE.Line(subGeo,  subMaterial,  THREE.LinePieces));

  return axes;
}

function createCircleCanvas(color1, color2) {
  var CANVAS_SIZE = 128;
  var HALF        = CANVAS_SIZE / 2;
  var CENTER      = CANVAS_SIZE / 2;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  var grad = context.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, HALF);
  grad.addColorStop(0, color1)
  grad.addColorStop(1, color2);

  context.lineWidth = 0;
  context.beginPath();
  context.arc(CENTER, CENTER, HALF, 0, 2 * Math.PI, false);
  context.fillStyle = grad;
  context.fill();
  context.closePath();
  return canvas;
}

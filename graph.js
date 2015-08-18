var SIZE = 1;
var ANIM = 30;
var camera ,controls ,scene ,renderer;
var positivePoints, negativePoints, newPoint;
var positiveMaterial, negativeMaterial, redMaterial;
var weightVector;
var rotationVector;
var separationPlane, oldSeparationPlane;

var data = generateData();
var perceptron = new Perceptron(3);
perceptron.addTrainingData(data.positive,  1);
perceptron.addTrainingData(data.negative, -1);

window.onload = function() {
  initializeObjects();
  document.addEventListener('keydown', processNextStep);

  var axes = buildAxes();

  var plane          = new THREE.PlaneGeometry(2, 2, 1, 1);
  var material1      = new THREE.MeshBasicMaterial({ color: '#da6272', opacity: 0.8, transparent: true, side: THREE.DoubleSide });
  var material2      = new THREE.MeshBasicMaterial({ color: '#daa672', opacity: 0.3, transparent: true, side: THREE.DoubleSide });
  separationPlane    = new THREE.Mesh(plane, material1);
  oldSeparationPlane = new THREE.Mesh(plane, material2);
  separationPlane.visible = false;
  separationPlane.position.set(0.5, 0.5, 0.5);
  oldSeparationPlane.visible = false;
  oldSeparationPlane.position.set(0.5, 0.5, 0.5);

  scene.add(axes, positivePoints, negativePoints, separationPlane, oldSeparationPlane);

  (function() {
    requestAnimationFrame(arguments.callee);
    controls.update();
    renderer.render(scene, camera);
  })();
};

function arrow(v, color) {
  var origin = new THREE.Vector3(0, 0, 0);
  var length = v.length();
  return new THREE.ArrowHelper(v.clone().normalize(), origin, length, color);
}

var oldW = [ 0, 0, 0 ];
function processNextStep(e) {
  switch (e.keyCode) {
    case 32: { // スペースキー
      var positives   = new THREE.Geometry();
      var negatives   = new THREE.Geometry();
      var newGeometry = new THREE.Geometry();

      var learnedData = perceptron.stepLearn();
      for (var i = 0; i < learnedData.length - 1; i++) {
        var v = learnedData[i];
        var x = v.data;
        if (v.label == 1) {
          positives.vertices.push(new THREE.Vector3(x[0], x[1], x[2]));
        } else {
          negatives.vertices.push(new THREE.Vector3(x[0], x[1], x[2]));
        }
      }
      var x = learnedData[learnedData.length - 1].data;
      newGeometry.vertices.push(new THREE.Vector3(x[0], x[1], x[2]));

      scene.remove(positivePoints, negativePoints, newPoint, weightVector);
      positivePoints.visible = false;
      negativePoints.visible = false;

      positivePoints = new THREE.PointCloud(positives, positiveMaterial);
      negativePoints = new THREE.PointCloud(negatives, negativeMaterial);
      newPoint       = new THREE.PointCloud(newGeometry, redMaterial);

      var w      = perceptron.getWeight();
      var wv     = new THREE.Vector3(w[0], w[1], w[2]);
      var normal = separationPlane.geometry.faces[0].normal;
      var origin = new THREE.Vector3(0, 0, 0);
      var length = wv.length();
      var rotationAxis = new THREE.Vector3();
      rotationAxis.crossVectors(separationPlane.geometry.faces[0].normal, wv).normalize();

      if (learnedData.length > 1) {
        if (learnedData.length == 2 || w[0] != oldW[0] || w[1] != oldW[1] || w[2] != oldW[2]) {
          if (learnedData.length > 2) {
            oldSeparationPlane.visible = false;
            oldSeparationPlane.rotation.setFromQuaternion(separationPlane.quaternion);
          }

          var angle = normal.dot(wv) / (normal.length() * wv.length());
          var q = new THREE.Quaternion();
          q.setFromAxisAngle(rotationAxis, Math.acos(angle));
          separationPlane.rotation.setFromQuaternion(q);
          separationPlane.visible = true;
        } else {
          oldSeparationPlane.visible = false;
        }
      }

      weightVector = arrow(wv, '#ff00ff');

      scene.add(positivePoints, negativePoints, newPoint, weightVector);
      oldW = w.concat();
      break;
    }
  }
}

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

  return {
    positive: data1,
    negative: data2
  };
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

  var materialOptions = {
    size: 0.5,
    alphaTest: 0.5,
    transparent: true
  };

  var positives        = new THREE.Geometry();
  var negatives        = new THREE.Geometry();
  var texture1         = new THREE.Texture(createCircleCanvas('#86e392', '#42d055'));
  var texture2         = new THREE.Texture(createCircleCanvas('#6a8cc7', '#3261ab'));
  var texture3         = new THREE.Texture(createCircleCanvas('#e38692', '#d04255'));
      positiveMaterial = new THREE.PointCloudMaterial(materialOptions);
      negativeMaterial = new THREE.PointCloudMaterial(materialOptions);
      redMaterial      = new THREE.PointCloudMaterial(materialOptions);
      positivePoints   = new THREE.PointCloud(positives, positiveMaterial);
      negativePoints   = new THREE.PointCloud(negatives, negativeMaterial);

  for (var i = 0; i < data.positive.length; i++) {
    var data1 = data.positive[i];
    var vdata = new THREE.Vector3(data1[0], data1[1], data1[2]);
    positives.vertices.push(vdata);
  }
  for (var i = 0; i < data.negative.length; i++) {
    var data2 = data.negative[i];
    var vdata = new THREE.Vector3(data2[0], data2[1], data2[2]);
    negatives.vertices.push(vdata);
  }

  positiveMaterial.map = texture1;
  negativeMaterial.map = texture2;
  redMaterial.map      = texture3;
  texture1.needsUpdate = true;
  texture2.needsUpdate = true;
  texture3.needsUpdate = true;
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

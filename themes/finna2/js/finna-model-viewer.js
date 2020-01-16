/* global finna, THREE, VuFind*/

finna.modelViewer = (function modelViewer() {

  function ModelViewer(canvasParent, options)
  {
    var _ = this;
    _.thumbnail = options.thumbnail;
    _.canvasParent = $('.' + canvasParent);
    _.createImageTrigger();
  }

  ModelViewer.prototype.initViewer = function initViewer()
  {
    var _ = this;
    _.createRenderer();
    _.loadCubeMap();
    _.loadGLTF();
  };

  ModelViewer.prototype.onBecomeVisible = function onBecomeVisible()
  {
    var _ = this;
    _.createImageTrigger();
  };

  // image trigger is a placeholder for nonloaded viewers
  ModelViewer.prototype.createImageTrigger = function createImageTrigger()
  {
    var _ = this;
    var img = $('<img>');
    img.attr('src', _.thumbnail);

    _.canvasParent.append(img);
    _.canvasParent.on('click', function init() {
      _.canvasParent.off('click');
      _.canvasParent.empty();
      _.initViewer();
    });
  };

  ModelViewer.prototype.createRenderer = function createRenderer()
  {
    var _ = this;
    _.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    _.renderer.physicallyCorrectLights = true;
    _.renderer.gammaOutput = true;
    _.renderer.gammaFactor = 2.2;
    _.renderer.outputEncoding = _.encoding = THREE.sRGBEncoding;
    _.renderer.setClearColor(0xcccccc);
    _.renderer.setPixelRatio(window.devicePixelRatio);
    _.renderer.setSize(600, 600);
    _.canvasParent.append(_.renderer.domElement);    
  };

  ModelViewer.prototype.loadGLTF = function loadGLTF(pathToFile)
  {
    var _ = this;
    var path;
    if (typeof pathToFile === 'undefined') { // For debugging only
      path = '/vufind/themes/finna2/images/models/juomahinkka_test01.glb';
    } else {
      path = pathToFile;
    }

    var loader = new THREE.GLTFLoader();
    loader.load(
      path,
      function onLoad ( obj ) {
        _.scene = obj.scene;
        _.scene.background = _.envMap;
        _.center = new THREE.Vector3();
        _.cameraPosition = new THREE.Vector3(0, 40, -50);
        _.setupScene();
      },
      function onLoading( xhr ) {

      },
      function onError( error ) {

      }
    );
  };


  ModelViewer.prototype.setupScene = function setupScene()
  {
    var _ = this;
    
    _.createLights();
    _.initMesh();
    _.createControls();
    _.animationLoop();
  };

  ModelViewer.prototype.animationLoop = function animationLoop()
  {
    var _ = this;

    function animate() {
      _.renderer.render(_.scene, _.camera);
      requestAnimationFrame(animate);
    }
    animate();
  };

  ModelViewer.prototype.createControls = function createControls()
  {
    var _ = this;
    _.camera = new THREE.PerspectiveCamera( 75, 400 / 400, 0.1, 1000 );
    _.camera.position.set(_.cameraPosition.x, _.cameraPosition.y, _.cameraPosition.z);

    _.controls = new THREE.OrbitControls(_.camera, _.renderer.domElement);
    _.controls.target = _.center;
    _.controls.update();
  };

  ModelViewer.prototype.initMesh = function initMesh()
  {
    var _ = this;
    _.scene.traverse(function traverseMeshes(obj) {
      if (obj.type === 'Mesh') {
        var geometry = obj.geometry;
        geometry.center();
        geometry.computeBoundingBox();
        _.center = geometry.boundingBox.getCenter(new THREE.Vector3());
        _.center = obj.localToWorld(_.center);
        _.cameraPosition.add(_.center);

        // Reduce metalness to 0 and set cubemap as source to calculate lights
        obj.material.envMap = _.envMap;
        obj.material.metalness = 0;
        obj.material.roughness = 1;
        obj.material.depthWrite = !obj.material.transparent;

        if (obj.material.map) obj.material.map.encoding = _.encoding;
        if (obj.material.emissiveMap) obj.material.emissiveMap.encoding = _.encoding;
        if (obj.material.map || obj.material.emissiveMap) obj.material.needsUpdate = true;
      }
    });
  };

  ModelViewer.prototype.createLights = function createLights()
  {
    var _ = this;
    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    _.scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 * Math.PI );
    _.scene.add( directionalLight );
  };

  ModelViewer.prototype.loadCubeMap = function loadCubeMap(pathToFolder)
  {
    var _ = this;
    var path;
    if (typeof pathToFolder === 'undefined') { // For debugging only
      path = '/vufind/themes/finna2/images/cubemap/';
    } else {
      path = pathToFolder;
    }
    _.envMap = new THREE.CubeTextureLoader()
      .setPath(path)
      .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
  };

  function create(area, options)
  {
    new ModelViewer(area, options);
  }

  var my = {
    create: create
  };

  return my;
})();
/* global finna, THREE, VuFind*/

finna.modelViewer = (function modelViewer() {

  function ModelViewer(canvasParent, options)
  {
    var _ = this;

    _.id = options.id;
    _.informations = {};
    _.thumbnail = options.thumbnail;
    _.cubeSettings = options.cubemap;
    _.canvasParent = $('.' + canvasParent);
    _.canvasImage = _.canvasParent.find('img');
    _.root = _.canvasParent.closest('.model-wrapper');
    _.controlsArea = _.root.find('.viewer-controls');
    _.optionsArea = _.root.find('.viewer-options');
    _.optionsArea.toggle(false);
    _.fullscreen = _.controlsArea.find('.model-fullscreen');
    _.viewerStateInfo = _.root.find('.viewer-state-info');
    _.wireframeBtn = _.controlsArea.find('.model-wireframe');
    _.informationsArea = _.root.find('.statistics-table');
    _.informationsArea.toggle(false);
    _.setImageTrigger();
    _.setEvents();
  }

  ModelViewer.prototype.setInformation = function setInformation(header, info)
  {
    var _ = this;
    _.informationsArea.append('<tr><td class="model-header">' + header + '</td><td class="model-value">' + info + '</td></tr>');
  };

  ModelViewer.prototype.setEvents = function setEvents()
  {
    var _ = this;
    $(window).on('resize', function setNewScale() {
      if (typeof _.camera === 'undefined') {
        return;
      }
      _.updateScale();
    });

    $(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function onScreenChange() {
      if (_.root.hasClass('fullscreen')) {
        _.root.removeClass('fullscreen');
      } else {
        _.root.addClass('fullscreen');
      }
      _.updateScale();
    });

    _.fullscreen.on('click', function setFullscreen() {
      if (_.root.hasClass('fullscreen')) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
          document.msExitFullscreen();
        }
      } else {
        var elem = _.root[0];
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
          elem.msRequestFullscreen();
        }
      }
    });
    _.wireframeBtn.on('click', function toggleWireFrame() {
      _.meshMaterial.wireframe = !_.meshMaterial.wireframe;
    });
  };

  ModelViewer.prototype.updateScale = function updateScale()
  {
    var _ = this;

    _.getParentSize();
    _.camera.aspect = _.size.x / _.size.y;
    _.camera.updateProjectionMatrix();
    _.renderer.setSize(_.size.x, _.size.y);
  };

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
  ModelViewer.prototype.setImageTrigger = function setImageTrigger()
  {
    var _ = this;
    _.canvasImage.on('click', function init() {
      $(this).off('click');
      _.getModelUrl();
    });
  };

  ModelViewer.prototype.getModelUrl = function getModelUrl()
  {
    var _ = this;
    $.getJSON(
      VuFind.path + '/AJAX/JSON',
      {
        method: 'getModel',
        id: _.id
      }
    )
      .done(function onGetModelDone(response) {
        _.modelPath = response.data.url;
        _.canvasImage.remove();
        _.initViewer();
        _.optionsArea.toggle(true);
      })
      .fail(function onGetModelFailed(response) {
        _.setImageTrigger();
      });
  };

  ModelViewer.prototype.getParentSize = function getParentSize()
  {
    var _ = this;
    _.size = {
      x: _.root.width(),
      y: _.root.hasClass('fullscreen') ? _.root.height() : _.root.width()
    };
  };

  ModelViewer.prototype.createRenderer = function createRenderer()
  {
    var _ = this;
    _.getParentSize();
    _.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    _.renderer.physicallyCorrectLights = true;
    _.renderer.gammaOutput = true;
    _.renderer.gammaInput = true;
    _.renderer.gammaFactor = 2.2;
    _.renderer.toneMapping = THREE.ReinhardToneMapping;
    _.encoding = THREE.sRGBEncoding;
    _.renderer.outputEncoding = _.encoding;
    
    _.renderer.shadowMap.enabled = true;
    _.renderer.setClearColor(0xffffff);
    _.renderer.setPixelRatio(window.devicePixelRatio);
    _.renderer.setSize(_.size.x, _.size.y);
    _.canvasParent.append(_.renderer.domElement);  
  };

  ModelViewer.prototype.loadGLTF = function loadGLTF()
  {
    var _ = this;

    var loader = new THREE.GLTFLoader();
    loader.load(
      _.modelPath,
      function onLoad ( obj ) {
        _.viewerStateInfo.hide();
        _.scene = obj.scene;
        _.scene.background = _.envMap;
        _.center = new THREE.Vector3();
        _.cameraPosition = new THREE.Vector3(0, 0, 0);
        _.setupScene();
      },
      function onLoading( xhr ) {
        _.viewerStateInfo.html(( xhr.loaded / xhr.total * 100 ).toFixed(2) + '%');
      },
      function onError( error ) {

      }
    );
  };


  ModelViewer.prototype.setupScene = function setupScene()
  {
    var _ = this;
    
    _.createLights();
    _.createControls();
    _.initMesh();
    var axesHelper = new THREE.AxesHelper( 5 );
    _.scene.add( axesHelper );
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
    _.camera = new THREE.PerspectiveCamera( 50, _.size.x / _.size.x, 0.1, 1000 );
    _.camera.position.set(_.cameraPosition.x, _.cameraPosition.y, _.cameraPosition.z);

    _.controls = new THREE.OrbitControls(_.camera, _.renderer.domElement);
    _.controls.target = _.center;
    _.controls.screenSpacePanning = true;
    //_.controls.minDistance = 0.1;
    _.controls.update();
  };

  function getTanDeg(deg) {
    var rad = deg * Math.PI / 180;
    return Math.tan(rad);
  }

  ModelViewer.prototype.initMesh = function initMesh()
  {
    var _ = this;
    var vertices = 0;
    var triangles = 0;
    var meshes = 0;
    var meshMaterial;
    _.scene.traverse(function traverseMeshes(obj) {
      console.log(obj);
      if (obj.type === 'Mesh') {
        meshes++;
        var geometry = obj.geometry;
        meshMaterial = obj.material;
        // Reduce metalness to 0 and set cubemap as source to calculate lights
        meshMaterial.envMap = _.envMap;

        meshMaterial.depthWrite = !meshMaterial.transparent;
        meshMaterial.bumpScale = 1;

        if (meshMaterial.map) meshMaterial.map.encoding = _.encoding;
        if (meshMaterial.emissiveMap) meshMaterial.emissiveMap.encoding = _.encoding;
        if (meshMaterial.normalMap) meshMaterial.normalMap.encoding = _.encoding;
        if (meshMaterial.map || meshMaterial.emissiveMap || meshMaterial.normalMap) meshMaterial.needsUpdate = true;

        // Lets get available information about the model here so we can show them properly in information screen
        var geo = obj.geometry;
        if (typeof geo.isBufferGeometry !== 'undefined' && geo.isBufferGeometry) {
          vertices += +geo.attributes.position.count;
          triangles += +geo.index.count / 3;
        }
        var newBox = new THREE.Box3().setFromObject(obj);

        //Calculate new center position if the bounding box is not centered
        var newCenterVector = new THREE.Vector3();
        newBox.getCenter(newCenterVector);
        newCenterVector.negate();
        obj.position.set(newCenterVector.x, newCenterVector.y, newCenterVector.z);

        //Calculate the distance for camera, so the object is properly adjusted in scene
        var objectHeight = (newBox.max.y - newBox.min.y) * 1.05;
        var objectWidth = (newBox.max.x - newBox.min.x) * 1.05;
        var result = 0;
        if (objectHeight >= objectWidth) {
          result = objectHeight / getTanDeg(25);
        } else {
          result = objectWidth / getTanDeg(25);
        }
        _.camera.position.set(0, 0, result);
        var box = new THREE.BoxHelper( obj, 0xffff00 );
        _.scene.add( box );
        //obj.rotateX(Math.PI / 2);
      }
    });
    console.log("Here");
    _.informationsArea.toggle(true);
    _.setInformation('Vertices', vertices);
    _.setInformation('Triangles', triangles);
    _.setInformation('Meshes', meshes);
    _.setInformation('Format', 'gLTF 2.0');
  };

  ModelViewer.prototype.createLights = function createLights()
  {
    var _ = this;
    var ambientLight = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    //var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    _.scene.add(ambientLight);
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.6 );
    _.scene.add( light );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    _.scene.add( directionalLight );
  };

  ModelViewer.prototype.loadCubeMap = function loadCubeMap()
  {
    var _ = this;

    _.envMap = new THREE.CubeTextureLoader()
      .setPath(_.cubeSettings.path)
      .load(_.cubeSettings.images);
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
/* global finna, THREE, VuFind*/

finna.modelViewer = (function modelViewer() {

  function ModelViewer(canvasParent, options)
  {
    var _ = this;

    _.id = options.id;
    _.informations = {};
    _.thumbnail = options.thumbnail;
    _.canvasParent = $('.' + canvasParent);
    _.canvasImage = _.canvasParent.find('img');
    _.root = _.canvasParent.closest('.model-wrapper');
    _.controlsArea = _.root.find('.viewer-controls');
    _.controlsArea.toggle(false);
    _.fullscreen = _.controlsArea.find('.model-fullscreen');
    _.viewerStateInfo = _.root.find('.viewer-state-info');
    _.wireframeBtn = _.controlsArea.find('.model-wireframe');
    _.informationsArea = _.root.find('.model-information');
    _.informationsArea.toggle(false);
    _.setImageTrigger();
    _.setEvents();
  }

  ModelViewer.prototype.setInformation = function setInformation(element, info)
  {
    var _ = this;
    _.informationsArea.find('.' + element).html(info);
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
        _.controlsArea.toggle(true);
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
    _.renderer.gammaFactor = 2.2;
    _.renderer.outputEncoding = _.encoding = THREE.sRGBEncoding;
    _.renderer.setClearColor(0xcccccc);
    _.renderer.setPixelRatio(window.devicePixelRatio);
    _.renderer.setSize(_.size.x, _.size.x);
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
        _.cameraPosition = new THREE.Vector3(0, 40, -50);
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
    _.camera = new THREE.PerspectiveCamera( 75, _.size.x / _.size.x, 0.1, 1000 );
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

        _.meshMaterial = obj.material;

        // Reduce metalness to 0 and set cubemap as source to calculate lights
        _.meshMaterial.envMap = _.envMap;
        _.meshMaterial.metalness = 0;
        _.meshMaterial.roughness = 1;
        _.meshMaterial.depthWrite = !_.meshMaterial.transparent;

        if (_.meshMaterial.map)_.meshMaterial.map.encoding = _.encoding;
        if (_.meshMaterial.emissiveMap) _.meshMaterial.emissiveMap.encoding = _.encoding;
        if (_.meshMaterial.map || _.meshMaterial.emissiveMap) _.meshMaterial.needsUpdate = true;

        // Lets get available information about the model here so we can show them properly in information screen
        var geo = obj.geometry;
        if (typeof geo.isBufferGeometry !== 'undefined' && geo.isBufferGeometry) {
          var vertices = geo.attributes.position.count;
          _.setInformation('model-vertices', vertices);
          var triangles = +geo.index.count / 3;
          _.setInformation('model-triangles', triangles);
          _.informationsArea.toggle(true);
        }
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

  ModelViewer.prototype.loadCubeMap = function loadCubeMap()
  {
    var _ = this;

    _.envMap = new THREE.CubeTextureLoader()
      .setPath('/vufind/themes/finna2/images/cubemap/')
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
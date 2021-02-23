/* global finna, THREE, VuFind*/

function ModelViewer(trigger, options, scripts)
{
  var _ = this;
  _.trigger = $(trigger);
  _.cubeSettings = options.cubemap;
  _.parentId = options.parentCanvas;
  if (options.inLineId) {
    _.inLineId = options.inLineId;
  }
  _.modelUrl = _.trigger.data('modelurl');
  _.loadInfo = _.trigger.data('modelload');
  var modal = $('#model-modal').find('.model-wrapper').first().clone();

  _.trigger.finnaPopup({
    id: 'modelViewer',
    cycle: false,
    parent: _.inLineId ? _.inLineId : undefined,
    classes: 'model-viewer',
    translations: options.translations,
    modal: modal,
    onPopupOpen: function onPopupOpen() {
      var popup = this;
      finna.layout.loadScripts(scripts, function onScriptsLoaded() {
        if (!_.root) {
          // Lets create required html elements
          _.canvasParent = popup.content.find('.' + _.parentId);
          _.informations = {};
          _.root = popup.content.find('.model-viewer');
          _.controlsArea = _.root.find('.viewer-controls');
          _.optionsArea = _.root.find('.viewer-options');
          _.optionsArea.toggle(false);
          _.fullscreen = _.controlsArea.find('.model-fullscreen');
          _.viewerStateInfo = _.root.find('.viewer-state-info');
          _.informationsArea = _.root.find('.statistics-table');
          _.root.find('.model-stats').attr('id', 'model-stats');
          _.informationsArea.toggle(false);
          console.log(_.root);
        }
        _.getModelPath();
      });
    },
    onPopupClose: function onPopupClose() {
      _.root = null;
      _.renderer = null;
      _.scene = null;
      _.canvasParent = null;
      _.informations = {};
      _.controlsArea = null;
      _.optionsArea = null;
      _.fullscreen = null;
      _.viewerStateInfo = null;
      _.informationsArea = null;
      _.camera = null;
    }
  });
}

ModelViewer.prototype.setInformation = function setInformation(header, info)
{
  var _ = this;
  _.informationsArea.append('<tr><td class="model-header">' + header + '</td><td class="model-value">' + info + '</td></tr>');
};

ModelViewer.prototype.setEvents = function setEvents()
{
  var _ = this;
  var fullscreenEvents = 'fullscreenchange.finna mozfullscreenchange.finna webkitfullscreenchange.finna';
  $(window).off('resize').on('resize', function setNewScale() {
    if (typeof _.camera === 'undefined') {
      return;
    }
    _.updateScale();
  });

  $(document).off(fullscreenEvents).on(fullscreenEvents, function onScreenChange() {
    if (_.root.hasClass('fullscreen')) {
      _.root.removeClass('fullscreen');
    } else {
      _.root.addClass('fullscreen');
    }
    _.updateScale();
  });

  _.fullscreen.off('click').on('click', function setFullscreen() {
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
};

ModelViewer.prototype.updateScale = function updateScale()
{
  var _ = this;

  _.getParentSize();
  _.camera.aspect = _.size.x / _.size.y;
  _.camera.updateProjectionMatrix();
  _.renderer.setSize(_.size.x, _.size.y);
};

// Create a new viewer every time
ModelViewer.prototype.initViewer = function initViewer()
{
  var _ = this;
  _.createRenderer();
  _.loadCubeMap();
  _.loadGLTF();
  _.setEvents();
};

ModelViewer.prototype.startModelViewer = function startModelViewer()
{
  var _ = this;
  _.modelPath = _.button;
  _.canvasImage.remove();
  _.initViewer();
  _.optionsArea.toggle(true);
};

ModelViewer.prototype.getParentSize = function getParentSize()
{
  var _ = this;
  _.size = {
    x: _.root.width(),
    y: _.inLineId && !_.root.hasClass('fullscreen') ? _.root.width() : _.root.height()
  };
};

ModelViewer.prototype.createRenderer = function createRenderer()
{
  var _ = this;
  _.getParentSize();
  _.renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  // These are the settings to make glb files look good with threejs
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
  console.log("Renderer applied to");
  console.log(_.size); 
};

ModelViewer.prototype.getModelPath = function getModelPath()
{
  var _ = this;
  $.getJSON(
    VuFind.path + '/AJAX/JSON',
    {
      method: 'getModel',
      id: _.loadInfo.id,
      index: _.loadInfo.index,
      format: _.loadInfo.format
    }
  )
    .done(function onGetModelDone(response) {
      _.modelPath = response.data.url;
      _.initViewer();
      _.optionsArea.toggle(true);
    })
    .fail(function onGetModelFailed(response) {
      console.log(response);
    });
};

ModelViewer.prototype.loadGLTF = function loadGLTF()
{
  var _ = this;
  console.log(_.modelPath);

  var loader = new THREE.GLTFLoader();
  loader.load(
    _.modelPath,
    function onLoad ( obj ) {
      _.scene = obj.scene;
      _.scene.background = _.envMap;
      _.center = new THREE.Vector3();
      _.cameraPosition = new THREE.Vector3(0, 0, 0);
      _.setupScene();
    },
    function onLoading( xhr ) {
      /*_.viewerStateInfo.html(( xhr.loaded / xhr.total * 100 ).toFixed(2) + '%');*/
      console.log(( xhr.loaded / xhr.total * 100 ).toFixed(2) + '%');
    },
    function onError(/* error */) {
      // Still needs to have an error handling set properly
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

  // Animation loop, required for constant updating
  function animate() {
    _.renderer.render(_.scene, _.camera);
    requestAnimationFrame(animate);
  }
  animate();
};

ModelViewer.prototype.createControls = function createControls()
{
  var _ = this;
  _.camera = new THREE.PerspectiveCamera( 50, _.size.x / _.size.y, 0.1, 1000 );
  _.camera.position.set(_.cameraPosition.x, _.cameraPosition.y, _.cameraPosition.z);

  // Basic controls for scene, imagine being a satellite at the sky
  _.controls = new THREE.OrbitControls(_.camera, _.renderer.domElement);

  // Should be THREE.Vector3(0,0,0)
  _.controls.target = _.center;
  _.controls.screenSpacePanning = true;
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
    if (obj.type === 'Mesh') {
      meshes++;
      meshMaterial = obj.material;

      // Apply environmental map to the material, so lights look nicer
      meshMaterial.envMap = _.envMap;
      meshMaterial.depthWrite = !meshMaterial.transparent;
      meshMaterial.bumpScale = 1;

      // Apply encodings so glb looks better and update it if needed
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

  _.informationsArea.toggle(true);
  _.setInformation('Vertices', vertices);
  _.setInformation('Triangles', triangles);
  _.setInformation('Meshes', meshes);
  _.setInformation('Format', 'gLTF 2.0');
};

ModelViewer.prototype.createLights = function createLights()
{
  var _ = this;

  // Ambient light basically just is there all the time
  var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.3 ); // soft white light
  _.scene.add(ambientLight);
  var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.6 );
  _.scene.add( light );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  _.scene.add( directionalLight );
};

ModelViewer.prototype.loadCubeMap = function loadCubeMap()
{
  var _ = this;

  _.envMap = new THREE.CubeTextureLoader()
    .setPath(_.cubeSettings.path)
    .load(_.cubeSettings.images);
};

(function modelModule($) {
  $.fn.finnaModel = function finnaModel() {
    new ModelViewer($(this), $(this).data('settings'), $(this).data('scripts'));    
  };
})(jQuery);
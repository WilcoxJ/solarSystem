let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(60, aspect, 1, 2800);
let cameraRotation = 0;
let cameraRotationSpeed = 0.0005;
let cameraAutoRotation = true;
let orbitControls = new THREE.OrbitControls(camera);

// Lights
let spotLight = new THREE.SpotLight(0xffffff, 0.8, 0, 15, 2);

// const light = new THREE.AmbientLight( 0x404040 ); // soft white light
// scene.add( light );

// Texture Loader
let textureLoader = new THREE.TextureLoader();

// Planet Proto
let planetProto = {
  sphere: function(size) {
    let sphere = new THREE.SphereGeometry(size, 32, 32);
    
    return sphere;
  },

  material: function(options) {
    let material = new THREE.MeshPhongMaterial();
    if (options) {
      for (var property in options) {
        material[property] = options[property];
      } 
    }
    
    return material;
  },

  ring: function (val) {
    console.log(val);
    if(val == true) {
      let ring = new THREE.TorusGeometry( 0.97, 0.04, 2, 100 );

      // TODO: make better rings
      // let ring = new THREE.RingGeometry(0.95, 0.90, 30, 1);


      ring.rotateX( (Math.PI / 2) * .98 );
      return ring;
    }

  },
  glowMaterial: function(intensity, fade, color) {
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: { 
        'c': {
          type: 'f',
          value: intensity
        },
        'p': { 
          type: 'f',
          value: fade
        },
        glowColor: { 
          type: 'c',
          value: new THREE.Color(color)
        },
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`
      ,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`
      ,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    return glowMaterial;
  },
  texture: function(material, property, uri) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = true;
    textureLoader.load(
      uri,
      function(texture) {
        material[property] = texture;
        material.needsUpdate = true;
      }
    );
  }
};

let createPlanet = function(options) {
  let surfaceGeometry = planetProto.sphere(options.surface.size);

  let ringGeometry = planetProto.ring(options.ring.val);

  let surfaceMaterial = planetProto.material(options.surface.material);
  let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

// TODO Fix ring material
  let ringMaterial = planetProto.material(options.surface.material);
  let ringSurface = new THREE.Mesh(ringGeometry, surfaceMaterial);

  let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
  let atmosphereMaterialDefaults = {
    side: THREE.DoubleSide,
    transparent: true
  }
  let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
  let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  let atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  let atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);



  let planet = new THREE.Object3D();
  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';
  ringSurface.name = 'ringSurface';
  planet.add(surface);
  planet.add(atmosphere);
  planet.add(atmosphericGlow);
  // planet.add(ringMaterial);
  planet.add(ringSurface);

  for (let textureProperty in options.surface.textures) {
    planetProto.texture(
      surfaceMaterial,
      textureProperty,
      options.surface.textures[textureProperty]
    ); 
  }
  
  for (let textureProperty in options.atmosphere.textures) {
    planetProto.texture(
      atmosphereMaterial,
      textureProperty,
      options.atmosphere.textures[textureProperty]
    );
  }
  
  return planet;
};

let drewb = createPlanet({
  surface: {
    size: 0.65,
    material: {
      bumpScale: 0.04,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/planet_drewb.jpeg',
      // bumpMap: 'img/earthbump1k.jpg',
      // specularMap: 'img/earthmapspecular.jpg'
    }
  },
  ring: {
    val: true
  },
  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.0
    },
    textures: {
      // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
      // alphaMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg'
    },
    glow: {
      size: 0.022,
      intensity: 0.94,
      fade: 5.1,
      color: 0x5fa2
    }
  },
});


let mercury = createPlanet({
  surface: {
    size: 0.35,
    material: {
      bumpScale: 0.005,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/mercuryTexture2.jpg',
      bumpMap: 'img/mercurybump.jpg'
      // specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: false
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
    },
    glow: {
      size: 0.022,
      intensity: 0.7,
      fade: 7.0,
      color: 0x7f3333
    }
  },
});

// "C:\xampp2\htdocs\solarSystem\img\ven0aaa2.jpg"

let venus = createPlanet({
  surface: {
    size: 0.57,
    material: {
      bumpScale: 0.005,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/ven0aaa2.jpg'
      // bumpMap: 'img/mercurybump.jpg'
      // specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: false
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
    },
    glow: {
      size: 0.022,
      intensity: 0.7,
      fade: 7.0,
      color: 0xedba7a
    }
  },
});


let earth = createPlanet({
  surface: {
    size: 0.6,
    material: {
      bumpScale: 0.04,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/earthmap.jpg',
      bumpMap: 'img/earthbump1k.jpg',
      specularMap: 'img/earthmapspecular.jpg'
    }
  },

  ring: {
    val: false
  },
  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.8
    },
    textures: {
      map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
      alphaMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg'
    },
    glow: {
      size: 0.022,
      intensity: 0.90,
      fade: 8.4,
      // color: 0x146ebe
      // color: 0x2ff20
      color: 0xa272
    }
  },
});

let mars = createPlanet({
  surface: {
    size: 0.39,
    material: {
      bumpScale: 0.04,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/mars_1k_color.jpg',
      bumpMap: 'img/marsbump1k.jpg',
      specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: false
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
    },
    glow: {
      size: 0.022,
      intensity: 0.7,
      fade: 7.0,
      color: 0xa20000
    }
  },
});

let saturn = createPlanet({
  surface: {
    size: 0.77,
    material: {
      bumpScale: 0.04,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/saturnmap.jpg'
      // ringMap: 'img/saturnringcolor.jpg'
      // bumpMap: 'img/marsbump1k.jpg',
      // specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: true
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
    },
    glow: {
      size: 0.022,
      intensity: 0.93,
      fade: 7.3,
      color: 0xd9f071
    }
  },
});


let moon = createPlanet({
  surface: {
    size: 0.14,
    material: {
      bumpScale: 0.025,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/moon1.jpg',
      bumpMap: 'img/moonDisplace.jpg',
      // specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: false
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
      // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
      // alphaMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg'
    },
    glow: {
      size: 0.022,
      intensity: 0.4,
      fade: 10.0,
      color: 0xf7f0f0
    }
  },
});


let jupiter = createPlanet({
  surface: {
    size: 0.75,
    material: {
      bumpScale: 0.04,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'img/jupiter.jpg'
      // ringMap: 'img/saturnringcolor.jpg'
      // bumpMap: 'img/marsbump1k.jpg',
      // specularMap: 'img/mars_1k_normal.jpg'
    }
  },

  ring: {
    val: false
  },

  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.05
    },
    textures: {
    },
    glow: {
      size: 0.022,
      intensity: 0.93,
      fade: 7.3,
      color: 0xa8b74e
    }
  },
});

// Galaxy
let galaxyGeometry = new THREE.SphereGeometry(2500, 32, 32);
let galaxyMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide
});
let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

// Load Galaxy Textures
textureLoader.crossOrigin = true;
textureLoader.load(
'img/milkyway.jpg',
  function(texture) {
    galaxyMaterial.map = texture;
    scene.add(galaxy);
  }
);



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(1,1,1);
orbitControls.enabled = !cameraAutoRotation;

scene.add(camera);
scene.add(spotLight);
// scene.add(light);

// TODO: add to to GUI 
var planetSelection = mercury;
// scene.add(planetSelection);

scene.add(mars);
scene.add(earth);
scene.add(moon);
scene.add(saturn);
scene.add(mercury);
scene.add(venus);
scene.add(jupiter);

mercury.visible = true;
moon.visible = false;
earth.visible = false;
saturn.visible = false;
mars.visible = false;
venus.visible = false;
jupiter.visible = false;
camera.far = 20000;

spotLight.position.set(3, 5, 5);

planetSelection.receiveShadow = true;
planetSelection.castShadow = true;
planetSelection.getObjectByName('surface').geometry.center();

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// WHEEL
document.addEventListener('wheel', onDocumentMouseWheel); 
function onDocumentMouseWheel(event) {
  var fovMAX = 100;
  var fovMIN = 40;
  camera.fov -= event.wheelDeltaY * 0.005;
  camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
  camera.updateProjectionMatrix();

}


let render = function() {
  //venus rotates counter clockwise
  if (planetSelection == venus) {
    planetSelection.getObjectByName('surface').rotation.y += (1/32 * -0.015);
    planetSelection.getObjectByName('atmosphere').rotation.y += (1/16 * -0.009);
  }
  //polar orbit
  if (planetSelection == drewb) {
    planetSelection.getObjectByName('surface').rotation.x += 1/32 * 0.01;
    planetSelection.getObjectByName('atmosphere').rotation.x += 1/16 * 0.009;
  }
  
  else {
    planetSelection.getObjectByName('surface').rotation.y += 1/32 * 0.01;
    planetSelection.getObjectByName('atmosphere').rotation.y += 1/16 * 0.009;
    // planetSelection.getObjectByName('ring').rotation.y += 90;
  }
  if (cameraAutoRotation) {
    cameraRotation += cameraRotationSpeed;
    camera.position.y = 0;
    camera.position.x = 2 * Math.sin(cameraRotation);
    camera.position.z = 2 * Math.cos(cameraRotation);
    camera.lookAt(planetSelection.position);
  }
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

render();

// dat.gui
var gui = new dat.GUI();
var guiPlanet = gui.addFolder('Planet');
var guiPlanetGlow = gui.addFolder('Glow');
var guiCamera = gui.addFolder('Camera');
var guiSurface = gui.addFolder('Surface');
var guiAtmosphere = gui.addFolder('Atmosphere');


var cameraControls = new function() {
  this.speed = cameraRotationSpeed;
  this.orbitControls = !cameraAutoRotation;
}

var surfaceControls = new function() {
  this.rotation = 0;
  this.bumpScale = 0.05;
  this.shininess = 10;
}

var planetSelectionControls = new function () {
  this.selection = 'Mercury';
}

var atmosphereControls = new function() {
  this.opacity = 0.8;
}

var planetGlowControls = new function() {
  this.intensity = 0.94;
  this.fade = 7;
  this.color = 0x7f3333;
}

// TODO: add more planets.... clean this up
guiPlanet.add(planetSelectionControls, 'selection', ['Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn']).onChange(function(value) {
  console.log(value);
  if (value == 'Earth') {
    planetSelection = earth;
    earth.visible  = true;
    mars.visible = false;
    moon.visible = false;
    mercury.visible = false;
    saturn.visible = false;
    jupiter.visible = false;
    venus.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Earth';
    document.getElementById('planetStats').innerHTML = 'Radius: 6378.1 KM</br>Distance From Sun: 1 AU</br>Type: Terrestrial Planet</br>Moons: 1'

  }
  if (value == 'Mars') {
    planetSelection = mars;
    mars.visible = true;
    earth.visible = false;
    moon.visible = false;
    mercury.visible = false;
    saturn.visible = false;
    jupiter.visible = false;
    venus.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Mars';
    document.getElementById('planetStats').innerHTML = 'Radius: 3396.2 KM</br>Distance From Sun: 1.5 AU</br>Type: Terrestrial Planet'
  }
  if (value == 'Saturn') {
    planetSelection = saturn;
    saturn.visible = true;
    moon.visible = false;
    mars.visible = false;
    earth.visible = false;
    mercury.visible = false;
    jupiter.visible = false;
    venus.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Saturn';
    document.getElementById('planetStats').innerHTML = 'Radius: 60268.0 KM</br>Distance From Sun: 9.5 AU</br>Type: Jovian Planet</br>Moons: 62'

  }
  if (value == 'Moon') {
    planetSelection = moon;
    moon.visible = true;
    mars.visible = false;
    earth.visible = false;
    mercury.visible = false;
    saturn.visible = false;
    jupiter.visible = false;
    venus.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Moon';
    document.getElementById('planetStats').innerHTML = 'Radius: 1738.1 KM</br>Distance From Sun: ~1 AU</br>Type: Major Moon'
  }
   if (value == 'Mercury') {
    planetSelection = mercury;
    mercury.visible = true;
    moon.visible = false;
    mars.visible = false;
    earth.visible = false;
    saturn.visible = false;
    venus.visible = false;
    jupiter.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Mercury';
    document.getElementById('planetStats').innerHTML = 'Radius: 2439.4 KM</br>Distance From Sun: 0.4 AU</br>Type: Terrestrial Planet'
  }
  if (value == 'Venus') {
    planetSelection = venus;
    venus.visible = true;
    moon.visible = false;
    mars.visible = false;
    earth.visible = false;
    saturn.visible = false;
    jupiter.visible = false;
    mercury.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Venus';
    document.getElementById('planetStats').innerHTML = 'Radius: 6051.8.4 KM</br>Distance From Sun: 0.7 AU</br>Type: Terrestrial Planet'
  }
  if (value == 'Jupiter') {
    planetSelection = jupiter;
    jupiter.visible = true;
    moon.visible = false;
    mars.visible = false;
    earth.visible = false;
    saturn.visible = false;
    mercury.visible = false;
    venus.visible = false;
    document.getElementById('planetTitle').innerHTML = 'Jupiter';
    document.getElementById('planetStats').innerHTML = 'Radius: 71492.0 KM</br>Distance From Sun: 5.2 AU</br>Type: Jovian Planet</br>Moons: 79'
  }

});


guiPlanetGlow.addColor(planetGlowControls, 'color').onChange(function(value) {
  planetSelection.getObjectByName('atmosphericGlow').material.uniforms.glowColor.value.setHex(value);
});
guiPlanetGlow.add(planetGlowControls, 'intensity', 0, 1).onChange(function(value) {
  planetSelection.getObjectByName('atmosphericGlow').material.uniforms['c'].value = value;
});
guiPlanetGlow.add(planetGlowControls, 'fade', 0, 50).onChange(function(value) {
  planetSelection.getObjectByName('atmosphericGlow').material.uniforms['p'].value = value;
});



guiCamera.add(cameraControls, 'speed', 0, 0.1).step(0.001).onChange(function(value) {
  cameraRotationSpeed = value;
});
guiCamera.add(cameraControls, 'orbitControls').onChange(function(value) {
  cameraAutoRotation = !value;
  orbitControls.enabled = value;
});

guiSurface.add(surfaceControls, 'rotation', 0, 6).onChange(function(value) {
  planetSelection.getObjectByName('surface').rotation.y = value;
});
guiSurface.add(surfaceControls, 'bumpScale', 0, 1).step(0.01).onChange(function(value) {
  planetSelection.getObjectByName('surface').material.bumpScale = value;
});
guiSurface.add(surfaceControls, 'shininess', 0, 30).onChange(function(value) {
  planetSelection.getObjectByName('surface').material.shininess = value;
});


guiAtmosphere.add(atmosphereControls, 'opacity', 0, 1).onChange(function(value) {
  planetSelection.getObjectByName('atmosphere').material.opacity = value;
});





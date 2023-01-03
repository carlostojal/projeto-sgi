let canvas = document.getElementById("product-view-canvas")
let renderer = new THREE.WebGLRenderer({canvas, antialias: true})

let sceneLoaded = false;

const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 1000;

let camera = new THREE.PerspectiveCamera( fov, aspect, near, far )

let scene = new THREE.Scene()
scene.background = new THREE.Color(0xE5E5DA)
let controls = new THREE.OrbitControls(camera, renderer.domElement)

let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
ambientLight.castShadow = true;

/*
let axes = new THREE.AxesHelper(10)
scene.add(axes)
let grid = new THREE.GridHelper()
scene.add(grid)
*/

let previewRelatedObjects = ['Floor', 'Wall', 'Wall001', 'Wall002', 'Base', 'Feet', 'Reader', 'Vinyl', 'VinylBase', 'Lamp_model', 'Plant', 'Ceiling', 'Lamp'];

let previewToggler = document.getElementById('preview_toggle');
let previewEnabled = previewToggler.checked;

function filterPreviewObject(obj) {
        
    if(previewRelatedObjects.includes(obj.name)) {
        obj.visible = previewEnabled;
    }
}

function toggleAmbientLight() {
    if(!previewEnabled) {
        scene.add(ambientLight);
    } else {
        scene.remove(ambientLight);
    }
}

previewToggler.addEventListener('click', function() {

    previewEnabled = previewToggler.checked;

    toggleAmbientLight();

    scene.traverse((x) => {
        filterPreviewObject(x);

    });
});

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 4;
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.setPixelRatio(window.devicePixelRatio)

function downscaleBrightness(value) {
    return value / 100;
}

camera.position.x = 0
camera.position.y = 1
camera.position.z = 0
camera.lookAt(0,0,-3)

// display a loading alert
let alertInstance = alertify.alert("A carregar a pre-visualização do produto.<br>Aguarde por favor...").setting({
    'closable': false,
    'movable': false,
    'basic': true
}).show();

// load the blender scene exported as gltf
new THREE.GLTFLoader().load(
    'models/TV (copy).gltf',
    function ( gltf ) {

        alertInstance.close();

        scene.add( gltf.scene )

        scene.traverse( function(x) {

            toggleAmbientLight();
            filterPreviewObject(x);
            
            if(x.isLight) {
                x.castShadow = true;
                // x.intensity = downscaleBrightness(x.intensity);
                if(x.isPointLight) {
                    x.shadow.camera.near = 0.0001;
                    x.shadow.camera.far = 100;
                    x.distance = 100;

                    let shadowHelper = new THREE.PointLightHelper(x);
                    scene.add(shadowHelper)

                } else if(x.isSpotLight) {
                    x.shadow.camera.near = 0;
                    x.shadow.camera.far = 100;
                    x.intensity = 0;
                    x.distance = Infinity;
                }
            }

            if (x.isMesh) {
                x.castShadow = true
                x.receiveShadow = true			
            }

        })

        console.log(scene)
    }
)

toggleAmbientLight();
animate()

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function animate() {

    if(resizeRendererToDisplaySize(renderer)) {
        const c = renderer.domElement;
        camera.aspect = c.clientWidth / c.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render( scene, camera )

    requestAnimationFrame( animate )
}

function addLights(){
    const lightAmb = new THREE.AmbientLight( 0xffffff, 0.5); 
    scene.add( lightAmb );

    const lightDir = new THREE.DirectionalLight( 0xE5E5DA, 1 );
    lightDir.position.set(2,8,10)
    const dlHelper = new THREE.DirectionalLightHelper(lightDir, 1, 0xFF0000);
    scene.add(dlHelper);
    scene.add( lightDir );
}


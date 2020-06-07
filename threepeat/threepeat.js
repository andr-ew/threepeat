import * as THREE from './three/build/three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js'
import { MaskPass } from './three/examples/jsm/postprocessing/MaskPass.js'
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenShader } from './three/examples/jsm/shaders/DotScreenShader.js'
import { RGBShiftShader } from './three/examples/jsm/shaders/RGBShiftShader.js'
import Stats from './three/examples/jsm/libs/stats.module.js';


var w = window;
w.ll = 10;
w.fps = 60;
w.t = 0;

var threecap = new THREEcap();

var scene, camera, renderer, stats, composer, capture;

w.record = function(format, fps, size, reset) {
    var format = format || 'mp4';
    var fps = fps || 60;
    var size = size || 1;
    var reset = reset || true;
    
    var rec = function() {
        w.t = 0;
        
        capture.record({
            width: window.innerWidth * size,
            height: window.innerHeight * size,
            fps: fps,
            time: window.ll,
            format: format,
            composer: composer
        }).then(function(video) {
            video.saveFile(Date.now() + '.' + format);
            window.location.reload();
        });
    }
    
//    if(reset) main(w.init, w.update, rec);
//    else rec();
    
    rec();
}

w.r = w.record;

w.init = function() {
    main(init, update);
}

function threepeat(init, done) {
    w.init = init;
    
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor( 0x0000ff, 1);
    
    scene.background = null;
    
    var stats = new Stats();
    document.body.appendChild( stats.dom );
    
    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera) );


    var effect = new ShaderPass( RGBShiftShader );
    effect.renderToScreen = false;
    composer.addPass( effect );

    capture = new THREEcap({composer: composer, scriptbase: './threepeat/threecap/'});
    
    var earlier = ( performance || Date ).now();
    var ms = 0;
    
    var animate = function() {
        requestAnimationFrame( animate );
        
        if(ms < w.ll * 1000) {
            let now = ( performance || Date ).now();
            
            ms += now - earlier;
            earlier = now;
            
        } else ms = 0;
        
        w.t = ms / w.ll / 1000;
        update(w.t);

        stats.update();
        renderer.render( scene, camera );
        composer.render();
    };
    
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    });
    
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.composer = composer;
    
    w.update = init(scene, camera, renderer);
    animate();
    if(done) done();
}

export { threepeat }
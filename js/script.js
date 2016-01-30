// - sea flower ---------------------------------------------------------------
//
// tokyo demo fest 2016.
//
// ----------------------------------------------------------------------------

/*global gl3*/

(function(){
    'use strict';

    // variable ===============================================================
    var canvas, gl, run, mat4, qtn;
    var canvasPoint, canvasGlow, canvasText;
    var canvasFont, canvasFontCtx, canvasFontWidth;
    var prg, nPrg, gPrg, sPrg, pPrg, fPrg, ptPrg;
    var gWeight;
    var canvasWidth, canvasHeight;

    // variable initialize ====================================================
    run = true;
    mat4 = gl3.mat4;
    qtn = gl3.qtn;

    // const variable =========================================================
    var TITLE_FONT = '220px Seaweed Script';
    var OTHER_FONT = '100px Seaweed Script';
    var DEFAULT_CAM_POSITION = [0.0, 5.0, 5.0];
    var DEFAULT_CAM_CENTER   = [0.0, 0.0, 0.0];
    var DEFAULT_CAM_UP       = cameraUpVector(DEFAULT_CAM_POSITION, DEFAULT_CAM_CENTER);
    var FLOOR_SIZE = 256.0;
    var PARTICLE_FLOOR_SIZE = 32.0;
    var PARTICLE_FLOOR_WIDTH = 512.0;

    // text width
    canvasFont = document.createElement('canvas');
    canvasFontCtx = canvasFont.getContext('2d');
    canvasFontCtx.font = TITLE_FONT;
    canvasFontWidth = canvasFontCtx.measureText('a').width;

    // onload =================================================================
    window.onload = function(){
        // gl3 initialize
        gl3.initGL('canvas');
        if(!gl3.ready){console.log('initialize error'); return;}
        canvas = gl3.canvas; gl = gl3.gl;
        canvas.width  = canvasWidth = window.innerWidth;
        canvas.height = canvasHeight = window.innerHeight;

        // event
        window.addEventListener('keydown', function(eve){
            run = (eve.keyCode !== 27);
            switch(eve.keyCode){
                case 13:
                    fullscreenRequest();
                    break;
                case 27:
                    gl3.audio.src[0].stop();
                    break;
                case 32:
                    gl3.audio.src[1].play();
                    break;
                default :
                    break;
            }
        }, true);

        // resource canvas
        canvasDraw();
    };

    function canvasDrawPoint(){
        var i, j, p, center;
        var c = document.createElement('canvas');
        var cx = c.getContext('2d');
        p = Math.PI * 2;
        c.width = c.height = 512;
        center = [c.width / 2, c.height / 2];
        cx.fillStyle = 'white';
        cx.strokeStyle = 'white';
        cx.shadowColor = 'white';
        cx.clearRect(0, 0, c.width, c.height);
        cx.shadowOffsetX = 512;
        cx.shadowOffsetY = 512;
        cx.beginPath();
        for(i = -1; i < 5; ++i){
            j = 20 - Math.pow(2, i);
            cx.shadowBlur = j;
            cx.arc(center[0] - 512, center[1] - 512, 200, 0, p);
            cx.stroke();
        }
        cx.closePath();
        cx.beginPath();
        cx.shadowOffsetX = 0;
        cx.shadowOffsetY = 0;
        for(i = -1; i < 6; ++i){
            j = 32 - Math.pow(2, i);
            cx.shadowBlur = j;
            cx.arc(center[0], center[1], 75, 0, p);
            cx.fill();
        }
        cx.shadowBlur = 0;
        cx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        cx.arc(center[0], center[1], 200, 0, p);
        cx.fill();
        cx.closePath();
        c.id = 'point';
        return c;
    }

    function canvasDrawGlow(){
        var i, j, center;
        var c = document.createElement('canvas');
        var cx = c.getContext('2d');
        c.width = c.height = 512;
        center = [c.width / 2, c.height / 2];
        cx.fillStyle = 'white';
        cx.shadowColor = 'white';
        cx.clearRect(0, 0, c.width, c.height);
        cx.beginPath();
        for(i = -1; i < 7; ++i){
            j = 100 - Math.pow(2, i);
            cx.shadowBlur = j;
            cx.arc(center[0], center[1], 150, 0, Math.PI * 2);
            cx.fill();
        }
        cx.closePath();
        c.id = 'glow';
        return c;
    }

    function canvasDrawText(){
        var i, j, center;
        var c = document.createElement('canvas');
        var cx = c.getContext('2d');
        c.width = c.height = 1024;
        center = [c.width / 2, c.height / 2];
        cx.fillStyle = 'white';
        cx.shadowColor = 'white';
        cx.shadowBlur = 10;
        cx.clearRect(0, 0, c.width, c.height);

        cx.font = TITLE_FONT;
        cx.textAlign = 'center';
        cx.textBaseline = 'top';
        cx.fillText('SeaFlower', 512, 0, 1024);
        cx.fillText('dom-t', 512, 256, 1024);
        cx.font = OTHER_FONT;
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText('PROGRAM : DOXAS', 512, 640, 1024);
        cx.fillText('MUSIC : UKA-CHAN', 512, 896, 1024);
        return c;
    }

    function canvasDraw(){
        canvasPoint = canvasDrawPoint();
        canvasGlow = canvasDrawGlow();
        fontCheck();
        function fontCheck(){
            var w = canvasFontCtx.measureText('a').width;
            if(w === canvasFontWidth){
                setTimeout(fontCheck, 100);
            }else{
                canvasText = canvasDrawText();
                textureGenerate();
            }
        }
    }

    function textureGenerate(){
        gl3.create_texture_canvas(canvasPoint, 0);
        gl3.create_texture_canvas(canvasGlow, 1);
        gl3.create_texture_canvas(canvasText, 2);
        gl3.create_texture('img/test.jpg', 3, soundLoader);
    }

    function soundLoader(){
        gl3.audio.init(0.5, 0.5);
        gl3.audio.load('snd/background.mp3', 0, true, true, soundLoadCheck);
        gl3.audio.load('snd/sound.mp3', 1, false, false, soundLoadCheck);

        function soundLoadCheck(){
            if(gl3.audio.loadComplete()){
                shaderLoader();
            }
        }
    }

    function shaderLoader(){
        // programs
        prg = gl3.program.create_from_file(
            'shader/phong.vert',
            'shader/phong.frag',
            ['position', 'normal', 'color', 'texCoord'],
            [3, 3, 4, 2],
            ['mvpMatrix', 'invMatrix', 'lightDirection', 'eyePosition', 'centerPoint', 'ambient', 'texture'],
            ['matrix4fv', 'matrix4fv', '3fv', '3fv', '3fv', '4fv', '1i'],
            shaderLoadCheck
        );

        // noise program
        nPrg = gl3.program.create_from_file(
            'shader/noise.vert',
            'shader/noise.frag',
            ['position'],
            [3],
            ['resolution'],
            ['2fv'],
            shaderLoadCheck
        );

        // gauss program
        gPrg = gl3.program.create_from_file(
            'shader/gaussian.vert',
            'shader/gaussian.frag',
            ['position'],
            [3],
            ['resolution', 'horizontal', 'weight', 'texture'],
            ['2fv', '1i', '1fv', '1i'],
            shaderLoadCheck
        );

        // sobel program
        sPrg = gl3.program.create_from_file(
            'shader/sobel.vert',
            'shader/sobel.frag',
            ['position'],
            [3],
            ['resolution', 'hWeight', 'vWeight', 'texture'],
            ['2fv', '1fv', '1fv', '1i'],
            shaderLoadCheck
        );

        // point program
        pPrg = gl3.program.create_from_file(
            'shader/point.vert',
            'shader/point.frag',
            ['position', 'texCoord'],
            [3, 2],
            ['mvpMatrix', 'vertTexture', 'time', 'globalColor', 'texture'],
            ['matrix4fv', '1i', '1f', '4fv', '1i'],
            shaderLoadCheck
        );

        // particle program
        ptPrg = gl3.program.create_from_file(
            'shader/particle.vert',
            'shader/particle.frag',
            ['position', 'wave'],
            [3, 4],
            ['mvpMatrix', 'time', 'depthRange', 'pointSize', 'globalColor', 'texture'],
            ['matrix4fv', '1f', '1f', '1f', '4fv', '1i'],
            shaderLoadCheck
        );

        // final program
        fPrg = gl3.program.create_from_file(
            'shader/final.vert',
            'shader/final.frag',
            ['position'],
            [3],
            ['globalColor', 'texture'],
            ['4fv', '1i'],
            shaderLoadCheck
        );

        function shaderLoadCheck(){
            if( prg.prg != null &&
               nPrg.prg != null &&
               gPrg.prg != null &&
               sPrg.prg != null &&
               pPrg.prg != null &&
               ptPrg.prg != null &&
               fPrg.prg != null
            ){init();}
        }
    }

    function init(){
        // application setting
        gWeight = gaussWeight(10, 100.0);
        var hWeight = [
             1.0,  0.0, -1.0,
             2.0,  0.0, -2.0,
             1.0,  0.0, -1.0
        ];
        var vWeight = [
             1.0,  2.0,  1.0,
             0.0,  0.0,  0.0,
            -1.0, -2.0, -1.0
        ];

        // torus mesh
        var torusData = gl3.mesh.torus(64, 64, 0.075, 0.2, [1.0, 1.0, 1.0, 1.0]);
        var torusVBO = [
            gl3.create_vbo(torusData.position),
            gl3.create_vbo(torusData.normal),
            gl3.create_vbo(torusData.color),
            gl3.create_vbo(torusData.texCoord)
        ];
        var torusIBO = gl3.create_ibo(torusData.index);

        // plane mesh
        var planePosition = [
            -1.0,  1.0,  0.0,
             1.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        var planeIndex = [
            0, 2, 1, 1, 2, 3
        ];
        var planeVBO = [gl3.create_vbo(planePosition)];
        var planeIBO = gl3.create_ibo(planeIndex);

        // floor
        var floorPosition = [];
        var floorTexCoord = [];
        (function(size, height, interval){
            var i, j, k, l;
            var u, v;
            var scale = size / 2.0;
            for(i = 0.0; i <= size; ++i){
                k = (i - scale) * interval;
                u = i / size;
                for(j = 0.0; j <= size; ++j){
                    l = (j - scale) * interval;
                    v = 1.0 - j / size;
                    floorPosition.push(k, height, l);
                    floorTexCoord.push(u, v);
                }
            }
        })(FLOOR_SIZE, 0.0, 2.0 / FLOOR_SIZE);
        var floorVBO = [
            gl3.create_vbo(floorPosition),
            gl3.create_vbo(floorTexCoord)
        ];

        // particle
        var particlePosition = [];
        var particleWave = [];
        (function(size, width, heightRange, baseHeight){
            var i, j;
            var x, y, z;
            var r = Math.random;
            var halfWidth = width / 2.0;
            var halfHeight = heightRange / 2.0;
            for(i = 0; i < size; ++i){
                for(j = 0; j < size; ++j){
                    x = r() * width * 4.0 - width * 2.0;
                    y = r() * heightRange - halfHeight + baseHeight;
                    z = r() * width - halfWidth;
                    particlePosition.push(x, y, z);
                    particleWave.push(r(), r(), r() * 60.0 - 30.0, r() * 60.0 - 30.0);
                }
            }
        })(PARTICLE_FLOOR_SIZE, PARTICLE_FLOOR_WIDTH, PARTICLE_FLOOR_WIDTH, 0.0);
        var particleVBO = [
            gl3.create_vbo(particlePosition),
            gl3.create_vbo(particleWave)
        ];

        // matrix
        var mMatrix = mat4.identity(mat4.create());
        var vMatrix = mat4.identity(mat4.create());
        var pMatrix = mat4.identity(mat4.create());
        var vpMatrix = mat4.identity(mat4.create());
        var mvpMatrix = mat4.identity(mat4.create());
        var invMatrix = mat4.identity(mat4.create());
        var particleMatrix = mat4.identity(mat4.create());

        // frame buffer
        var bufferSize = 512;
        var frameBuffer  = gl3.create_framebuffer(bufferSize, bufferSize, 4);
        var noiseBuffer  = gl3.create_framebuffer(bufferSize, bufferSize, 5);
        var sobelBuffer  = gl3.create_framebuffer(bufferSize, bufferSize, 6);
        var hGaussBuffer = gl3.create_framebuffer(bufferSize, bufferSize, 7);
        var vGaussBuffer = gl3.create_framebuffer(bufferSize, bufferSize, 8);

        // texture setting
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[0].texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[1].texture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[2].texture);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[4].texture);
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[5].texture);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[6].texture);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[7].texture);
        gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[8].texture);

        // noise texture
        nPrg.set_program();
        nPrg.set_attribute(planeVBO, planeIBO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, noiseBuffer.framebuffer);
        gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
        gl3.scene_view(null, 0, 0, bufferSize, bufferSize);
        nPrg.push_shader([[bufferSize, bufferSize]]);
        gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

        // gl flags
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1.0);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE. gl.ONE);

        // rendering
        var count = 0;
        var beginTime = Date.now();
        var lightDirection = [1.0, 1.0, 1.0];
        gl3.audio.src[0].play();
        render();
        function render(){
            var i;
            var nowTime = Date.now() - beginTime;
            nowTime /= 1000;
            count++;

            // sound data
            gl3.audio.src[0].update = true;
            var soundData = [];
            for(i = 0; i < 16; ++i){
                soundData[i] = gl3.audio.src[0].onData[i] / 255.0 + 0.5;
            }

            // canvas
            canvasWidth   = window.innerWidth;
            canvasHeight  = window.innerHeight;
            canvas.width  = canvasWidth;
            canvas.height = canvasHeight;

            // perspective projection
            var aspect = canvasWidth / canvasHeight;
            var cameraPosition    = DEFAULT_CAM_POSITION;
            var centerPoint       = DEFAULT_CAM_CENTER;
            var cameraUpDirection = DEFAULT_CAM_UP;
            var camera = gl3.camera.create(
                cameraPosition,
                centerPoint,
                cameraUpDirection,
                60, aspect, 1.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);

            // particle matrix
            gl3.mat4.lookAt([0.0, 0.0, PARTICLE_FLOOR_WIDTH / 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
            gl3.mat4.perspective(60, aspect, 0.1, PARTICLE_FLOOR_WIDTH * 2.0, pMatrix);
            gl3.mat4.multiply(pMatrix, vMatrix, particleMatrix);

            // render to frame buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.framebuffer);
            var clearColor = gl3.util.hsva(count % 360, 0.7, 0.5, 1.0);
            gl3.scene_clear(clearColor, 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);

            // off screen - point floor
            // gl.disable(gl.DEPTH_TEST);
            // gl.depthMask(true);
            // pPrg.set_program();
            // pPrg.set_attribute(floorVBO, null);
            // mat4.identity(mMatrix);
            // mat4.scale(mMatrix, [25.0, 1.0, 25.0], mMatrix);
            // mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            // pPrg.push_shader([mvpMatrix, 5, nowTime, [1.0, 1.0, 1.0, 1.0], 0]);
            // gl3.draw_arrays(gl.POINTS, floorPosition.length / 3);

            // off screen - torus
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(false);
            prg.set_program();
            prg.set_attribute(torusVBO, torusIBO);

            // torus
            var radian = gl3.TRI.rad[count % 360];
            var axis = [0.0, 1.0, 1.0];
            for(i = 0; i < 15; i++){
                var s = gl3.TRI.sin[i * 24] * soundData[i];
                var c = gl3.TRI.cos[i * 24] * soundData[i];
                var offset = [c, s, 0.0];
                var ambient = gl3.util.hsva(i * 24, 1.0, 1.0, 1.0);
                mat4.identity(mMatrix);
                mat4.translate(mMatrix, offset, mMatrix);
                mat4.rotate(mMatrix, radian, axis, mMatrix);
                mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
                mat4.inverse(mMatrix, invMatrix);
                prg.push_shader([mvpMatrix, invMatrix, lightDirection, cameraPosition, centerPoint, ambient, 5]);
                gl3.draw_elements(gl.TRIANGLES, torusData.index.length);
            }

            // sobel render to gauss buffer
            sPrg.set_program();
            sPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, sobelBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);
            sPrg.push_shader([[bufferSize, bufferSize], hWeight, vWeight, 4]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

            // horizon gauss render to fBuffer
            gPrg.set_program();
            gPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, hGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);
            gPrg.push_shader([[bufferSize, bufferSize], true, gWeight, 6]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

            // vertical gauss render to fBuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, vGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);
            gPrg.push_shader([[bufferSize, bufferSize], false, gWeight, 7]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

            // final scene
            fPrg.set_program();
            fPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            fPrg.push_shader([[1.0, 1.0, 1.0, 1.0], 4]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            fPrg.push_shader([[1.0, 1.0, 1.0, 0.5], 8]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

            // off screen - particle wave
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(true);
            ptPrg.set_program();
            ptPrg.set_attribute(particleVBO, null);
            ptPrg.push_shader([particleMatrix, nowTime, PARTICLE_FLOOR_WIDTH / 2.0, 64.0, [0.3, 0.8, 1.0, 0.8], 1]);
            gl3.draw_arrays(gl.POINTS, particlePosition.length / 3);

            if(run){requestAnimationFrame(render);}
        }
    }

    function gaussWeight(resolution, power){
        var t = 0.0;
        var weight = [];
        for(var i = 0; i < resolution; i++){
            var r = 1.0 + 2.0 * i;
            var w = Math.exp(-0.5 * (r * r) / power);
            weight[i] = w;
            if(i > 0){w *= 2.0;}
            t += w;
        }
        for(i = 0; i < weight.length; i++){
            weight[i] /= t;
        }
        return weight;
    }

    function cameraUpVector(pos, center){
        var n = gl3.vec3.normalize([
            pos[0] - center[0],
            pos[1] - center[1],
            pos[2] - center[2]
        ]);
        return gl3.vec3.cross(n, [1.0, 0.0, 0.0]);
    }

    function fullscreenRequest(){
        var b = document.body;
        if(b.requestFullscreen){
            b.requestFullscreen();
        }else if(b.webkitRequestFullscreen){
            b.webkitRequestFullscreen();
        }else if(b.mozRequestFullscreen){
            b.mozRequestFullscreen();
        }else if(b.msRequestFullscreen){
            b.msRequestFullscreen();
        }
    }
})(this);


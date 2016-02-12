// - sea flower ---------------------------------------------------------------
//
// tokyo demo fest 2016.
//
// ----------------------------------------------------------------------------

/*global gl3*/

(function(){
    'use strict';

    // variable ===============================================================
    var canvas, gl, run, mat4, qtn, ext;
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
    var DEFAULT_CAM_POSITION = [0.1, 5.0, 10.0];
    var DEFAULT_CAM_CENTER   = [0.0, 0.0, 0.0];
    var DEFAULT_CAM_UP       = cameraUpVector(DEFAULT_CAM_POSITION, DEFAULT_CAM_CENTER);
    var FLOOR_SIZE = 512.0;
    var PARTICLE_FLOOR_SIZE = 32.0;
    var PARTICLE_FLOOR_WIDTH = 512.0;
    var INSTANCE_COUNT = 50;

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

        // ext
        ext = gl.getExtension('ANGLE_instanced_arrays');
        if(ext == null){
            alert('ANGLE_instanced_arrays not supported');
            return;
        }

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
            'shader/base.vert',
            'shader/base.frag',
            ['position', 'normal', 'iPosition', 'iColor', 'iFlag'],
            [3, 3, 3, 4, 4],
            ['mvpMatrix', 'globalColor'],
            ['matrix4fv', '4fv'],
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

        // point program
        pPrg = gl3.program.create_from_file(
            'shader/point.vert',
            'shader/point.frag',
            ['position', 'texCoord'],
            [3, 2],
            ['mMatrix', 'mvpMatrix', 'eyePosition', 'vertTexture', 'time', 'globalColor', 'texture'],
            ['matrix4fv', 'matrix4fv', '3fv', '1i', '1f', '4fv', '1i'],
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
               pPrg.prg != null &&
               ptPrg.prg != null &&
               fPrg.prg != null
            ){init();}
        }
    }

    function init(){
        // application setting
        gWeight = gaussWeight(10, 50.0);

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

        // seaflower
        var seaPosition = [];
        var seaNormal = [];
        var seaIndices = [];
        (function(rad, corerad, row, col){
            var i, j, k, l, m, n, o, p;
            var x, y, z, tr, tx, ty, tz;
            k = Math.PI; l = k / 2.0;
            p = 0;
            seaPosition.push(0.0, 0.0, 0.0);
            seaNormal.push(0.0, 0.0, 0.0);
            for(i = 0; i < col; ++i){
                for(j = 0; j < col; ++j){
                    m = Math.random(); n = Math.random();
                    o = n * k * 2.0;
                    tr = Math.cos(l + m * k);
                    tx = Math.sin(o) * tr;
                    ty = Math.sin(l + m * k);
                    tz = Math.cos(o) * tr;
                    seaNormal.push(tx, ty, tz);
                    seaPosition.push(tx * corerad, ty * corerad, tz * corerad);
                    p++;
                    seaIndices.push(0, p); // LINES
                }
            }
            k = Math.PI / col;
            l = Math.PI / row;
            m = Math.PI / 2.0;
            for(i = 0; i < col; i += 2){
                x  = Math.cos(k * i);
                tx = Math.cos(k * (i + 1));
                z  = Math.sin(k * i);
                tz = Math.sin(k * (i + 1));
                for(j = 0; j < row; ++j){
                    tr = Math.sin(l * j);
                    y = Math.sin(l * j - m);
                    ty = y * rad;
                    seaNormal.push( x * tr, y,  z * tr);
                    seaNormal.push(tx * tr, y, tz * tr);
                    seaPosition.push( x * tr * rad, ty,  z * tr * rad);
                    seaPosition.push(tx * tr * rad, ty, tz * tr * rad);
                    o = seaPosition.length;
                    seaNormal.push(
                        -seaNormal[o - 6], y, -seaNormal[o - 4],
                        -seaNormal[o - 3], y, -seaNormal[o - 1]
                    );
                    seaPosition.push(
                        -seaPosition[o - 6], ty, -seaPosition[o - 4],
                        -seaPosition[o - 3], ty, -seaPosition[o - 1]
                    );
                    seaIndices.push(p + 1, p + 2, p + 3, p + 4); // LINES
                    p += 4;
                }
            }
        })(2.0, 1.25, 256, 16); // need a col mod 2 === 0

        // instanced array
        var instanceCount = INSTANCE_COUNT;
        var instancePositions = [];
        var instanceColors = [];
        var instanceFlags = [];
        (function(size){
            var i, j, k, l;
            var r, x, z;
            var a = [];
            r = Math.random;
            for(i = 0; i < size; ++i){
                a[i] = [];
            }
            j = size / 2.0;
            for(i = 0; i < instanceCount; ++i){
                while(1){
                    x = Math.floor(r() * size);
                    z = Math.floor(r() * size);
                    if(a[x][z]){
                        continue;
                    }else{
                        a[x][z] = true;
                        break;
                    }
                }
                k = r() * 0.5 - 0.25;
                l = r() * 0.5 - 0.25;
                instancePositions.push(x - j + k, 0.0, z - j + l);
                var hsv = gl3.util.hsva(r() * 360, 1.0, 1.0, 1.0);
                instanceColors.push(hsv[0] + 0.05, hsv[1] + 0.05, hsv[2] + 0.05, hsv[3]);
                instanceFlags.push(r(), r(), r(), r());
            }
        })(FLOOR_SIZE);
        var seaVBO = [
            gl3.create_vbo(seaPosition),
            gl3.create_vbo(seaNormal),
            gl3.create_vbo(instancePositions),
            gl3.create_vbo(instanceColors),
            gl3.create_vbo(instanceFlags)
        ];
        var seaExt = [false, false, true, true, true];
        var seaIBO = gl3.create_ibo(seaIndices);

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
        var particleMatrix = mat4.identity(mat4.create());

        // quaternion
        var qt = qtn.identity(qtn.create());
        var tqt = qtn.identity(qtn.create());

        // frame buffer
        var bufferSize = 512;
        var frameBuffer  = gl3.create_framebuffer(bufferSize, bufferSize, 4);
        var noiseBuffer  = gl3.create_framebuffer(bufferSize, bufferSize, 5);
        var hGaussBuffer = gl3.create_framebuffer(bufferSize, bufferSize, 6);
        var vGaussBuffer = gl3.create_framebuffer(bufferSize, bufferSize, 7);

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
        var nowTime = 0;
        var cameraPosition = [];
        var centerPoint = [];
        var cameraUpDirection = [];
        var camera;
//        gl3.audio.src[0].play();

        render();
        function render(){
            var i;
            nowTime = (Date.now() - beginTime) / 1000;
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
            cameraPosition    = DEFAULT_CAM_POSITION;
            centerPoint       = DEFAULT_CAM_CENTER;
            cameraUpDirection = DEFAULT_CAM_UP;
            qtn.identity(qt);
            qtn.rotate(gl3.TRI.rad[1], [0.0, 1.0, 0.0], qt);
            qtn.toVecIII(DEFAULT_CAM_POSITION, qt, cameraPosition);
            qtn.toVecIII(DEFAULT_CAM_UP, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition,
                centerPoint,
                cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);

            // particle matrix
            gl3.mat4.lookAt([0.0, 0.0, PARTICLE_FLOOR_WIDTH / 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
            gl3.mat4.perspective(60, aspect, 0.1, PARTICLE_FLOOR_WIDTH * 2.0, pMatrix);
            gl3.mat4.multiply(pMatrix, vMatrix, particleMatrix);

            // render to frame buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.framebuffer);
            var clearColor = [0.0, 0.0, 0.0, 1.0];
            gl3.scene_clear(clearColor, 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);

            pointFloor(cameraPosition, [50.0, 1.0, 50.0], [1.0, 1.0, 1.0, 1.0]);

            // off screen - torus
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(false);
            prg.set_program();
            set_attribute_angle(seaVBO, prg.attL, prg.attS, seaExt, seaIBO);
            mat4.identity(mMatrix);
            mat4.rotate(mMatrix, gl3.TRI.rad[(count % 360)], [0.0, 1.0, 0.0], mMatrix);
            mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            prg.push_shader([mvpMatrix, [1.0, 1.0, 1.0, 1.0]]);
//            ext.drawArraysInstancedANGLE(gl.POINTS, 0, seaPosition.length / 3, instanceCount);
//            ext.drawElementsInstancedANGLE(gl.LINES, seaIndices.length, gl.UNSIGNED_SHORT, 0, instanceCount);

            // horizon gauss render to fBuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, hGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);
            gaussHorizon();

            // vertical gauss render to fBuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, vGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, bufferSize, bufferSize);
            gaussVertical();

            // final scene
            fPrg.set_program();
            fPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            fPrg.push_shader([[1.0, 1.0, 1.0, 1.0], 4]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            fPrg.push_shader([[1.0, 1.0, 1.0, 0.5], 7]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

            // particle wave
//            gl.disable(gl.DEPTH_TEST);
//            gl.depthMask(true);
//            particleWaveRender(64.0, [0.3, 0.8, 1.0, 0.8]);

            if(run){requestAnimationFrame(render);}
        }

        // rendering sub function =============================================
        function set_attribute_angle(vbo, attL, attS, attExt, ibo){
            for(var i in vbo){
                if(attL[i] >= 0){
                    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
                    gl.enableVertexAttribArray(attL[i]);
                    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
                    if(attExt[i]){ext.vertexAttribDivisorANGLE(attL[i], 1);}
                }
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
        function pointFloor(eye, scale, color){
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(true);
            pPrg.set_program();
            pPrg.set_attribute(floorVBO, null);
            mat4.identity(mMatrix);
            mat4.scale(mMatrix, scale, mMatrix);
            mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            pPrg.push_shader([mMatrix, mvpMatrix, eye, 5, nowTime, color, 0]);
            gl3.draw_arrays(gl.POINTS, floorPosition.length / 3);
        }
        function particleWaveRender(size, color){
            ptPrg.set_program();
            ptPrg.set_attribute(particleVBO, null);
            ptPrg.push_shader([particleMatrix, nowTime, PARTICLE_FLOOR_WIDTH / 2.0, size, color, 1]);
            gl3.draw_arrays(gl.POINTS, particlePosition.length / 3);
        }
        function gaussHorizon(){
            gPrg.set_program();
            gPrg.set_attribute(planeVBO, planeIBO);
            gPrg.push_shader([[bufferSize, bufferSize], true, gWeight, 4]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        }
        function gaussVertical(){
            gPrg.push_shader([[bufferSize, bufferSize], false, gWeight, 6]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
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


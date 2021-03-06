// - sea flower ---------------------------------------------------------------
//
// tokyo demo fest 2016.
//
// ----------------------------------------------------------------------------

/*global gl3*/

(function(){
    'use strict';

    // variable ===============================================================
    var canvas, gl, run, mat4, qtn, ext, times;
    var canvasPoint, canvasGlow, canvasText;
    var canvasFont, canvasFontCtx, canvasFontWidth;
    var prg, nPrg, gPrg, pPrg, ePrg, lPrg, fPrg, ptPrg, gfPrg, guPrg, grPrg;
    var gWeight;
    var canvasWidth, canvasHeight;

    // variable initialize ====================================================
    run = true;
    mat4 = gl3.mat4;
    qtn = gl3.qtn;

    // const variable =========================================================
    var TITLE_FONT = '220px Seaweed Script';
    var OTHER_FONT = '100px Seaweed Script';
    var DEFAULT_CAM_POSITION = [0.0, 15.0, 20.0];
    var DEFAULT_CAM_CENTER   = [0.0, 0.0, 0.0];
    var DEFAULT_CAM_UP       = cameraUpVector(DEFAULT_CAM_POSITION, DEFAULT_CAM_CENTER);
    var FRAMEBUFFER_SIZE = 1024;
    var GPGPU_FRAMEBUFFER_SIZE = 256;
    var SMALL_FRAMEBUFFER_SIZE = 64;
    var FLOWER_SIZE = 2.0;
    var ALGAE_SIZE = 2.0;
    var FLOWER_MAP_SIZE = 20.0;
    var FLOOR_SIZE = 512.0;
    var PARTICLE_FLOOR_SIZE = 32.0;
    var PARTICLE_FLOOR_WIDTH = 512.0;
    var INSTANCE_COUNT = 100;

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
        ext = gl.getExtension('OES_texture_float');
        if(ext == null){
            alert('OES_texture_float not supported');
            return;
        }
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
                    console.log(times);
                    break;
                case 32:
                    // gl3.audio.src[1].play();
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
        var center;
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
        gl3.audio.load('snd/bgm.mp3', 0, false, true, shaderLoader);
    }

    function shaderLoader(){
        // programs
        prg = gl3.program.create_from_file(
            'shader/base.vert',
            'shader/base.frag',
            ['position', 'normal', 'disc', 'color', 'iPosition', 'iColor', 'iFlag'],
            [3, 3, 3, 4, 3, 4, 4],
            ['rMatrix', 'mMatrix', 'mvpMatrix', 'eyePosition', 'time', 'mode', 'globalColor', 'resolution', 'isMono'],
            ['matrix4fv', 'matrix4fv', 'matrix4fv', '3fv', '1f', '1i', '4fv', '2fv', '1i'],
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
            ['position'],
            [3],
            ['mMatrix', 'mvpMatrix', 'eyePosition', 'vertTexture', 'height', 'time', 'globalColor', 'pointSize'],
            ['matrix4fv', 'matrix4fv', '3fv', '1i', '1f', '1f', '4fv', '1f'],
            shaderLoadCheck
        );

        // layer program
        lPrg = gl3.program.create_from_file(
            'shader/layer.vert',
            'shader/layer.frag',
            ['position'],
            [3],
            ['globalColor'],
            ['4fv'],
            shaderLoadCheck
        );

        // layer effect program
        ePrg = gl3.program.create_from_file(
            'shader/layer_effect.vert',
            'shader/layer_effect.frag',
            ['position'],
            [3],
            ['mode', 'resolution', 'firstColor', 'secondColor'],
            ['1i', '1f', '4fv', '4fv'],
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

        // gpgpu first program
        gfPrg = gl3.program.create_from_file(
            'shader/gpgpu_first.vert',
            'shader/gpgpu_first.frag',
            ['position'],
            [3],
            ['size', 'mode'],
            ['1f', '1i'],
            shaderLoadCheck
        );

        // gpgpu update program
        guPrg = gl3.program.create_from_file(
            'shader/gpgpu_update.vert',
            'shader/gpgpu_update.frag',
            ['position'],
            [3],
            ['mode', 'resolution', 'target', 'power', 'speed', 'velocityTexture', 'positionTexture'],
            ['1i', '1f', '3fv', '1f', '1f', '1i', '1i'],
            shaderLoadCheck
        );

        // gpgpu render program
        grPrg = gl3.program.create_from_file(
            'shader/gpgpu_render.vert',
            'shader/gpgpu_render.frag',
            ['index'],
            [1],
            ['mvpMatrix', 'resolution', 'pointScale', 'positionTexture', 'texture', 'globalColor'],
            ['matrix4fv', '1f', '1f', '1i', '1i', '4fv'],
            shaderLoadCheck
        );

        // final program
        fPrg = gl3.program.create_from_file(
            'shader/final.vert',
            'shader/final.frag',
            ['position'],
            [3],
            ['globalColor', 'texture', 'noise', 'mode', 'time'],
            ['4fv', '1i', '1i', '1i', '1f'],
            shaderLoadCheck
        );

        function shaderLoadCheck(){
            if( prg.prg  != null &&
               nPrg.prg  != null &&
               gPrg.prg  != null &&
               pPrg.prg  != null &&
               lPrg.prg  != null &&
               ePrg.prg  != null &&
               ptPrg.prg != null &&
               gfPrg.prg != null &&
               guPrg.prg != null &&
               grPrg.prg != null &&
               fPrg.prg  != null
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
        var seaDisc = [];
        var seaColor = [];
        var seaIndices = [];
        (function(rad, corerad, row, col){
            var i, j, k, l, m, n, o, p;
            var x, y, z, tr, tx, ty, tz;
            k = Math.PI; l = k / 2.0;
            p = 0;
            seaPosition.push(0.0, 0.0, 0.0);
            seaNormal.push(0.0, 0.0, 0.0);
            seaDisc.push(0.0, 0.0, 0.0);
            seaColor.push(5.0, 0.2, 0.5, 1.0);
            for(i = 0; i < col; ++i){
                for(j = 0; j < col; ++j){
                    m = Math.random(); n = Math.random();
                    o = n * k * 2.0;
                    tr = Math.cos(l + m * k);
                    tx = Math.sin(o) * tr;
                    ty = Math.sin(l + m * k);
                    tz = Math.cos(o) * tr;
                    seaNormal.push(tx, ty, tz);
                    seaDisc.push(0.0, 0.0, 0.0);
                    seaPosition.push(tx * corerad, ty * corerad, tz * corerad);
                    seaColor.push(10.0, 0.1, 0.6, 1.0);
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
                    seaDisc.push( x,  z, (y + 1.0) / 2.0);
                    seaDisc.push(tx, tz, (y + 1.0) / 2.0);
                    seaPosition.push( x * tr * rad, ty * 0.5,  z * tr * rad);
                    seaPosition.push(tx * tr * rad, ty * 0.5, tz * tr * rad);
                    o = seaPosition.length;
                    seaNormal.push(
                        -seaNormal[o - 6], y, -seaNormal[o - 4],
                        -seaNormal[o - 3], y, -seaNormal[o - 1]
                    );
                    seaDisc.push(
                        -seaDisc[o - 6], -seaDisc[o - 5], seaDisc[o - 4],
                        -seaDisc[o - 3], -seaDisc[o - 2], seaDisc[o - 1]
                    );
                    seaPosition.push(
                        -seaPosition[o - 6], seaPosition[o - 5], -seaPosition[o - 4],
                        -seaPosition[o - 3], seaPosition[o - 2], -seaPosition[o - 1]
                    );
                    seaColor.push(
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0,
                        1.0, 1.0, 1.0, 1.0
                    );
                    seaIndices.push(p + 1, p + 2, p + 3, p + 4); // LINES
                    p += 4;
                }
            }
        })(FLOWER_SIZE, FLOWER_SIZE * 0.4, 64, 32); // need a col mod 2 === 0

        // instanced array
        var instanceCount = INSTANCE_COUNT;
        var instancePositions = [];
        var instanceColors = [];
        var instanceFlags = [];
        var instanceMap = [];
        (function(size){
            var i, j, k, l;
            var r, x, z;
            r = Math.random;
            for(i = 0; i < size; ++i){
                instanceMap[i] = [];
            }
            j = size / 2.0;
            for(i = 0; i < instanceCount; ++i){
                while(1){
                    x = Math.floor(r() * size);
                    z = Math.floor(r() * size);
                    if(instanceMap[x][z]){
                        continue;
                    }else{
                        instanceMap[x][z] = true;
                        x -= j;
                        z -= j;
                        break;
                    }
                }
                k = (r() - 0.5) * 2.0;
                l = (r() - 0.5) * 2.0;
                instancePositions.push(x * 2.0 * FLOWER_SIZE + k, 0.0, z * 2.0 * FLOWER_SIZE + l);
                var hsv = gl3.util.hsva(r() * 80 + 190, 1.0, 0.5, 1.0);
                instanceColors.push(hsv[0] + 0.1, hsv[1] + 0.1, hsv[2] + 0.1, hsv[3]);
                instanceFlags.push(r(), r(), r(), r());
            }
        })(FLOWER_MAP_SIZE);
        var seaVBO = [
            gl3.create_vbo(seaPosition),
            gl3.create_vbo(seaNormal),
            gl3.create_vbo(seaDisc),
            gl3.create_vbo(seaColor),
            gl3.create_vbo(instancePositions),
            gl3.create_vbo(instanceColors),
            gl3.create_vbo(instanceFlags)
        ];
        var seaExt = [false, false, false, false, true, true, true];
        var seaIBO = gl3.create_ibo(seaIndices);

        // algae
        var algaePosition = [];
        var algaeNormal = [];
        var algaeDisc = [];
        var algaeColor = [];
        var algaeIndices = [];
        (function(row, radius, height){
            var i, j, k, l;
            var x, y, z, r;
            j = 1.0 / row;
            l = height / row;
            for(i = 0; i < row; ++i){
                y = j * i;
                x = Math.cos(y * gl3.PI2);
                z = Math.sin(y * gl3.PI2);
                r = Math.sin(y * gl3.PI) * radius;
                algaePosition.push(0.0, l * i, 0.0);
                algaeNormal.push(0.0, 0.0, 0.0);
                algaeDisc.push(0.0, y, 0.0);
                algaeColor.push(1.0, 1.0, 1.0, 1.0);
                algaePosition.push(x * r, l * i, z * r, -x * r, l * i, -z * r);
                algaeNormal.push(x, 0.0, z, -x, 0.0, -z);
                algaeDisc.push(0.0, y, 0.0, 0.0, y, 0.0);
                algaeColor.push(1.0, 1.5, 1.0, 1.0, 1.0, 1.5, 1.0, 1.0);
                k = i * 3;
                algaeIndices.push(k, k + 1, k, k + 2);
            }
        })(96, 0.75, 10.0);

        // instance
        var iAlgaePositions = [];
        var iAlgaeColors = [];
        var iAlgaeFlags = [];
        (function(size){
            var i, j, k, l;
            var r, x, z;
            r = Math.random;
            j = size / 2.0;
            for(i = 0; i < instanceCount; ++i){
                while(1){
                    x = Math.floor(r() * size);
                    z = Math.floor(r() * size);
                    if(instanceMap[x][z]){
                        continue;
                    }else{
                        instanceMap[x][z] = true;
                        x -= j;
                        z -= j;
                        break;
                    }
                }
                k = (r() - 0.5) * 2.0;
                l = (r() - 0.5) * 2.0;
                iAlgaePositions.push(x * 2.0 * ALGAE_SIZE + k, 0.0, z * 2.0 * ALGAE_SIZE + l);
                var hsv = gl3.util.hsva(r() * 120 + 30, 1.0, 0.5, 1.0);
                iAlgaeColors.push(hsv[0] + 0.1, hsv[1] + 0.1, hsv[2] + 0.1, hsv[3]);
                iAlgaeFlags.push(r(), r(), r(), r());
            }
        })(FLOWER_MAP_SIZE);
        var algaeVBO = [
            gl3.create_vbo(algaePosition),
            gl3.create_vbo(algaeNormal),
            gl3.create_vbo(algaeDisc),
            gl3.create_vbo(algaeColor),
            gl3.create_vbo(iAlgaePositions),
            gl3.create_vbo(iAlgaeColors),
            gl3.create_vbo(iAlgaeFlags)
        ];
        var algaeIBO = gl3.create_ibo(algaeIndices);

        // floor
        var floorPosition = [];
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
                }
            }
        })(FLOOR_SIZE, 0.0, 2.0 / FLOOR_SIZE);
        var floorVBO = [gl3.create_vbo(floorPosition)];

        // gpgpu particle
        var gpgpuIndex = [];
        (function(size){
            var i, j, k;
            for(i = 0; i < size; ++i){
                k = i * size;
                for(j = 0; j < size; ++j){
                    gpgpuIndex.push(j + k);
                }
            }
        })(GPGPU_FRAMEBUFFER_SIZE);
        var gpgpuVBO = [gl3.create_vbo(gpgpuIndex)];

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
        var rotateMatrix = mat4.identity(mat4.create());

        // quaternion
        var qt = qtn.identity(qtn.create());
        var qtt = qtn.identity(qtn.create());
        var pqt  = qtn.identity(qtn.create());
        var pqtx = qtn.identity(qtn.create());
        var pqtz = qtn.identity(qtn.create());

        // frame buffer
        var frameBuffer  = gl3.create_framebuffer(FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, 4);
        var noiseBuffer  = gl3.create_framebuffer(FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, 5);
        var hGaussBuffer = gl3.create_framebuffer(FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, 6);
        var vGaussBuffer = gl3.create_framebuffer(FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, 7);
        var smallBuffer  = gl3.create_framebuffer(SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE, 8);
        var gpgpuVelocityBuffer = [
            {buffer: gl3.create_framebuffer_float(GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE, 9),  textureIndex: 9},
            {buffer: gl3.create_framebuffer_float(GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE, 10), textureIndex: 10}
        ];
        var gpgpuPositionBuffer = [
            {buffer: gl3.create_framebuffer_float(GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE, 11), textureIndex: 11},
            {buffer: gl3.create_framebuffer_float(GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE, 12), textureIndex: 12}
        ];
        var activeVertexIndex = 0;
        var passiveVertexIndex = 1;
        var activeVelocityBuffer = gpgpuVelocityBuffer[activeVertexIndex].buffer;
        var activePositionBuffer = gpgpuPositionBuffer[activeVertexIndex].buffer;

        // texture setting
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[0].texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[1].texture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[2].texture);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[3].texture);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[4].texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[5].texture);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[6].texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[7].texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[8].texture);
        gl.activeTexture(gl.TEXTURE9);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[9].texture);
        gl.activeTexture(gl.TEXTURE10);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[10].texture);
        gl.activeTexture(gl.TEXTURE11);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[11].texture);
        gl.activeTexture(gl.TEXTURE12);
        gl.bindTexture(gl.TEXTURE_2D, gl3.textures[12].texture);

        // gl flags
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);

        // noise texture
        nPrg.set_program();
        nPrg.set_attribute(planeVBO, planeIBO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, noiseBuffer.framebuffer);
        gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
        gl3.scene_view(null, 0, 0, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);
        nPrg.push_shader([[FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE]]);
        gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

        // gpgpu texture
        gpgpuResetTexture(0);
        // gfPrg.set_program();
        // gfPrg.set_attribute(planeVBO, planeIBO);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, activeVelocityBuffer.framebuffer);
        // gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
        // gl3.scene_view(null, 0, 0, GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE);
        // gfPrg.push_shader([0.0, 2]);
        // gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, activePositionBuffer.framebuffer);
        // gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
        // gl3.scene_view(null, 0, 0, GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE);
        // gfPrg.push_shader([20.0, 3]);
        // gl3.draw_elements(gl.TRIANGLES, planeIndex.length);

        // rendering
        var count = 0;
        var aspect = 1.0;
        var soundData = [];
        var beginTime = Date.now();
        var tempTime = 0.0;
        var gpuUpdateFlag = false;
        var gpgpuAnimation = false;
        var cameraPosition = [];
        var centerPoint = [0.0, 0.0, 0.0];
        var cameraUpDirection = [];
        var camera;
        var particleTarget = [];
        var sceneFunctions = [];
        setTimeout(function(){gl3.audio.src[0].play();}, 2000);

        // rendering loop
        function render(){
            var i;
            updater();

            if(times < 68.5){
                switch(true){
                    case times < 2.0:
                        sceneFunctions[6](0.0);
                        clearRender(1.0 - times / 2.0);
                        break;
                    case times < 18.0:
                        sceneFunctions[6](Math.pow(soundData[0] + 0.01, 20.0) - 0.1);
                        break;
                    case times < 19.0:
                        sceneFunctions[6](Math.pow(soundData[0] + 0.01, 20.0) - 0.1);
                        clearRender(1.0 - (19.0 - times));
                        break;
                    case times < 25.0:
                        sceneFunctions[2](1.5 - soundData[7]);
                        clearRender((25.0 - times) / 6.0);
                        break;
                    case times < 32.05:
                        sceneFunctions[2](1.5 - soundData[7]);
                        break;
                    case times < 36.25:
                        i = (2.0 - (Math.cos((times - 32.05) * 4.0) + 1.0)) * 0.4;
                        sceneFunctions[2](1.5 - soundData[7] - i);
                        break;
                    case times < 53.05:
                        sceneFunctions[8]();
                        break;
                    case times < 61.5:
                        sceneFunctions[7]();
                        break;
                    case times < 68.5:
                        sceneFunctions[5](61.5);
                        break;
                }
            }else if(times < 129.0){
                switch(true){
                    case times < 71.0:
                        sceneFunctions[10]();
                        clearRender(null, [1.0, 1.0, 1.0, 1.0 - (times - 68.5) / 2.5]);
                        break;
                    case times < 91.0:
                        sceneFunctions[10]();
                        break;
                    case times < 112.25:
                        i = Math.min(Math.max(Math.sin(times - 91.0), -0.8), 0.2) + 0.8;
                        i = gl3.util.easeLiner(Math.pow(i, 2.0));
                        tempTime += i * 0.1;
                        sceneFunctions[11](i, tempTime);
                        break;
                    case times < 120.5:
                        sceneFunctions[22]();
                        break;
                    case times < 129.0:
                        sceneFunctions[23]();
                        break;
                }
            }else if(times < 162.75){
                switch(true){
                    case times < 137.67:
                        sceneFunctions[3](); // temp
                        break;
                    case times < 146.225:
                        sceneFunctions[20]();
                        break;
                    case times < 154.225:
                        sceneFunctions[21]();
                        break;
                    case times < 162.75:
                        sceneFunctions[10]();
                        break;
                }
            }else if(times < 210.0){
                switch(true){
                    case times < 186.75:
                        sceneFunctions[25]((Math.sin(times * 0.5) + 1.0) / 8.0 + 0.1, (times - 162.75) * 0.25);
                        break;
                    case times < 195.5:
                        sceneFunctions[3]();
                        break;
                    case times < 200.0:
                        sceneFunctions[4]();
                        break;
                    case times < 208.0:
                        sceneFunctions[4]();
                        clearRender(null, [0.0, 0.0, 0.0, (times - 200.0) / 8.0]);
                        break;
                    case times < 209.0:
                        sceneFunctions[4]();
                        clearRender(null, [0.0, 0.0, 0.0, 1.0]);
                        break;
                    default:
                        run = false;
                        break;
                }
            // }else{
            //     sceneFunctions[25]((Math.sin(times) + 1.0) / 8.0 + 0.1, (times - 300.0)); // @@@
            }

            gl.flush();
            if(run){requestAnimationFrame(render);}
        }

        // sub function =======================================================
        function updater(){
            var i;
            count++;
            times = (Date.now() - beginTime) / 1000;
            gpuUpdateFlag = false;
            gpgpuAnimation = false;
            gl3.audio.src[0].update = true;
            soundData = [];
            for(i = 0; i < 16; ++i){
                soundData[i] = gl3.audio.src[0].onData[i] / 255.0;
            }
            canvasWidth   = window.innerWidth;
            canvasHeight  = window.innerHeight;
            canvas.width  = canvasWidth;
            canvas.height = canvasHeight;
            aspect = canvasWidth / canvasHeight;
            cameraPosition[0] = DEFAULT_CAM_POSITION[0];
            cameraPosition[1] = DEFAULT_CAM_POSITION[1];
            cameraPosition[2] = DEFAULT_CAM_POSITION[2];
            centerPoint[0] = DEFAULT_CAM_CENTER[0];
            centerPoint[1] = DEFAULT_CAM_CENTER[1];
            centerPoint[2] = DEFAULT_CAM_CENTER[2];
            cameraUpDirection[0] = DEFAULT_CAM_UP[0];
            cameraUpDirection[1] = DEFAULT_CAM_UP[1];
            cameraUpDirection[2] = DEFAULT_CAM_UP[2];
        }
        // scene clear
        function clearRender(alpha, customColor){
            var clearColor = [0.0, 0.0, 0.0, alpha];
            if(customColor){clearColor = customColor;}
            lPrg.set_program();
            lPrg.set_attribute(planeVBO, planeIBO);
            lPrg.push_shader([clearColor]);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        }
        function effectRender(mode){
            var effectmode, firstColor, secondColor;
            ePrg.set_program();
            ePrg.set_attribute(planeVBO, planeIBO);
            switch(mode){
                case 0: // center to corner circle (dark blue) @@@
                    effectmode = mode;
                    firstColor = [0.1, 0.2, 0.3, 0.5];
                    secondColor = [0.0, 0.0, 0.0, 0.5];
                    break;
                case 1: // top to corner circle (dark blue)
                    effectmode = mode;
                    firstColor = [0.1, 0.2, 0.3, 0.5];
                    secondColor = [0.0, 0.0, 0.0, 0.5];
                    break;
                case 2: // top to bottom gradation (dark blue to dark purple)
                    effectmode = mode;
                    firstColor = [0.05, 0.01, 0.15, 0.5];
                    secondColor = [0.25, 0.05, 0.25, 0.5];
                    break;
                case 3: // top to corner circle (dark red)
                    effectmode = 1;
                    firstColor = [0.3, 0.0, 0.0, 0.5];
                    secondColor = [0.1, 0.0, 0.1, 0.5];
                    break;
                case 4: // center to corner circle (dark purple)
                    effectmode = 0;
                    firstColor = [0.1, 0.0, 0.2, 0.5];
                    secondColor = [0.3, 0.0, 0.2, 0.5];
                    break;
                case 5: // top to bottom gradation (dark orange to dark green)
                    effectmode = 2;
                    firstColor = [0.2, 0.15, 0.0, 0.5];
                    secondColor = [0.0, 0.25, 0.0, 0.5];
                    break;
                case 6: // top to corner circle (deep darker)
                    effectmode = 1;
                    firstColor = [0.05, 0.0, 0.0, 0.5];
                    secondColor = [0.0, 0.0, 0.05, 0.5];
                    break;
                case 7: // top to corner circle (deep darker)
                    effectmode = 2;
                    firstColor = [0.1, 0.1, 0.1, 0.5];
                    secondColor = [0.0, 0.0, 0.0, 0.5];
                    break;
                default:
                    effectmode = 0;
                    firstColor = [0.0, 0.0, 0.0, 1.0];
                    secondColor = [1.0, 1.0, 1.0, 1.0];
                    break;
            }
            ePrg.push_shader([effectmode, FRAMEBUFFER_SIZE, firstColor, secondColor]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        }
        function gpgpuResetTexture(mode){
            gfPrg.set_program();
            gfPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, activeVelocityBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
            gl3.scene_view(null, 0, 0, GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE);
            gfPrg.push_shader([0.0, mode]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            gl.bindFramebuffer(gl.FRAMEBUFFER, activePositionBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0]);
            gl3.scene_view(null, 0, 0, GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE);
            gfPrg.push_shader([20.0, mode + 1.0]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        }
        function sceneRender(alpha, effectMode, gpgpu, pointfloor, seaflower, seaalgae, wave, resolution, nowBindBuffer, nowViewport, gpgpuParam, floorParam, flowerParam){
            if(!nowBindBuffer){
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.framebuffer);
                gl.viewport(0, 0, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);
            }
            if(nowBindBuffer && gpgpuAnimation){gpgpuSceneUpdate();}

            clearRender(alpha);

            if(effectMode !== null){effectRender(effectMode);}

            if(gpgpu){gpgpuRender(gpgpuParam, nowBindBuffer, nowViewport);}
            var f = floorParam == null ? 1.0 : floorParam;
            var g = 0, a = 1.0;
            if(pointfloor){pointFloor(cameraPosition, times, 10.0, [50.0, 1.0, 50.0], [0.3, 0.8, 1.0, f]);}
            if(flowerParam != null){
                f = flowerParam.mono;
                g += flowerParam.mode;
                a = flowerParam.alpha;
            }else{
                f = false;
            }
            if(seaflower){seaFlower([0.0, -8.0, 0.0], [resolution, resolution], false, f, g, [1.0, 1.0, 1.0, a]);}
            if(seaalgae){seaAlgae([0.0, -8.0, 0.0], [resolution, resolution], false, f, g, [1.0, 1.0, 1.0, a]);}
            if(wave){particleWaveRender(32.0, [0.3, 0.8, 1.0, 1.0]);}
        }
        function finalSceneRender(original, blur, mosaic, atan, globalColor){
            var color;
            if(blur){
                gaussHorizon(); gaussVertical();
                color = globalColor || [1.5, 1.5, 1.5, 0.75];
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
                gl.viewport(0, 0, canvasWidth, canvasHeight);
                fPrg.set_program();
                fPrg.set_attribute(planeVBO, planeIBO);
                fPrg.push_shader([color, 7, 5, 0, times]); // blur layer
                gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            }else{
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
                gl.viewport(0, 0, canvasWidth, canvasHeight);
                fPrg.set_program();
                fPrg.set_attribute(planeVBO, planeIBO);
            }
            if(original){
                color = globalColor || [1.0, 1.0, 1.0, 1.0];
                fPrg.push_shader([color, 4, 5, 0, times]);  // original scene
                gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            }
            if(mosaic){
                color = globalColor || [1.0, 1.0, 1.0, 0.25];
                fPrg.push_shader([color, 8, 5, 1, times]); // mosaic layer
                gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            }
            if(atan){
                color = globalColor || [0.5, 0.3, 1.0, 1.0];
                fPrg.push_shader([color, 5, 5, 2, times]);  // atan layer
                gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            }
        }
        function gpgpuSceneUpdate(){
            var i, j;
            particleTarget = [0.0, 5.0, 0.0];
            i = gl3.PI2 * 0.1 * times;
            j = (Math.cos(times) + 1.0) / 2.0;
            qtn.rotate(i, [1.0, 0.0, 0.0], pqtx);
            qtn.rotate(i, [0.0, 0.0, 1.0], pqtz);
            qtn.slerp(pqtx, pqtz, j, pqt);
            qtn.toVecIII(particleTarget, pqt, particleTarget);
        }
        function activeVertexSwitcher(){
            passiveVertexIndex = activeVertexIndex;
            return activeVertexIndex === 0 ? 1 : 0;
        }
        // gpgpu particle render
        function gpgpuRender(param, nowBindBuffer, nowViewport){
            var target, power, speed, globalColor;
            if(!param){
                target = particleTarget;
                power = 0.02;
                speed = 0.15;
                globalColor = [1.0, 0.05, 0.1, 1.0];
            }else{
                target = param.target || particleTarget;
                power = param.power;
                speed = param.speed;
                globalColor = param.globalColor;
            }
            if(gpuUpdateFlag){
                gpgpuUpdate(target, power, speed);
                gl.bindFramebuffer(gl.FRAMEBUFFER, nowBindBuffer);
                gl.viewport(0, 0, nowViewport, nowViewport);
            }
            grPrg.set_program();
            grPrg.set_attribute(gpgpuVBO, null);
            grPrg.push_shader([
                vpMatrix, GPGPU_FRAMEBUFFER_SIZE, 8.0,
                gpgpuPositionBuffer[activeVertexIndex].textureIndex, 1, globalColor
            ]);
            gl3.draw_arrays(gl.POINTS, gpgpuIndex.length);
        }
        function gpgpuUpdate(target, power, speed){
            gpuUpdateFlag = false;
            gl.viewport(0, 0, GPGPU_FRAMEBUFFER_SIZE, GPGPU_FRAMEBUFFER_SIZE);
            activeVertexIndex = activeVertexSwitcher();
            activeVelocityBuffer = gpgpuVelocityBuffer[activeVertexIndex].buffer;
            activePositionBuffer = gpgpuPositionBuffer[activeVertexIndex].buffer;
            gl.disable(gl.BLEND);
            guPrg.set_program();
            guPrg.set_attribute(planeVBO, planeIBO);
            gl.bindFramebuffer(gl.FRAMEBUFFER, activeVelocityBuffer.framebuffer);
            guPrg.push_shader([0, GPGPU_FRAMEBUFFER_SIZE, target, power, speed,
                               gpgpuVelocityBuffer[passiveVertexIndex].textureIndex,
                               gpgpuPositionBuffer[passiveVertexIndex].textureIndex
            ]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            gl.bindFramebuffer(gl.FRAMEBUFFER, activePositionBuffer.framebuffer);
            guPrg.push_shader([1, GPGPU_FRAMEBUFFER_SIZE, target, power, speed,
                               gpgpuVelocityBuffer[activeVertexIndex].textureIndex,
                               gpgpuPositionBuffer[passiveVertexIndex].textureIndex
            ]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
            gl.enable(gl.BLEND);
        }
        // off screen - seaflower
        function seaFlower(offset, resolution, isPoint, isMono, mode, globalColor){
            prg.set_program();
            set_attribute_angle(seaVBO, prg.attL, prg.attS, seaExt, seaIBO);
            mat4.identity(mMatrix);
            mat4.translate(mMatrix, offset, mMatrix);
            mat4.identity(rotateMatrix);
            if(mode > 0){mat4.rotate(rotateMatrix, (times * 0.5) % gl3.PI2, [0.0, 1.0, 0.0], rotateMatrix);}
            mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            prg.push_shader([rotateMatrix, mMatrix, mvpMatrix, cameraPosition, times, mode, globalColor, resolution, isMono]);
            seaFlowerDraw(isPoint);
        }
        // off screen - seaalgae
        function seaAlgae(offset, resolution, isPoint, isMono, mode, globalColor){
            prg.set_program();
            set_attribute_angle(algaeVBO, prg.attL, prg.attS, seaExt, algaeIBO);
            mat4.identity(mMatrix);
            mat4.translate(mMatrix, offset, mMatrix);
            mat4.identity(rotateMatrix);
            if(mode > 1){mat4.rotate(rotateMatrix, (times * 0.5) % gl3.PI2, [0.0, -1.0, 0.0], rotateMatrix);}
            mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            prg.push_shader([rotateMatrix, mMatrix, mvpMatrix, cameraPosition, times, mode + 1, globalColor, resolution, isMono]);
            seaAlgaeDraw(isPoint);
        }
        function seaFlowerDraw(isPoint){
            if(isPoint){
                ext.drawArraysInstancedANGLE(gl.POINTS, 0, seaPosition.length / 3, instanceCount);
            }else{
                ext.drawElementsInstancedANGLE(gl.LINES, seaIndices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
            }
        }
        function seaAlgaeDraw(isPoint){
            if(isPoint){
                ext.drawArraysInstancedANGLE(gl.POINTS, 0, algaePosition.length / 3, instanceCount);
            }else{
                ext.drawElementsInstancedANGLE(gl.LINES, algaeIndices.length, gl.UNSIGNED_SHORT, 0, instanceCount);
            }
        }
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
        // point floor wave
        function pointFloor(eye, speed, height, scale, color){
            pPrg.set_program();
            pPrg.set_attribute(floorVBO, null);
            mat4.identity(mMatrix);
            mat4.scale(mMatrix, scale, mMatrix);
            mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
            pPrg.push_shader([mMatrix, mvpMatrix, eye, 5, height, speed / 10, color, 1.0]);
            gl3.draw_arrays(gl.POINTS, floorPosition.length / 3);
        }
        function gaussHorizon(){
            gl.bindFramebuffer(gl.FRAMEBUFFER, hGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);
            gPrg.set_program();
            gPrg.set_attribute(planeVBO, planeIBO);
            gPrg.push_shader([[FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE], true, gWeight, 4]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        }
        function gaussVertical(){
            gl.bindFramebuffer(gl.FRAMEBUFFER, vGaussBuffer.framebuffer);
            gl3.scene_clear([0.0, 0.0, 0.0, 1.0], 1.0);
            gl.viewport(0, 0, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);
            gPrg.push_shader([[FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE], false, gWeight, 6]);
            gl3.draw_elements(gl.TRIANGLES, planeIndex.length);
        }
        function particleWaveRender(size, color){
            gl3.mat4.lookAt([0.0, 0.0, PARTICLE_FLOOR_WIDTH / 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
            gl3.mat4.perspective(60, aspect, 0.1, PARTICLE_FLOOR_WIDTH * 2.0, pMatrix);
            gl3.mat4.multiply(pMatrix, vMatrix, particleMatrix);
            ptPrg.set_program();
            ptPrg.set_attribute(particleVBO, null);
            ptPrg.push_shader([particleMatrix, times * 5.0, PARTICLE_FLOOR_WIDTH / 2.0, size, color, 1]);
            gl3.draw_arrays(gl.POINTS, particlePosition.length / 3);
        }
        function defaultCameraRotate(rotationSpeed, rotationAxis){
            var speed = rotationSpeed || 0.5;
            var axis = rotationAxis || [0.0, 1.0, 0.0];
            qtn.identity(qt);
            qtn.rotate((times * speed) % gl3.PI2, axis, qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
        }

        // scene functions ====================================================
        sceneFunctions[0] = function(){
            // ----------------------------------------------------------------
            // scene 0: default scene(gpgpu particle animation and camera move)
            //  clearAlpha: 0.8, effectmode: null
            //  gpgpu: true, floor: false, flower: false, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            defaultCameraRotate();
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = true;
            sceneRender(0.8, null, true, false, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8, null, true, false, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[1] = function(){
            // ----------------------------------------------------------------
            // scene 1: test scene(point floor and effect mode check)
            // ----------------------------------------------------------------
            defaultCameraRotate();
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.8, 3, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8, 3, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[2] = function(alpha){
            // ----------------------------------------------------------------
            // scene 2: particle floor (wave animation and camera rotate axis Y)
            //  clearAlpha: args, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            // defaultCameraRotate(0.1, null);
            defaultCameraRotate(null, [0.0, -1.0, 0.0]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            var a = alpha || 0.8;
            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(a, 2, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(a, 2, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[3] = function(){
            // ----------------------------------------------------------------
            // scene 3: particle floor (wave animation and camera rotate axis Y + updown)
            //  clearAlpha: 0.8, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.identity(qtt);
            qtn.rotate((times * 2.0) % gl3.PI2, [0.0, 1.0, 0.0], qt);
            qtn.rotate((times * 2.0) % gl3.PI2, [0.707, 0.0, 0.707], qtt);
            qtn.slerp(qt, qtt, (Math.sin(times) + 1.0) / 2.0, qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.8, 2, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8, 2, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[4] = function(){
            // ----------------------------------------------------------------
            // scene 4: particle floor (wave animation and move to positive Z)
            //  clearAlpha: 0.8, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate(gl3.PIH * 1.5 + 0.01, [0.0, 1.0, 0.0], qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.8, 0, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8, 0, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[5] = function(offsetTime){
            // ----------------------------------------------------------------
            // scene 5: particle floor (wave animation and camera dive in)
            //  clearAlpha: 0.8, effectmode: 0
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            var i, j, t;
            t = times - offsetTime;
            qtn.identity(qt);
            qtn.identity(qtt);
            qtn.rotate(t % gl3.PI2, [0.0, -1.0, 0.0], qt);
            qtn.rotate(gl3.PI2 + gl3.PIH / 2.0, [1.0, 0.0, 0.0], qtt);
            qtn.slerp(qt, qtt, gl3.util.easeOutCubic(Math.min(t * 0.2, 1.0)), qt);
            j = 0.0;
            if(t > 5.0){
                i = gl3.util.easeOutCubic(Math.min((t - 5.0) * 0.2, 1.0));
                j += i * 2.0;
                cameraPosition[1] = DEFAULT_CAM_POSITION[1] - DEFAULT_CAM_POSITION[1] * (t - 5.0) * i;
                cameraPosition[2] = DEFAULT_CAM_POSITION[2] - DEFAULT_CAM_POSITION[2] * (t - 5.0) * i;
            }
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.8 - j, 7, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8 - j, 7, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[6] = function(soundPower){
            // ----------------------------------------------------------------
            // scene 6: particle floor sound power (wave animation and move to positive Z)
            //  clearAlpha: animation, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate(gl3.PIH * 1.5 + 0.01, [0.0, 1.0, 0.0], qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(1.75 - soundPower, 2, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, soundPower);
            sceneRender(1.75 - soundPower, 2, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null, null, soundPower);
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[7] = function(){
            // ----------------------------------------------------------------
            // scene 7: particle floor (wave animation and camera rotate axis Y + updown)
            //  clearAlpha: 0.8, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate((times * 2.5) % gl3.PI2, [0.0, -1.0, 0.0], qtt);
            var s = Math.cos((times * 1.5) % gl3.PI2) + 1.0;
            cameraPosition[1] -= s * 12.0;
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                90, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.2, 7, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.2, 7, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[8] = function(){
            // ----------------------------------------------------------------
            // scene 8: particle floor (wave animation and camera rotate axis Y + updown)
            //  clearAlpha: 0.8, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.identity(qtt);
            qtn.rotate((times * 0.5) % gl3.PI2, [0.0, 0.0, 1.0], qt);
            qtn.rotate((times * 0.5) % gl3.PI2, [0.577, 0.577, 0.577], qtt);
            qtn.slerp(qt, qtt, (Math.sin(times * 0.5) + 1.0) / 2.0, qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                60, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.6, 2, false, true, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.6, 2, false, true, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };

        sceneFunctions[10] = function(){
            // ----------------------------------------------------------------
            // scene 10: gpgpu scene (gpgpu particle animation and camera move)
            //  clearAlpha: 0.8, effectmode: 4
            //  gpgpu: true, floor: false, flower: false, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            defaultCameraRotate();
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = true;
            sceneRender(0.8, 4, true, false, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.8, 4, true, false, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[11] = function(power, time){
            // ----------------------------------------------------------------
            // scene 11: gpgpu scene (gpgpu particle move speed change and camera move)
            //  clearAlpha: 0.8, effectmode: 2
            //  gpgpu: true, floor: false, flower: false, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.identity(qtt);
            qtn.rotate(time % gl3.PI2, [0.0, 0.0, 1.0], qt);
            qtn.rotate(time % gl3.PI2, [0.707, 0.707, 0.0], qtt);
            qtn.slerp(qt, qtt, (Math.sin(times % gl3.PI2) + 1.0) / 2.0, qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                240 - time * 8.0, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = true;
            var gpgpuParam = {
                target: [0.0, 5.0, 0.0],
                power: 0.1 * power,
                speed: 0.5 * power,
                globalColor: [0.3, 0.1, 1.0, 0.5]
            };
            sceneRender(0.2 + power, 2, true, false, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, gpgpuParam);
            sceneRender(0.2 + power, 2, true, false, false, false, false, FRAMEBUFFER_SIZE, null, null, gpgpuParam);
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[12] = function(){
            // ----------------------------------------------------------------
            // scene 12: gpgpu scene (move to negative Z)
            //  clearAlpha: 0.8, effectmode: 6
            //  gpgpu: true, floor: false, flower: false, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            //  ※要パーティクルの初期位置検討
            // ----------------------------------------------------------------
            var s, c, t;
            t = times * 20.0;
            cameraPosition[0] = 0.0;
            cameraPosition[1] = 0.0;
            cameraPosition[2] = cameraPosition[2] + 30.0;
            centerPoint[2] = centerPoint[2] + 0.0 - t;
            qtn.identity(qt);
            qtn.rotate(gl3.util.easeOutCubic(Math.min(times * 0.2, 1.0)) * gl3.PIH, [0.0, -1.0, 0.0], qt);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            cameraPosition[2] -= t;
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                90, aspect, 1.0, 200.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = true;
            s = Math.sin(times * 2.5) * 7.0;
            c = Math.cos(times * 3.0) * 7.0;
            var gpgpuParam = {
                target: [s, c, -30.0 - t],
                power: 0.05,
                speed: 1.75,
                globalColor: [0.05, 0.25, 1.0, 0.25]
            };
            sceneRender(0.6, 6, true, false, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, gpgpuParam);
            sceneRender(0.6, 6, true, false, false, false, false, FRAMEBUFFER_SIZE, null, null, gpgpuParam);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[13] = function(){
            // ----------------------------------------------------------------
            // scene 13: gpgpu scene (gpgpu particle animation and camera move)
            //  clearAlpha: 0.4, effectmode: 4
            //  gpgpu: true, floor: false, flower: false, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            defaultCameraRotate();
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = true;
            sceneRender(0.4, 4, true, false, false, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE);
            sceneRender(0.4, 4, true, false, false, false, false, FRAMEBUFFER_SIZE, null, null);
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[20] = function(){
            // ----------------------------------------------------------------
            // scene 20: flower basic
            //  clearAlpha: 0.5, effectmode: 2
            //  gpgpu: false, floor: false, flower: true, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate((times * 0.05) % gl3.PI2, [0.0, 1.0, 0.0], qt);
            cameraPosition[0] = 0.0;
            cameraPosition[1] = 3.0;
            cameraPosition[2] = 10.0;
            cameraUpDirection = cameraUpVector(cameraPosition, centerPoint);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                45, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.5, 2, false, false, true, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, null, {mode: 2, mono: false, alpha: 1.0});
            sceneRender(0.5, 2, false, false, true, false, false, FRAMEBUFFER_SIZE, null, null, null, null, {mode: 2, mono: false, alpha: 1.0});
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[21] = function(){
            // ----------------------------------------------------------------
            // scene 21: algae basic
            //  clearAlpha: 0.5, effectmode: 5
            //  gpgpu: false, floor: false, flower: true, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate((times * 0.05) % gl3.PI2, [0.0, 1.0, 0.0], qt);
            cameraPosition[0] = 0.0;
            cameraPosition[1] = 5.0;
            cameraPosition[2] = 10.0;
            cameraUpDirection = cameraUpVector(cameraPosition, centerPoint);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                45, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.5, 5, false, false, false, true, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, null, {mode: 2, mono: false, alpha: 1.0});
            sceneRender(0.5, 5, false, false, false, true, false, FRAMEBUFFER_SIZE, null, null, null, null, {mode: 2, mono: false, alpha: 1.0});
            finalSceneRender(true, true, false, false, null);
        };
        sceneFunctions[22] = function(){
            // ----------------------------------------------------------------
            // scene 22: flower monochrome none animation
            //  clearAlpha: 0.9, effectmode: 7
            //  gpgpu: false, floor: false, flower: true, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate((times * 0.05) % gl3.PI2, [0.0, 1.0, 0.0], qt);
            cameraPosition[0] = 0.0;
            cameraPosition[1] = 5.0;
            cameraPosition[2] = 10.0;
            cameraUpDirection = cameraUpVector(cameraPosition, centerPoint);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                45, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.9, 7, false, false, true, false, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, null, {mode: 0, mono: true, alpha: 1.0});
            sceneRender(0.9, 7, false, false, true, false, false, FRAMEBUFFER_SIZE, null, null, null, null, {mode: 0, mono: true, alpha: 1.0});
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[23] = function(){
            // ----------------------------------------------------------------
            // scene 23: algae monochrome none animation
            //  clearAlpha: 0.9, effectmode: 7
            //  gpgpu: false, floor: false, flower: true, algae: false, wave: false
            //  origin: true, blur: false, mosaic: false, atan: false
            // ----------------------------------------------------------------
            qtn.identity(qt);
            qtn.rotate((times * 0.05) % gl3.PI2, [0.0, 1.0, 0.0], qt);
            cameraPosition[0] = 0.0;
            cameraPosition[1] = 5.0;
            cameraPosition[2] = 10.0;
            cameraUpDirection = cameraUpVector(cameraPosition, centerPoint);
            qtn.toVecIII(cameraPosition, qt, cameraPosition);
            qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                45, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.9, 7, false, false, false, true, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, null, {mode: 0, mono: true, alpha: 1.0});
            sceneRender(0.9, 7, false, false, false, true, false, FRAMEBUFFER_SIZE, null, null, null, null, {mode: 0, mono: true, alpha: 1.0});
            finalSceneRender(true, false, false, false, null);
        };
        sceneFunctions[25] = function(alpha, offset){
            // ----------------------------------------------------------------
            // scene 25: particle floor and flower
            //  clearAlpha: 0.5, effectmode: 2
            //  gpgpu: false, floor: true, flower: false, algae: false, wave: false
            //  origin: true, blur: true, mosaic: false, atan: false
            // ----------------------------------------------------------------
            // qtn.identity(qt);
            // qtn.rotate(gl3.PIH * 1.5 + 0.01, [0.0, 1.0, 0.0], qt);
            cameraPosition[2] = cameraPosition[2] - 20.0 + offset;
            centerPoint[3] += cameraPosition[2];
            cameraUpDirection[0] = 0.0;
            cameraUpDirection[1] = 0.0;
            cameraUpDirection[2] = -1.0;
            // qtn.toVecIII(cameraPosition, qt, cameraPosition);
            // qtn.toVecIII(cameraUpDirection, qt, cameraUpDirection);
            camera = gl3.camera.create(
                cameraPosition, centerPoint, cameraUpDirection,
                90, aspect, 5.0, 100.0
            );
            mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
            gl.bindFramebuffer(gl.FRAMEBUFFER, smallBuffer.framebuffer);
            gl.viewport(0, 0, SMALL_FRAMEBUFFER_SIZE, SMALL_FRAMEBUFFER_SIZE);

            gpuUpdateFlag = gpgpuAnimation = false;
            sceneRender(0.5, 0, false, true, true, true, false, SMALL_FRAMEBUFFER_SIZE, smallBuffer.framebuffer, SMALL_FRAMEBUFFER_SIZE, null, null, {mode: 2, mono: false, alpha: alpha});
            sceneRender(0.5, 0, false, true, true, true, false, FRAMEBUFFER_SIZE, null, null, null, null, {mode: 2, mono: false, alpha: alpha});
            finalSceneRender(true, true, false, false, null);
        };

        // @@@
        render();
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


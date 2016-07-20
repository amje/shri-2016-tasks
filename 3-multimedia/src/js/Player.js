const CANVAS_WIDTH = 480;
const FPS = 18;

export default class Player {
    constructor() {
        this.element = document.querySelector('.player');
        this.videoSource = this.element.querySelector('.player__video_source');
        this.videoTexture = this.element.querySelector('.player__video_texture');
        this.audio = this.element.querySelector('.player__audio');
        this.canvas = this.element.querySelector('.player__canvas');
        this.webglCanvas = document.querySelector('.player__webgl-canvas');
        this.webglCtx = this.webglCanvas.getContext('webgl');
        this.ctx = this.canvas.getContext('2d');
        this.playButton = this.element.querySelector('.play-button');
        this.progressPlayed = this.element.querySelector('.progress-bar__played');

        this.playButton.addEventListener('click', this.handlePlayButtonClick.bind(this));
        this.videoSource.addEventListener('loadedmetadata', this.handleVideoMetaLoaded.bind(this));
        this.videoSource.addEventListener('timeupdate', this.handleVideoTimeUpdate.bind(this));
        this.videoSource.addEventListener('ended', this.handleVideoEnded.bind(this));

        this.playing = false;
        this.prepareWebGL();

        this.render = this.render.bind(this);
    }

    handlePlayButtonClick() {
        if (this.playing) {
            this.playButton.classList.remove('play-button_pause');
            this.pause();
        } else {
            this.playButton.classList.add('play-button_pause');
            this.play();
        }
    }

    handleVideoMetaLoaded() {
        this.setup();
    }

    handleVideoTimeUpdate() {
        requestAnimationFrame(() => {
            this.progressPlayed.style.transform = `scaleX(${this.videoSource.currentTime / this.videoSource.duration})`;

            const nextSub = this.subs[this.subIndex];
            if (nextSub &&
                this.videoSource.currentTime - nextSub.start >= 0 &&
                this.videoSource.currentTime - nextSub.start < 2
            ) {
                this.showSub(nextSub);
            }
        });
    }

    handleVideoEnded() {
        this.videoTexture.pause();
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this.subIndex = 0;
        this.playButton.classList.remove('play-button_pause');
        this.canvas.classList.add('player__canvas_paused');
    }

    play() {
        this.audio.play();
        this.videoSource.play();
        this.videoTexture.play();
        this.playing = true;
        this.canvas.classList.remove('player__canvas_paused');
        requestAnimationFrame(this.render);
    }

    pause() {
        this.audio.pause();
        this.videoSource.pause();
        this.videoTexture.pause();
        this.playing = false;
        this.canvas.classList.add('player__canvas_paused');
    }

    showSub(sub) {
        this.sub = sub;
        this.sub.textLines = sub.text.split('\n');
        this.subIndex++;
        this.videoSource.pause();
        setTimeout(() => {
            if (this.playing) {
                this.videoSource.play();
            }
            this.sub = null;
        }, sub.duration * 1000);
    }

    init(videoSrc, audioSrc, subs) {
        this.videoSource.src = videoSrc;
        this.audio.src = audioSrc;
        this.videoSource.volume = 0;
        this.audio.volume = 0.5;
        this.subs = subs;
        this.subIndex = 0;
    }

    setup() {
        const ratio = this.canvas.clientWidth / this.canvas.clientHeight;

        this.width = CANVAS_WIDTH;
        this.height = this.width / ratio;
        // For FPS test
        // this.width = this.videoSource.videoWidth;
        // this.height = this.videoSource.videoHeight;
        this.fontSize = this.height / 15;
        this.lineHeight = this.fontSize * 1.2;

        this.canvas.width = this.webglCanvas.width = this.width;
        this.canvas.height = this.webglCanvas.height = this.height;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.font = `${this.fontSize}px Oranienbaum`;
        this.ctx.textBaseline = 'middle';
    }

    render(time) {
        if (!this.playing && !this.sub) {
            return;
        }

        if (!this.lastRenderTime || (time - this.lastRenderTime > 1000 / FPS)) {
            if (this.sub) {
                this.renderSub();
            } else {
                // this.desaturate();
                this.desaturateWithWebGL();
            }

            this.overlayTexture();
            this.lastRenderTime = time;
        }

        requestAnimationFrame(this.render);
    }

    renderSub() {
        const ctx = this.ctx;
        const textLines = this.sub.textLines;
        const textLinesLength = textLines.length;
        let offset;

        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#fff';

        for (let i = 0; i < textLinesLength; i++) {
            offset = (i - textLinesLength / 2 + 0.5) * this.lineHeight;
            ctx.fillText(textLines[i], 10, this.height / 2 + offset);
        }
    }

    desaturate() {
        this.ctx.drawImage(this.videoSource, 0, 0, this.width, this.height);
        const frame = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = frame.data;
        const length = data.length / 4;

        for (let i = 0; i < length; i++) {
            const rIndex = i * 4;
            const gIndex = i * 4 + 1;
            const bIndex = i * 4 + 2;
            const R = data[rIndex];
            const G = data[gIndex];
            const B = data[bIndex];
            const gray = R * 0.21 + G * 0.72 + B * 0.07;

            data[rIndex] = data[gIndex] = data[bIndex] = gray;
        }

        this.ctx.putImageData(frame, 0, 0);
    }

    overlayTexture() {
        const lastOperation = this.ctx.globalCompositeOperation;

        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.drawImage(this.videoTexture, 0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = lastOperation;
    }

    prepareWebGL() {
        const gl = this.webglCtx;
        const program = gl.createProgram();

        const vertexCode = 'attribute vec2 coordinates;' +
            'attribute vec2 texture_coordinates;' +
            'varying vec2 v_texcoord;' +
            'void main() {' +
            '  gl_Position = vec4(coordinates, 0.0, 1.0);' +
            '  v_texcoord = texture_coordinates;' +
            '}';

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexCode);
        gl.compileShader(vertexShader);

        const fragmentCode = 'precision mediump float;' +
            'varying vec2 v_texcoord;' +
            'uniform sampler2D u_texture;' +
            'void main() {' +
            '   vec4 tex = texture2D(u_texture, v_texcoord);' +
            '   float gray = tex.r * 0.21 + tex.g * 0.72 + tex.b * 0.07;' +
            '   gl_FragColor = vec4(gray, gray, gray, tex.a);' +
            '}';

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentCode);
        gl.compileShader(fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

        const positionLocation = gl.getAttribLocation(program, 'coordinates');
        const texcoordLocation = gl.getAttribLocation(program, 'texture_coordinates');

        let buffer = gl.createBuffer();
        const vertices = [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        buffer = gl.createBuffer();
        const textureCoordinates = [
            0, 1,
            1, 1,
            0, 0,
            0, 0,
            1, 1,
            1, 0
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texcoordLocation);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    desaturateWithWebGL() {
        const canvasSource = this.webglCanvas;
        const gl = this.webglCtx;

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoSource);
        gl.viewport(0, 0, canvasSource.width, canvasSource.height);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.ctx.drawImage(canvasSource, 0, 0, this.width, this.height);
    }
}

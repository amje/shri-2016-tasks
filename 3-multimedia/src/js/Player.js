const CANVAS_WIDTH = 480;
const FPS = 18;

export default class Player {
    constructor() {
        this.element = document.querySelector('.player');
        this.videoSource = this.element.querySelector('.player__video_source');
        this.videoTexture = this.element.querySelector('.player__video_texture');
        this.audio = this.element.querySelector('.player__audio');
        this.canvas = this.element.querySelector('.player__canvas');
        this.ctx = this.canvas.getContext('2d');
        this.playButton = this.element.querySelector('.play-button');
        this.progressPlayed = this.element.querySelector('.progress-bar__played');

        this.playButton.addEventListener('click', this.handlePlayButtonClick.bind(this));
        this.videoSource.addEventListener('loadedmetadata', this.handleVideoMetaLoaded.bind(this));
        this.videoSource.addEventListener('timeupdate', this.handleVideoTimeUpdate.bind(this));
        this.videoSource.addEventListener('ended', this.handleVideoEnded.bind(this));

        this.playing = false;

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
        this.playing = false;
        this.canvas.classList.add('player__canvas_paused');
    }

    showSub(sub) {
        this.sub = sub;
        this.sub.textLines = sub.text.split('\n');
        this.subIndex++;
        this.videoSource.pause();
        setTimeout(() => {
            this.videoSource.play();
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
        this.fontSize = this.height / 14;
        this.lineHeight = this.fontSize * 1.2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
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
                this.renderFrameFromVideo();
                this.desaturateFrame();
            }

            this.overlayTexture();
            this.lastRenderTime = time;
        }

        requestAnimationFrame(this.render);
    }

    renderFrameFromVideo() {
        this.ctx.drawImage(this.videoSource, 0, 0, this.width, this.height);
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

    desaturateFrame() {
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
}

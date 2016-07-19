export const CANVAS_WIDTH = 360;
export const FPS = 18;

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

        this.videoTexture.loop = true;
        this.videoTexture.src = 'old_movie_texture.mp4';
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
            if (nextSub && this.videoSource.currentTime >= nextSub.start) {
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

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render(time) {
        if (!this.playing && !this.sub) {
            return;
        }

        if (!this.lastRenderTime || (time - this.lastRenderTime > 1000 / FPS)) {
            if (this.sub) {
                this.renderSub();
            } else {
                let frame = this.getFrameFromVideo();

                this.desaturateFrame(frame);
                this.ctx.putImageData(frame, 0, 0);
            }

            this.overlayTexture();
            this.lastRenderTime = time;
        }

        requestAnimationFrame(this.render);
    }

    renderSub() {
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.width, this.height);
        let fontSize = this.height / 14;
        let lineHeight = fontSize * 1.2;
        this.ctx.font = `${fontSize}px Oranienbaum`;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#fff';
        this.sub.text.split('\n').forEach((line, index, text) => {
            let length = text.length;
            let offset = (index - length / 2 + 0.5) * lineHeight;

            this.ctx.fillText(line, 10, this.height / 2 + offset);
        });
    }

    overlayTexture() {
        const lastOperation = this.ctx.globalCompositeOperation;

        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.drawImage(this.videoTexture, 0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = lastOperation;
    }

    getFrameFromVideo() {
        this.ctx.drawImage(this.videoSource, 0, 0, this.width, this.height);

        return this.ctx.getImageData(0, 0, this.width, this.height);
    }

    desaturateFrame(frame) {
        const length = frame.data.length / 4;

        for (let i = 0; i < length; i++) {
            const rIndex = i * 4;
            const gIndex = i * 4 + 1;
            const bIndex = i * 4 + 2;
            const R = frame.data[rIndex];
            const G = frame.data[gIndex];
            const B = frame.data[bIndex];
            const gray = grayscale([R, G, B], 'luminosity');

            frame.data[rIndex] = gray;
            frame.data[gIndex] = gray;
            frame.data[bIndex] = gray;
        }

        return frame;
    }
}

function grayscale([R, G, B], algorithm) {
    switch (algorithm) {
        case 'lightness':
            return (Math.max(R, G, B) + Math.min(R, G, B)) / 2;
        case 'average':
            return (R + G + B) / 3;
        case 'luminosity':
            return R * 0.21 + G * 0.72 + B * 0.07;
        default:
            return 0;
    }
}

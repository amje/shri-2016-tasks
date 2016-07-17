const CANVAS_WIDTH = 600;

export default class Player {
    constructor() {
        this.element = document.querySelector('.player');
        this.video = this.element.querySelector('.player__video');
        this.audio = this.element.querySelector('.player__audio');
        this.canvas = this.element.querySelector('.player__canvas');
        this.playButton = this.element.querySelector('.play-button');
        this.progressBar = this.element.querySelector('.progress-bar');
        this.progressPlayed = this.element.querySelector('.progress-bar__played');
        this.ctx = this.canvas.getContext('2d');

        this.playButton.addEventListener('click', this.handlePlayButtonClick.bind(this));
        this.video.addEventListener('loadedmetadata', this.handleVideoMetaLoaded.bind(this));
        this.video.addEventListener('timeupdate', this.handleVideoTimeUpdate.bind(this));
        this.video.addEventListener('ended', this.handleVideoEnded.bind(this));
        this.progressBar.addEventListener('click', this.handleProgressBarClick.bind(this));

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
        this.setDimensions();
    }

    handleVideoTimeUpdate() {
        requestAnimationFrame(() => {
            this.progressPlayed.style.transform = `scaleX(${this.video.currentTime / this.video.duration})`;

            const nextSub = this.subs[this.subIndex];
            if (nextSub && this.video.currentTime >= nextSub.start) {
                this.showSub(nextSub);
            }
        });
    }

    handleVideoEnded() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this.subIndex = 0;
        this.playButton.classList.remove('play-button_pause');
    }

    handleProgressBarClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const time = (e.clientX - rect.left) / rect.width * this.video.duration;

        this.seekTo(time);
    }

    play() {
        this.audio.play();
        this.video.play();
        this.playing = true;
        requestAnimationFrame(this.render);
    }

    pause() {
        this.audio.pause();
        this.video.pause();
        this.playing = false;
    }

    seekTo(time) {
        this.audio.currentTime = time;
        this.video.currentTime = time;
    }

    showSub(sub) {
        this.sub = sub;
        this.subIndex++;
        this.video.pause();
        setTimeout(() => {
            this.video.play();
            this.sub = null;
        }, sub.duration * 1000);
    }

    init(videoSrc, audioSrc, subs) {
        console.log(subs);
        this.video.src = videoSrc;
        this.audio.src = audioSrc;
        this.video.volume = 0;
        this.audio.volume = 0.2;
        this.subs = subs;
        this.subIndex = 0;
    }

    setDimensions() {
        const ratio = this.canvas.clientWidth / this.canvas.clientHeight;

        this.width = CANVAS_WIDTH;
        this.height = this.width / ratio;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render() {
        if (!this.playing && !this.sub) {
            return;
        }

        if (this.sub) {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.width, this.height);
            // TODO: Вынести в функцию
            let fontSize = this.height / 14;
            let lineHeight = fontSize * 1.2;
            this.ctx.font = `${fontSize}px Oranienbaum`;
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.sub.text.split('\n').forEach((line, index, text) => {
                let length = text.length;
                let offset = (index - length / 2 + 0.5) * lineHeight;

                this.ctx.fillText(line, 20, this.height / 2 + offset);
            });
        } else {
            let frame = this.getFrame();

            frame = this.desaturateFrame(frame);
            this.ctx.putImageData(frame, 0, 0);
        }
        // TODO: Эффект царапин, зернистость пленки

        requestAnimationFrame(this.render);
    }

    getFrame() {
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);

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

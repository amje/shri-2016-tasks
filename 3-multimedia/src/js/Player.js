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

    handleVideoTimeUpdate() {
        requestAnimationFrame(() => {
            this.progressPlayed.style.transform = `scaleX(${this.video.currentTime / this.video.duration})`;
        });
    }

    handleVideoEnded() {
        this.playing = false;
        this.playButton.classList.remove('play-button_pause');
    }

    handleProgressBarClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();

        this.video.currentTime = (e.clientX - rect.left) / rect.width * this.video.duration;
    }

    play() {
        this.video.play();
        this.playing = true;
        requestAnimationFrame(this.render);
    }

    pause() {
        this.video.pause();
        this.playing = false;
    }

    init(urls) {
        this.video.src = urls.video;
        this.video.volume = 0;
        this.video.addEventListener('loadedmetadata', () => {
            this.setDimensions();
        });
    }

    setDimensions() {
        const ratio = this.canvas.clientWidth / this.canvas.clientHeight;

        this.width = 300;
        this.height = this.width / ratio;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render() {
        if (!this.playing) {
            return;
        }

        let frame = this.getFrame();

        frame = this.desaturateFrame(frame);
        // TODO: Эффект царапин, зернистость пленки

        this.ctx.putImageData(frame, 0, 0);
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

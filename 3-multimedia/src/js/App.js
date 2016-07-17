import Form from './Form';
import Player from './Player';

class App {
    constructor() {
        this.form = new Form(this.handleFormSubmit.bind(this));
        this.player = new Player();

        // For testing
        this.handleFormSubmit({
            video: 'kinopoisk.ru-Sherlock-284167.mp4',
            subs: 'https://raw.githubusercontent.com/shri-msk-2016/dz-multimedia/master/subs.srt',
            audio: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Maple_Leaf_RagQ.ogg'
        });
    }

    handleFormSubmit(urls) {
        this.showPlayerPage();
        this.getSubs(urls.subs)
            .then(parseSubs)
            .then((parsedSubs) => {
                this.player.init(urls.video, urls.audio, parsedSubs);
            })
            .catch((e) => console.log(e));
    }

    showPlayerPage() {
        const pages = document.querySelectorAll('.page');
        const pagesArray = Array.of(...pages);
        const playerPage = pagesArray.find((page) => page.classList.contains('page_player'));

        pagesArray.forEach((page) => page.classList.add('page_hidden'));
        playerPage.classList.remove('page_hidden');
    }

    getSubs(url) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState !== 4) {
                    return;
                }

                resolve(xhr.responseText);
            });
            xhr.open('GET', url);
            xhr.send(null);
        });
    }
}

function parseSubs(data) {
    return data.split('\n\n').map((subsChunk) => {
        let [, time, ...text] = subsChunk.split('\n');
        text = text.join('\n');
        const [from, to] = time.split(' --> ');
        const fromSeconds = subTimeStringToSeconds(from);
        const toSeconds = subTimeStringToSeconds(to);
        const duration = Math.round((toSeconds - fromSeconds) * 1e3) / 1e3;

        return {
            start: Math.round(toSeconds * 1e3) / 1e3,
            duration,
            text
        };
    });
}

function subTimeStringToSeconds(timestring) {
    const [hh, mm, ss, ms] = timestring.split(/[:,]/);

    return hh * 3600 + mm * 60 + ss * 1 + ms / 1000;
}

const app = new App();

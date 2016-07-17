import Form from './Form';
import Player from './Player';

class App {
    constructor() {
        this.form = new Form(this.handleFormSubmit.bind(this));
        this.player = new Player();

        // For testing
        this.handleFormSubmit({
            video: 'http://localhost:8080/kinopoisk.ru-Sherlock-284167.mp4',
            subs: 'https://raw.githubusercontent.com/shri-msk-2016/dz-multimedia/master/subs.srt',
            audio: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Maple_Leaf_RagQ.ogg'
        });
    }

    handleFormSubmit(data) {
        this.showPlayerPage();
        this.player.init(data);
    }

    showPlayerPage() {
        const pages = document.querySelectorAll('.page');
        const pagesArray = Array.of(...pages);
        const playerPage = pagesArray.find((page) => page.classList.contains('page_player'));

        pagesArray.forEach((page) => page.classList.add('page_hidden'));
        playerPage.classList.remove('page_hidden');
    }
}

const app = new App();

import Form from './Form';
import Player from './Player';

class App {
    constructor() {
        this.form = new Form(this.handleFormSubmit.bind(this));
        this.player = new Player();
    }

    handleFormSubmit(data) {
        console.log('Data:', data);
    }
}

const app = new App();

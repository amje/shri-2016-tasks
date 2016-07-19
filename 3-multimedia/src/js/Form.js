export default class Form {
    constructor(onSubmitCallback) {
        this.onSubmitCallback = onSubmitCallback;
        this.element = document.querySelector('.form');
        this.inputs = this.element.querySelectorAll('.form__input');
        this.element.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        const data = Array.of(...this.inputs).reduce((result, input) => {
            result[input.name] = input.value;

            return result;
        }, {});

        this.onSubmitCallback(data);
        e.preventDefault();
    }
}

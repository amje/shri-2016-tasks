modules.define('canvas', ['i-bem__dom'], function(provide, BEMDOM) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            'js': {
                'inited': function() {
                    this.canvas = this.domElem[0];
                    this.canvas.width = this.width = this.canvas.clientWidth;
                    this.canvas.height = this.height = this.canvas.clientHeight;
                    this.ctx = this.canvas.getContext('2d');
                    this.effectIndex = 0;

                    this.bindTo('click', this._onClick);
                }
            }
        },

        _onClick: function() {
            this.emit('click');
        },

        loadImage(img) {
            this.ctx.drawImage(img, 0, 0, this.width, this.height);
            this.srcImageData = this.ctx.getImageData(0, 0, this.width, this.height);
        },

        applyNextEffect() {
            var effectsKeys = Object.keys(this._effects);
            this.effectIndex = (this.effectIndex + 1) % effectsKeys.length;

            this.ctx.putImageData(this.srcImageData, 0, 0);
            var frame = this.ctx.getImageData(0, 0, this.width, this.height);
            this._effects[effectsKeys[this.effectIndex]].call(this, frame);
            this.ctx.putImageData(frame, 0, 0);
        },

        _effects: {
            normal: function() {},
            grayscale: function(frame) {
                var data = frame.data;
                var length = data.length / 4;

                for (var i = 0; i < length; i++) {
                    var rIndex = i * 4;
                    var gIndex = i * 4 + 1;
                    var bIndex = i * 4 + 2;
                    var R = data[rIndex];
                    var G = data[gIndex];
                    var B = data[bIndex];
                    var gray = R * 0.21 + G * 0.72 + B * 0.07;

                    data[rIndex] = data[gIndex] = data[bIndex] = gray;
                }
            },
            negative: function(frame) {
                var data = frame.data;
                var length = data.length / 4;

                for (var i = 0; i < length; i++) {
                    var rIndex = i * 4;
                    var gIndex = i * 4 + 1;
                    var bIndex = i * 4 + 2;
                    var R = data[rIndex];
                    var G = data[gIndex];
                    var B = data[bIndex];

                    data[rIndex] = 255 - R;
                    data[gIndex] = 255 - G;
                    data[bIndex] = 255 - B;
                }
            },
            sepia(frame) {
                var data = frame.data;
                var length = data.length / 4;

                for (var i = 0; i < length; i++) {
                    var rIndex = i * 4;
                    var gIndex = i * 4 + 1;
                    var bIndex = i * 4 + 2;
                    var R = data[rIndex];
                    var G = data[gIndex];
                    var B = data[bIndex];

                    data[rIndex] = R * 0.393 + G * 0.769 + B * 0.189;
                    data[gIndex] = R * 0.349 + G * 0.686 + B * 0.168;
                    data[bIndex] = R * 0.272 + G * 0.534 + B * 0.131;
                }
            }
        }
    }));
});


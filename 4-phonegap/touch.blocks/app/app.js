modules.define('app', ['i-bem__dom'], function(provide, BEMDOM) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            'js': {
                'inited': function() {
                    this.canvas = this.findBlockInside('canvas');
                    this.button = this.findBlockInside('button');

                    this.bindToDoc('deviceready', this._onDeviceReady);
                }
            }
        },

        _onDeviceReady: function() {
            this.canvas.on('click', this._onCanvasClick, this);
            this.button.on('click', this._onButtonClick, this);
        },

        _onCanvasClick: function() {
            this.canvas.applyNextEffect();
        },

        _onButtonClick: function() {
            var self = this;

            navigator.camera.getPicture(function(data) {
                var img = new Image();
                img.addEventListener('load', function() {
                    self.canvas.loadImage(img);
                }.bind(self));
                img.src = data;
            }, function() {
                alert('В доступе к камере отказано');
            });
        }
    }));
});

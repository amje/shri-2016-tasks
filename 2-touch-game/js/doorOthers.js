// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function(b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function(b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        if (isOpened) {
            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия второй двери здесь ====
    var container = this.popup.querySelector('.locks-riddle');
    var locks = [].slice.call(this.popup.querySelectorAll('.locks-riddle__lock'));
    var keys = [].slice.call(this.popup.querySelectorAll('.locks-riddle__key'));
    var dropAreas = [];
    var touchData = {};
    var DROPPED_TIMEOUT = 200;

    keys.forEach(function(key) {
        key.addEventListener('pointerdown', _onKeyPointerDown.bind(this));
    }, this);

    locks.forEach(function(lock) {
        var rect = lock.getBoundingClientRect();
        dropAreas.push({
            fromX: rect.left,
            toX: rect.right,
            fromY: rect.top,
            toY: rect.bottom,
            color: lock.classList.contains('locks-riddle__lock_color_yellow') ? 'yellow' : 'blue',
            dropped: false
        });
    });

    container.addEventListener('pointermove', _.throttle(_onContainerPointerMove.bind(this), 50));
    container.addEventListener('pointerup', _onContainerPointerUp.bind(this));
    container.addEventListener('pointercancel', _onContainerPointerUp.bind(this));

    function _onKeyPointerDown(e) {
        // Запоминаем данные о нажатии на ключ
        touchData[e.pointerId] = {
            x: e.clientX,
            y: e.clientY,
            target: e.target,
            color: e.target.classList.contains('locks-riddle__key_color_yellow') ? 'yellow' : 'blue'
        };
        e.target.classList.add('locks-riddle__key_dragging');
    }

    function _onContainerPointerMove(e) {
        var touch = touchData[e.pointerId];

        if (!touch) {
            return;
        }
        touch.target.style.transform = 'translate(' + [e.clientX - touch.x, e.clientY - touch.y].join('px, ') + 'px)';
    }

    function _onContainerPointerUp(e) {
        var data = touchData[e.pointerId];

        if (!data) {
            return;
        }

        // Проверяем правильно ли отпущен ключ
        var droppedArea = dropAreas.filter(function(dropArea) {
            return !dropArea.dropped &&
                dropArea.color === data.color &&
                e.clientX >= dropArea.fromX && e.clientX <= dropArea.toX &&
                e.clientY >= dropArea.fromY && e.clientY <= dropArea.toY;
        })[0];

        if (droppedArea) {
            droppedArea.dropped = true;
            setTimeout(function() {
                droppedArea.dropped = false;
                restoreTouchData(e.pointerId);
            }, DROPPED_TIMEOUT);
        } else {
            restoreTouchData(e.pointerId);
        }

        checkCondition.apply(this);
    }

    /**
     * Восстановить началльное положение ключа по id нажатия
     * @param pointerId - id нажатия
     */
    function restoreTouchData(pointerId) {
        var data = touchData[pointerId];

        data.target.style.transform = '';
        data.target.classList.remove('locks-riddle__key_dragging');
        delete touchData[pointerId];
    }

    function checkCondition() {
        if (dropAreas.every(function(dropArea) { return dropArea.dropped; })) {
            this.unlock();
        }
    }
    // ==== END Напишите свой код для открытия второй двери здесь ====
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия третей двери здесь ====
    // Для примера дверь откроется просто по клику на неё
    this.popup.addEventListener('click', function() {
        this.unlock();
    }.bind(this));
    // ==== END Напишите свой код для открытия третей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия сундука здесь ====
    // Для примера сундук откроется просто по клику на него
    this.popup.addEventListener('click', function() {
        this.unlock();
    }.bind(this));
    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function() {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;

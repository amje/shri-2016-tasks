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
    var locks = [].slice.call(this.popup.querySelectorAll('.locks-riddle__lock'));
    var keys = [].slice.call(this.popup.querySelectorAll('.locks-riddle__key'));
    var dropAreas = [];
    var pointerData = {};
    var DROP_TIMEOUT = 50;

    keys.forEach(function(key) {
        key.addEventListener('pointerdown', _onKeyPointerDown.bind(this));
        key.addEventListener('pointermove', _onContainerPointerMove.bind(this));
        key.addEventListener('pointerup', _onContainerPointerUp.bind(this));
        key.addEventListener('pointercancel', _onContainerPointerUp.bind(this));
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

    function _onKeyPointerDown(e) {
        pointerData[e.pointerId] = {
            startX: e.clientX,
            startY: e.clientY,
            target: e.target,
            color: e.target.classList.contains('locks-riddle__key_color_yellow') ? 'yellow' : 'blue'
        };
        e.target.classList.add('locks-riddle__key_dragging');
        e.target.setPointerCapture(e.pointerId);
    }

    function _onContainerPointerMove(e) {
        var pointer = pointerData[e.pointerId];

        if (!pointer) {
            return;
        }

        pointer.currentX = e.clientX;
        pointer.currentY = e.clientY;
        updatePosition(pointer);
    }

    function _onContainerPointerUp(e) {
        var pointerId = e.pointerId;
        var data = pointerData[pointerId];

        if (!data) {
            return;
        }

        e.target.releasePointerCapture(e.pointerId);

        // Проверяем правильно ли отпущен ключ
        var droppedArea = dropAreas.filter(function(dropArea) {
            return !dropArea.dropped &&
                dropArea.color === data.color &&
                data.currentX >= dropArea.fromX && data.currentX <= dropArea.toX &&
                data.currentY >= dropArea.fromY && data.currentY <= dropArea.toY;
        })[0];

        if (droppedArea) {
            droppedArea.dropped = true;
            checkCondition.apply(this);
            setTimeout(function() {
                droppedArea.dropped = false;
                restorePosition(pointerId);
            }, DROP_TIMEOUT);
        } else {
            restorePosition(pointerId);
        }
    }

    function updatePosition(pointer) {
        requestAnimationFrame(function() {
            var offsetX = pointer.currentX - pointer.startX;
            var offsetY = pointer.currentY - pointer.startY;
            pointer.target.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
        });
    }

    function restorePosition(pointerId) {
        requestAnimationFrame(function() {
            var data = pointerData[pointerId];
            data.target.style.transform = '';
            data.target.classList.remove('locks-riddle__key_dragging');
        });
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
    var container = this.popup.querySelector('.door-riddle');
    var vesselCover = this.popup.querySelector('.door-riddle__vessel-cover');
    var buttonsPressed = 0;
    var level = 0;
    var decreaseTimer = null;
    var pressTimerByPointerId = {};

    var PRESS_INCREASE = 4;
    var TIMER_DECREASE = 2;
    var DECREASE_INTERVAL = 300;
    var SECOND_PRESS_TIMEOUT = 100;

    container.addEventListener('pointerdown', function(e) {
        if (e.target.classList.contains('door-riddle__button')) {
            _onButtonPointerDown.call(this, e);
        }
    });

    container.addEventListener('pointerup', function(e) {
        if (e.target.classList.contains('door-riddle__button')) {
            _onButtonPointerUp.call(this, e);
        }
    });

    container.addEventListener('pointerleave', function(e) {
        if (e.target.classList.contains('door-riddle__button')) {
            _onButtonPointerUp.call(this, e);
        }
    });

    container.addEventListener('pointercancel', function(e) {
        if (e.target.classList.contains('door-riddle__button')) {
            _onButtonPointerUp.call(this, e);
        }
    });

    function _onButtonPointerDown(e) {
        buttonsPressed++;

        pressTimerByPointerId[e.pointerId] = setTimeout(function() {
            buttonsPressed = 0;
        }, SECOND_PRESS_TIMEOUT);

        if (buttonsPressed === 2) {
            level = Math.min(level + PRESS_INCREASE, 100);
            buttonsPressed = 0;
        }

        if (!decreaseTimer && level > 0) {
            decreaseTimer = setTimeout(decreaseLevelByTime, DECREASE_INTERVAL);
        }

        e.target.classList.add('door-riddle__button_pressed');

        updateVesselLevel();
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
        clearTimeout(pressTimerByPointerId[e.pointerId]);
        buttonsPressed = 0;
    }

    function decreaseLevelByTime() {
        level -= TIMER_DECREASE;
        if (level <= 0) {
            level = 0;
            clearTimeout(decreaseTimer);
            decreaseTimer = null;
        } else {
            decreaseTimer = setTimeout(decreaseLevelByTime, DECREASE_INTERVAL);
        }
        updateVesselLevel();
    }

    function updateVesselLevel() {
        requestAnimationFrame(function() {
            var vesselTop = 100 - level;

            vesselCover.style.transform = 'translateY(' + vesselTop + '%)';
        });
    }

    function checkCondition() {
        if (level >= 100) {
            clearTimeout(decreaseTimer);
            decreaseTimer = null;
            this.unlock();
        }
    }

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
    var container = this.popup.querySelector('.rotate-riddle');
    var lock = this.popup.querySelector('.rotate-riddle__lock');
    var n = [0, -1];
    var SCALE_PRECISION = 1e-2;
    var ANGLE_PRECISION = Math.PI / 360;
    var startState = {};
    var startAngle;
    var startScale;
    var currentAngle = Math.random() * Math.PI * 2;
    var currentScale = 0;
    var gestureStarted = false;
    var pointerEvents = [];

    container.addEventListener('pointerdown', _onPointerDown.bind(this));
    container.addEventListener('pointermove', _onPointerMove.bind(this));
    container.addEventListener('pointerup', _onPointerUp.bind(this));
    container.addEventListener('pointerleave', _onPointerUp.bind(this));
    container.addEventListener('pointercancel', _onPointerUp.bind(this));

    update();

    function radToDeg(value) {
        return value / Math.PI * 180;
    }

    function _onPointerDown(e) {
        if (!gestureStarted) {
            pointerEvents.push(e);

            if (pointerEvents.length === 2) {
                gestureStarted = true;
                startState = getGestureState();
                startAngle = currentAngle;
                startScale = currentScale;
            }
        }
    }

    function _onPointerMove(e) {
        if (!gestureStarted) {
            return;
        }

        for (var i = 0; i < pointerEvents.length; i++) {
            if (pointerEvents[i].pointerId === e.pointerId) {
                pointerEvents[i] = e;
                break;
            }
        }

        var currentState = getGestureState();
        var angleDiff = startState.angle - currentState.angle;
        var distanceDiff = startState.distance - currentState.distance;

        currentAngle = (startAngle - angleDiff + 2 * Math.PI) % (2 * Math.PI);
        currentScale = Math.max(0, Math.min(startScale - distanceDiff / 50 * 0.2, 3));

        update();
        checkCondition.apply(this);
    }

    function _onPointerUp(e) {
        for (var i = 0; i < pointerEvents.length; i++) {
            if (pointerEvents[i].pointerId === e.pointerId) {
                pointerEvents.splice(i, 1);
                break;
            }
        }

        if (pointerEvents.length !== 2) {
            gestureStarted = false;
        }
    }

    function getGestureState() {
        var p1 = pointerEvents[0];
        var p2 = pointerEvents[1];

        var v = [p1.clientX - p2.clientX, p1.clientY - p2.clientY];
        var angle = Math.atan2(n[0] * v[1] - v[0] * n[1], n[0] * v[0] + n[1] * v[1]);
        var diffX = p1.clientX - p2.clientX;
        var diffY = p1.clientY - p2.clientY;
        var distance = Math.sqrt(diffX * diffX + diffY * diffY);

        return {
            angle: angle,
            distance: distance
        }
    }

    function update() {
        requestAnimationFrame(function() {
            lock.style.transform = ['rotate(', radToDeg(currentAngle), 'deg) ', 'scale(', currentScale, ')'].join('');
        });
    }

    function checkCondition() {
        if (
            (currentAngle < ANGLE_PRECISION || currentAngle > Math.PI * 2 - ANGLE_PRECISION) &&
            Math.abs(currentScale - 1) < SCALE_PRECISION
        ) {
            this.unlock();
        }
    }

    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function() {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;

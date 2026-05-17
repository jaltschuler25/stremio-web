// webOS Magic Remote key code mapping
// Maps LG remote-specific keyCodes to standard keyboard events
// that Stremio's existing KeyboardShortcuts and spatial-navigation-polyfill understand

const WEBOS_KEY_MAP = {
    461: 'Backspace',    // Back
    415: 'MediaPlay',    // Play
    19:  'MediaPause',   // Pause
    413: 'MediaStop',    // Stop
    417: 'MediaForward',  // Fast Forward
    412: 'MediaRewind',   // Rewind
    403: 'ColorF0Red',    // Red button
    404: 'ColorF1Green',  // Green button
    405: 'ColorF2Yellow', // Yellow button
    406: 'ColorF3Blue',   // Blue button
    457: 'Info',          // Info
};

// Player-specific mappings: remote media keys -> keyboard keys the Player component handles
const PLAYER_KEY_MAP = {
    415: { code: 'Space', key: ' ' },        // Play -> Space (toggle play/pause)
    19:  { code: 'Space', key: ' ' },        // Pause -> Space
    413: { code: 'Space', key: ' ' },        // Stop -> Space
    417: { code: 'ArrowRight', key: 'ArrowRight' }, // FF -> Right arrow (seek forward)
    412: { code: 'ArrowLeft', key: 'ArrowLeft' },   // Rewind -> Left arrow (seek back)
    13:  { code: 'Space', key: ' ', onlyIfNoFocusedButton: true }, // OK/Enter -> play/pause only when no button focused
};

function WebOSRemote() {
    let active = false;

    function isPlayerActive() {
        return window.location.hash.startsWith('#/player');
    }

    function getKeyCode(code) {
        if (code === 'Space') return 32;
        if (code === 'ArrowRight') return 39;
        if (code === 'ArrowLeft') return 37;
        return 0;
    }

    function dispatchSynthetic(target, type, mapping) {
        target.dispatchEvent(new KeyboardEvent(type, {
            code: mapping.code,
            key: mapping.key,
            keyCode: getKeyCode(mapping.code),
            bubbles: true,
            cancelable: true,
        }));
    }

    function onKeyDown(event) {
        if (event.keyCode === 461) {
            event.preventDefault();
            // Dispatch as Escape first so modals intercept before navigation
            const escEvent = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape',
                keyCode: 27,
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(escEvent);
            if (escEvent.defaultPrevented) return;
            // If no modal consumed the event, dispatch Backspace for navigation
            document.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'Backspace',
                key: 'Backspace',
                keyCode: 8,
                bubbles: true,
                cancelable: true,
            }));
            return;
        }

        if (isPlayerActive() && PLAYER_KEY_MAP[event.keyCode]) {
            const mapping = PLAYER_KEY_MAP[event.keyCode];

            if (mapping.onlyIfNoFocusedButton) {
                const el = document.activeElement;
                if (el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('tabindex') === '0')) {
                    return;
                }
            }

            event.preventDefault();
            const target = document.activeElement || document;
            dispatchSynthetic(target, 'keydown', mapping);
        }
    }

    // Player listens on keyup for Space to toggle play/pause
    function onKeyUp(event) {
        if (isPlayerActive() && PLAYER_KEY_MAP[event.keyCode]) {
            const mapping = PLAYER_KEY_MAP[event.keyCode];

            if (mapping.onlyIfNoFocusedButton) {
                const el = document.activeElement;
                if (el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('tabindex') === '0')) {
                    return;
                }
            }

            event.preventDefault();
            const target = document.activeElement || document;
            dispatchSynthetic(target, 'keyup', mapping);
        }
    }

    this.start = function() {
        if (active) return;
        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp, true);
        active = true;
    };

    this.stop = function() {
        window.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('keyup', onKeyUp, true);
        active = false;
    };

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() { return active; }
        }
    });
}

module.exports = WebOSRemote;

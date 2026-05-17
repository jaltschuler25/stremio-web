// Auto-hides TV navigation bars after a period of inactivity.
// Uses data-tv-nav attributes for element detection (immune to CSS Modules hashing).
// Navigation reappears on any D-pad input and hides again after idle timeout.

const { useState, useEffect, useRef, useCallback } = require('react');

const IDLE_TIMEOUT_MS = 4000;
const isTV = () => document.documentElement.classList.contains('webos-tv');

function useTVNavAutoHide() {
    const [navHidden, setNavHidden] = useState(false);
    const idleTimerRef = useRef(null);

    const resetIdleTimer = useCallback(() => {
        if (!isTV()) return;

        setNavHidden(false);

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        idleTimerRef.current = setTimeout(() => {
            const activeEl = document.activeElement;
            const isInNav = activeEl?.closest('[data-tv-nav]');
            if (!isInNav) {
                setNavHidden(true);
            }
        }, IDLE_TIMEOUT_MS);
    }, []);

    useEffect(() => {
        if (!isTV()) return;

        const onKeyDown = () => {
            resetIdleTimer();
        };

        window.addEventListener('keydown', onKeyDown, { passive: true });
        resetIdleTimer();

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [resetIdleTimer]);

    return { navHidden, resetIdleTimer };
}

module.exports = useTVNavAutoHide;

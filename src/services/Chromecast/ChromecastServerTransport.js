// Copyright (C) 2017-2023 Smart code 203358507
// Additional Chromecast transport: uses the bundled streaming server's
// HTTP casting API when the Google Cast Sender SDK is unavailable (e.g. WKWebView).

const EventEmitter = require('eventemitter3');
const hat = require('hat');
const runChromecastServerShim = require('./chromecastServerShim');

const MESSAGE_NAMESPACE = 'urn:x-cast:com.stremio';
const CHUNK_SIZE = 20000;

const DEFAULT_STREAMING_SERVER_URL = 'http://127.0.0.1:11470';

function ChromecastServerTransport() {
    const events = new EventEmitter();
    const messages = {};

    runChromecastServerShim({ serverUrl: DEFAULT_STREAMING_SERVER_URL });

    if (typeof cast === 'undefined' || !cast.framework) {
        setTimeout(() => {
            events.emit('init-error', new Error('Cast server shim did not initialise window.cast'));
        }, 0);
        return;
    }

    Promise.resolve()
        .then(() => {
            cast.framework.CastContext.getInstance().addEventListener(
                cast.framework.CastContextEventType.CAST_STATE_CHANGED,
                onCastStateChanged
            );
            cast.framework.CastContext.getInstance().addEventListener(
                cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                onSesstionStateChanged
            );
        })
        .then(() => {
            try {
                events.emit('init');
            } catch (error) {
                console.error('ChromecastServerTransport', error);
            }
        })
        .catch((error) => {
            events.emit('init-error', error);
        });

    function onMessage(_, message) {
        try {
            const { id, chunk, index, length } = JSON.parse(message);
            messages[id] = messages[id] || [];
            messages[id][index] = chunk;
            if (Object.keys(messages[id]).length === length) {
                const parsedMessage = JSON.parse(messages[id].join(''));
                delete messages[id];
                events.emit('message', parsedMessage);
            }
        } catch (error) {
            events.emit('message-error', error);
        }
    }
    function onApplicationStatusChanged(event) {
        events.emit(cast.framework.CastSession.APPLICATION_STATUS_CHANGED, event);
    }
    function onApplicationMetadataChanged(event) {
        events.emit(cast.framework.CastSession.APPLICATION_METADATA_CHANGED, event);
    }
    function onActiveInputStateChanged(event) {
        events.emit(cast.framework.CastSession.ACTIVE_INPUT_STATE_CHANGED, event);
    }
    function onVolumeChanged(event) {
        events.emit(cast.framework.CastSession.VOLUME_CHANGED, event);
    }
    function onMediaSessionChanged(event) {
        events.emit(cast.framework.CastSession.MEDIA_SESSION, event);
    }
    function onCastStateChanged(event) {
        events.emit(cast.framework.CastContextEventType.CAST_STATE_CHANGED, event);
    }
    function onSesstionStateChanged(event) {
        events.emit(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, event);
        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_STARTED: {
                event.session.addMessageListener(MESSAGE_NAMESPACE, onMessage);
                event.session.addEventListener(cast.framework.CastSession.APPLICATION_STATUS_CHANGED, onApplicationStatusChanged);
                event.session.addEventListener(cast.framework.CastSession.APPLICATION_METADATA_CHANGED, onApplicationMetadataChanged);
                event.session.addEventListener(cast.framework.CastSession.ACTIVE_INPUT_STATE_CHANGED, onActiveInputStateChanged);
                event.session.addEventListener(cast.framework.CastSession.VOLUME_CHANGED, onVolumeChanged);
                event.session.addEventListener(cast.framework.CastSession.MEDIA_SESSION, onMediaSessionChanged);
                break;
            }
            case cast.framework.SessionState.SESSION_ENDED: {
                event.session.removeMessageListener(MESSAGE_NAMESPACE, onMessage);
                event.session.removeEventListener(cast.framework.CastSession.APPLICATION_STATUS_CHANGED, onApplicationStatusChanged);
                event.session.removeEventListener(cast.framework.CastSession.APPLICATION_METADATA_CHANGED, onApplicationMetadataChanged);
                event.session.removeEventListener(cast.framework.CastSession.ACTIVE_INPUT_STATE_CHANGED, onActiveInputStateChanged);
                event.session.removeEventListener(cast.framework.CastSession.VOLUME_CHANGED, onVolumeChanged);
                event.session.removeEventListener(cast.framework.CastSession.MEDIA_SESSION, onMediaSessionChanged);
                break;
            }
        }
    }

    this.on = function(name, listener) {
        events.on(name, listener);
    };
    this.off = function(name, listener) {
        events.off(name, listener);
    };
    this.removeAllListeners = function() {
        events.removeAllListeners();
    };
    this.getCastState = function() {
        return cast.framework.CastContext.getInstance().getCastState();
    };
    this.getSessionState = function() {
        return cast.framework.CastContext.getInstance().getSessionState();
    };
    this.getCastDevice = function() {
        const session = cast.framework.CastContext.getInstance().getCurrentSession();
        if (session !== null) {
            return session.getCastDevice();
        }

        return null;
    };
    this.setOptions = function(options) {
        cast.framework.CastContext.getInstance().setOptions(options);
    };
    this.requestSession = function() {
        return cast.framework.CastContext.getInstance().requestSession();
    };
    this.endCurrentSession = function(stopCasting) {
        cast.framework.CastContext.getInstance().endCurrentSession(stopCasting);
    };
    this.sendMessage = function(message) {
        const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
        if (castSession !== null) {
            const serializedMessage = JSON.stringify(message);
            const chunksCount = Math.ceil(serializedMessage.length / CHUNK_SIZE);
            const chunks = [];
            for (let i = 0; i < chunksCount; i++) {
                const start = i * CHUNK_SIZE;
                const chunk = serializedMessage.slice(start, start + CHUNK_SIZE);
                chunks.push(chunk);
            }
            const id = hat();
            return Promise.all(chunks.map((chunk, index) => {
                return castSession.sendMessage(MESSAGE_NAMESPACE, {
                    id,
                    chunk,
                    index,
                    length: chunks.length
                });
            }));
        } else {
            return Promise.reject(new Error('Session not started', { cause: 'castSession is null.' }));
        }
    };
}

ChromecastServerTransport.probeStreamingServer = async function(serverUrl = DEFAULT_STREAMING_SERVER_URL) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${serverUrl}/settings`, {
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timer);
        return res.ok || res.status === 307;
    } catch {
        return false;
    }
};

module.exports = ChromecastServerTransport;

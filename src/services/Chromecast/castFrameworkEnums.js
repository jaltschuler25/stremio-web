// Copyright (C) 2017-2023 Smart code 203358507
// Cast Application Framework string enums (align with Google Cast Web Sender v3).
// Used when the `cast` global may not yet be defined (WKWebView shells loading before cast_sender finishes).

module.exports = {
    CastState: {
        NO_DEVICES_AVAILABLE: 'NO_DEVICES_AVAILABLE',
        NOT_CONNECTED: 'NOT_CONNECTED',
        CONNECTING: 'CONNECTING',
        CONNECTED: 'CONNECTED'
    },
    CastContextEventType: {
        CAST_STATE_CHANGED: 'caststatechanged',
        SESSION_STATE_CHANGED: 'sessionstatechanged'
    }
};

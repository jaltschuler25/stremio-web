// Netflix-style seek direction indicator for TV remote D-pad navigation.
// Shows a "« 10s" or "10s »" bubble on left/right arrow press during playback.

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles');

const SeekIndicator = React.memo(({ direction, visible, duration }) => {
    if (!visible) return null;

    const seconds = Math.round((duration || 10000) / 1000);

    return (
        <div className={classnames(
            styles['seek-indicator'],
            styles[direction === 'forward' ? 'seek-forward' : 'seek-backward']
        )}>
            <div className={styles['seek-indicator-content']}>
                <Icon
                    className={styles['seek-icon']}
                    name={direction === 'forward' ? 'chevron-forward' : 'chevron-back'}
                />
                <Icon
                    className={styles['seek-icon']}
                    name={direction === 'forward' ? 'chevron-forward' : 'chevron-back'}
                />
                <div className={styles['seek-label']}>{seconds}s</div>
            </div>
        </div>
    );
});

SeekIndicator.displayName = 'SeekIndicator';

SeekIndicator.propTypes = {
    direction: PropTypes.oneOf(['forward', 'backward']),
    visible: PropTypes.bool,
    duration: PropTypes.number,
};

module.exports = SeekIndicator;

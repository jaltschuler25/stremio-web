// Netflix-style hero billboard for the TV Board home screen.
// Displays the first item from the first ready catalog as a large
// featured banner with poster backdrop, title, and quick-play action.

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button, Image } = require('stremio/components');
const styles = require('./styles');

const HeroBillboard = React.memo(({ className, items }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    // Rotate featured item every 8 seconds
    React.useEffect(() => {
        if (!items || items.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % Math.min(items.length, 5));
        }, 8000);
        return () => clearInterval(interval);
    }, [items]);

    if (!items || items.length === 0) return null;

    const item = items[Math.min(activeIndex, items.length - 1)];
    const href = item.deepLinks?.metaDetailsStreams
        ?? item.deepLinks?.metaDetailsVideos
        ?? item.deepLinks?.player
        ?? null;

    return (
        <div className={classnames(className, styles['hero-container'])}>
            <div className={styles['hero-backdrop']}>
                <Image
                    className={styles['hero-image']}
                    src={item.poster}
                    alt={' '}
                />
                <div className={styles['hero-gradient-bottom']} />
                <div className={styles['hero-gradient-left']} />
            </div>

            <div className={styles['hero-content']}>
                <div className={styles['hero-title']}>{item.name}</div>
                {item.type && (
                    <div className={styles['hero-meta']}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                )}
                <div className={styles['hero-actions']}>
                    {href && (
                        <Button className={styles['hero-play-button']} href={href}>
                            <Icon className={styles['hero-play-icon']} name={'play'} />
                            <span className={styles['hero-play-label']}>More Info</span>
                        </Button>
                    )}
                </div>

                {items.length > 1 && (
                    <div className={styles['hero-dots']}>
                        {items.slice(0, 5).map((_, i) => (
                            <button
                                key={i}
                                className={classnames(styles['hero-dot'], {
                                    [styles['hero-dot-active']]: i === activeIndex
                                })}
                                onClick={() => setActiveIndex(i)}
                                tabIndex={-1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

HeroBillboard.displayName = 'HeroBillboard';

HeroBillboard.propTypes = {
    className: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        poster: PropTypes.string,
        type: PropTypes.string,
        deepLinks: PropTypes.object,
    })),
};

module.exports = HeroBillboard;

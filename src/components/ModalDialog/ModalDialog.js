// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useRouteFocused, useModalsContainer } = require('stremio-router');
const { default: Button } = require('stremio/components/Button');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Modal } = require('stremio-router');
const styles = require('./styles');

const isTV = () => typeof document !== 'undefined' && document.documentElement.classList.contains('webos-tv');

const ModalDialog = ({ className, title, buttons, children, dataset, onCloseRequest, background, ...props }) => {
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const modalsContainer = useModalsContainer();
    const modalContainerRef = React.useRef(null);
    const dialogContentRef = React.useRef(null);
    const closeButtonOnClick = React.useCallback((event) => {
        if (typeof onCloseRequest === 'function') {
            onCloseRequest({
                type: 'close',
                dataset: dataset,
                reactEvent: event,
                nativeEvent: event.nativeEvent
            });
        }
    }, [dataset, onCloseRequest]);
    const onModalContainerMouseDown = React.useCallback((event) => {
        if (!event.nativeEvent.closeModalDialogPrevented && typeof onCloseRequest === 'function') {
            onCloseRequest({
                type: 'close',
                dataset: dataset,
                reactEvent: event,
                nativeEvent: event.nativeEvent
            });
        }
    }, [dataset, onCloseRequest]);
    const onModalDialogContainerMouseDown = React.useCallback((event) => {
        event.nativeEvent.closeModalDialogPrevented = true;
    }, []);
    React.useEffect(() => {
        const onKeyDown = (event) => {
            const isTopModal = modalsContainer.childNodes[modalsContainer.childElementCount - 2] === modalContainerRef.current;
            // Escape or webOS Back button (keyCode 461) closes the modal
            if ((event.code === 'Escape' || event.keyCode === 461) && isTopModal) {
                if (typeof onCloseRequest === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onCloseRequest({
                        type: 'close',
                        dataset: dataset,
                        nativeEvent: event
                    });
                }
            }
        };
        if (routeFocused) {
            window.addEventListener('keydown', onKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [routeFocused, dataset, onCloseRequest]);
    // TV: auto-focus first focusable element inside the modal
    React.useEffect(() => {
        if (!isTV() || !dialogContentRef.current) return;
        const focusable = dialogContentRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
            focusable.focus();
        }
    }, []);
    return (
        <Modal ref={modalContainerRef} {...props} className={classnames(className, styles['modal-container'])} onMouseDown={onModalContainerMouseDown}>
            <div className={styles['modal-dialog-container']} onMouseDown={onModalDialogContainerMouseDown} style={isTV() ? { '--spatial-navigation-contain': 'contain' } : undefined}>
                <div className={styles['modal-dialog-background']} style={{backgroundImage: `url('${background}')`}} />
                <Button className={styles['close-button-container']} title={t('BUTTON_CLOSE')} tabIndex={isTV() ? 0 : undefined} onClick={closeButtonOnClick}>
                    <Icon className={styles['icon']} name={'close'} />
                </Button>
                <div ref={dialogContentRef} className={styles['modal-dialog-content']}>
                    {
                        typeof title === 'string' && title.length > 0 ?
                            <div className={styles['title-container']} title={title}>{title}</div>
                            :
                            null
                    }
                    <div className={styles['body-container']}>
                        {children}
                    </div>
                    {
                        Array.isArray(buttons) && buttons.length > 0 ?
                            <div className={styles['buttons-container']}>
                                {buttons.map(({ className, label, icon, props }, index) => (
                                    <Button title={label} {...props} key={index} className={classnames(className, styles['action-button'])}>
                                        {
                                            typeof icon === 'string' && icon.length > 0 ?
                                                <Icon className={styles['icon']} name={icon} />
                                                :
                                                null
                                        }
                                        {
                                            typeof label === 'string' && label.length > 0 ?
                                                <div className={styles['label']}>{label}</div>
                                                :
                                                null
                                        }
                                    </Button>
                                ))}
                            </div>
                            :
                            null
                    }
                </div>
            </div>
        </Modal>
    );
};

ModalDialog.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    background: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        className: PropTypes.string,
        label: PropTypes.string,
        icon: PropTypes.string,
        props: PropTypes.object
    })),
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    dataset: PropTypes.object,
    onCloseRequest: PropTypes.func
};

module.exports = ModalDialog;

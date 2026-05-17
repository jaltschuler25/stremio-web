// Copyright (C) 2017-2024 Smart code 203358507

import React, { forwardRef, useCallback } from 'react';
import { type KeyboardEvent, type InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import styles from './styles.less';

const isTV = () => typeof document !== 'undefined' && document.documentElement.classList.contains('webos-tv');

type Props = InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
    disabled?: boolean;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSubmit?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

const TextInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
    const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        props.onKeyDown && props.onKeyDown(event);

        if (event.key === 'Enter' ) {
            props.onSubmit && props.onSubmit(event);
        }

        // Prevent spatial navigation from stealing arrow keys while focused on a text input
        if (isTV() && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            (event.nativeEvent as any).spatialNavigationPrevented = true;
        }
    }, [props.onKeyDown, props.onSubmit]);

    return (
        <input
            size={1}
            autoCorrect={'off'}
            autoCapitalize={'off'}
            autoComplete={'off'}
            spellCheck={false}
            tabIndex={0}
            {...props}
            ref={ref}
            className={classnames(props.className, styles['text-input'], { 'disabled': props.disabled })}
            onKeyDown={onKeyDown}
        />
    );
});

TextInput.displayName = 'TextInput';

export default TextInput;

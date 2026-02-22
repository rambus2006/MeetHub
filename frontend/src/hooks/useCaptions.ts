import { useCallback, useState } from 'react';

export function useCaptionsState(initialEnabled: boolean = false) {
    const [enabled, setEnabled] = useState<boolean>(initialEnabled);
    const [text, setText] = useState<string>('');
    const toggle = useCallback(() => setEnabled((v) => !v), []);
    return { enabled, setEnabled, toggle, text, setText };
}



'use client';

import { useState, useEffect } from 'react';

export default function ClientWrapper({ children }) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Set initial state
        setShouldRender(window.innerWidth >= 1415);

        // Handle resize
        const handleResize = () => {
            setShouldRender(window.innerWidth >= 1415);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (!shouldRender) return null;
    
    return children;
} 
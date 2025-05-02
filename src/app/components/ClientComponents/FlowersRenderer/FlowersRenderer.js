'use client';

import { usePathname } from 'next/navigation';
import SideFlowers from '../../ServerComponents/SideFlowers/SideFlowers';
import { useState, useEffect } from 'react';

export default function FlowersRenderer() {
    const pathname = usePathname();
    const [windowWidth, setWindowWidth] = useState(0);
    
    useEffect(() => {
        // Set initial window width
        setWindowWidth(window.innerWidth);
        
        // Update window width when it changes
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return (
        <div>
            {windowWidth >= 1415 && (
                <SideFlowers pathname={pathname} />   
            )}
        </div>
    );
} 
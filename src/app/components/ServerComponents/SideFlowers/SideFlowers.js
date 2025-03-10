'use client';
import './SideFlowers.css';
import Image from 'next/image';
import rightSideFlower from '/public/rightSideFlower.png';
import leftSideFlower from '/public/leftSideFlower.png';
import ClientWrapper from '../../ClientComponents/ClientSidesWrapper/ClientWrapper';
import { usePathname } from 'next/navigation';

export default function SideFlowers() {
    const pathname = usePathname();

    return (
        <ClientWrapper>
            <div>
                {pathname === '/' && (
                    <>
                        <Image src={rightSideFlower} className="rightSideFlower" alt="rightSideFlower" draggable={false} />
                        <Image src={leftSideFlower} className="leftSideFlower" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlower2" alt="rightSideFlower" draggable={false} />
                        <Image src={leftSideFlower} className="leftSideFlower2" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlower3" alt="rightSideFlower" draggable={false} />
                        <Image src={leftSideFlower} className="leftSideFlower3" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlower4" alt="rightSideFlower" draggable={false} /> 
                    </>
                )}
                {pathname === '/login' && (
                    <>
                        <Image src={rightSideFlower} className="rightSideFlowerLogin" alt="rightSideFlower" draggable={false} />
                        <Image src={leftSideFlower} className="leftSideFlowerLogin" alt="leftSideFlower" draggable={false} />
                    </>
                )} 
            </div>
        </ClientWrapper>
    );
}
import './SideFlowers.css';
import Image from 'next/image';
import rightSideFlower from '/public/rightSideFlower.png';
import leftSideFlower from '/public/leftSideFlower.png';
import ClientWrapper from '../../ClientComponents/ClientSidesWrapper/ClientWrapper';

export default function SideFlowers() {
    return (
        <ClientWrapper>
            <div>
                <Image src={rightSideFlower} className="rightSideFlower" alt="rightSideFlower" draggable={false} />
                <Image src={leftSideFlower} className="leftSideFlower" alt="leftSideFlower" draggable={false} />
                <Image src={rightSideFlower} className="rightSideFlower2" alt="rightSideFlower" draggable={false} />
                <Image src={leftSideFlower} className="leftSideFlower2" alt="leftSideFlower" draggable={false} />
                <Image src={rightSideFlower} className="rightSideFlower3" alt="rightSideFlower" draggable={false} />
                <Image src={leftSideFlower} className="leftSideFlower3" alt="leftSideFlower" draggable={false} />
                <Image src={rightSideFlower} className="rightSideFlower4" alt="rightSideFlower" draggable={false} />
            </div>
        </ClientWrapper>
    );
}
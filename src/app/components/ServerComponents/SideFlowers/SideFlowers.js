import './SideFlowers.css';
import Image from 'next/image';
import rightSideFlower from '/public/rightSideFlower.png';
import leftSideFlower from '/public/leftSideFlower.png';


export default function SideFlowers({pathname}) {

    return (
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
                {pathname === '/loggedIn' && (
                    <>
                        <Image src={leftSideFlower} className="leftSideFlowerLoggedIn" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlowerLoggedIn" alt="rightSideFlower" draggable={false} />
                    </>
                )}

                {pathname === '/hiveDetails' && (
                    <>
                        <Image src={leftSideFlower} className="leftSideFlowerHiveDetails" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlowerHiveDetails" alt="rightSideFlower" draggable={false} />
                        <Image src={leftSideFlower} className="leftSideFlowerHiveDetails2" alt="leftSideFlower" draggable={false} />
                        <Image src={rightSideFlower} className="rightSideFlowerHiveDetails2" alt="rightSideFlower" draggable={false} />
                    </>
                )}
            </div>
    );
}
"use client"; // Use this in Next.js 13+ App Router

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";


const ScrollToTop = () => {

  const handleClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <button
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <p style={{fontSize: '12px', fontWeight: 'bold', fontFamily: 'FreeMono, monospace', marginLeft: '-3px'}}>Swipe up</p>
      <div className="arrow-up">
        <ArrowUp size={44} />
      </div>
    </button>
  );
};

export default ScrollToTop;

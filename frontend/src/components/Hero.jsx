import React from 'react'

import { assets } from '../assets/assets'

const Hero = () => {

  
  return (
    <div className="flex flex-col sm:flex-row border border-gray-300">
      {/* Text Section */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-gray-700 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="w-8 h-[2px] bg-gray-700"></p>
            <p className="text-sm font-medium">OUR BESTSELLERS</p>
          </div>

          <h1 className="text-3xl lg:text-5xl font-serif py-3 prata-regular">
            Latest Arrivals
          </h1>

          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="text-sm font-semibold">SHOP NOW</p>
            <p className="w-8 h-[1px] bg-gray-700"></p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="flex-1">
        <img src={assets.hero_img} className="w-full h-auto" alt="Hero" />
      </div>
    </div>
  )
}

export default Hero

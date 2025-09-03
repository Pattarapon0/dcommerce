"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

interface ProductImageGalleryProps {
  images: string[];
  mainImage?: string;
  productName: string;
}

export default function ProductImageGallery({ 
  images, 
  mainImage, 
  productName 
}: ProductImageGalleryProps) {
  const allImages = mainImage ? [mainImage, ...images.filter(img => img !== mainImage)] : images;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!allImages.length) {
    return (
      <div className="aspect-[5/3] md:aspect-[7/3] bg-gray-100 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <Swiper
          modules={[Navigation, Pagination, Zoom]}
          navigation={allImages.length > 1}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-gray-400',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600',
          }}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
          }}
          className="aspect-[5/3] bg-gray-100 rounded-lg overflow-hidden [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white [&_.swiper-button-next]:!bg-black/20 [&_.swiper-button-prev]:!bg-black/20 [&_.swiper-button-next]:!w-8 [&_.swiper-button-prev]:!w-8 [&_.swiper-button-next]:!h-8 [&_.swiper-button-prev]:!h-8 [&_.swiper-button-next]:!rounded-full [&_.swiper-button-prev]:!rounded-full [&_.swiper-pagination]:!bottom-3"
        >
          {allImages.map((image, index) => (
            <SwiperSlide key={index} className="relative">
              <div className="swiper-zoom-container w-full h-full">
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={index === 0}
                  quality={85}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Zoom instruction */}
        <div className="text-center mt-1 text-xs text-gray-500">
          Tap image to zoom
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block xl:hidden">
        <Swiper
          modules={[Navigation, Pagination, Zoom]}
          navigation={allImages.length > 1}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-gray-400',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600',
          }}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
          }}
          className="aspect-[7/3] bg-gray-100 rounded-lg overflow-hidden [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white [&_.swiper-button-next]:!bg-black/20 [&_.swiper-button-prev]:!bg-black/20 [&_.swiper-button-next]:!w-8 [&_.swiper-button-prev]:!w-8 [&_.swiper-button-next]:!h-8 [&_.swiper-button-prev]:!h-8 [&_.swiper-button-next]:!rounded-full [&_.swiper-button-prev]:!rounded-full [&_.swiper-pagination]:!bottom-3"
        >
          {allImages.map((image, index) => (
            <SwiperSlide key={index} className="relative">
              <div className="swiper-zoom-container w-full h-full">
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={index === 0}
                  quality={85}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Zoom instruction */}
        <div className="text-center mt-1 text-xs text-gray-500">
          Tap image to zoom
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="space-y-3 max-w-lg">
          {/* Main Swiper */}
          <Swiper
            modules={[Navigation, Pagination, Zoom, Thumbs]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation={allImages.length > 1}
            zoom={{
              maxRatio: 4,
              minRatio: 1,
            }}
            className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white [&_.swiper-button-next]:!bg-black/30 [&_.swiper-button-prev]:!bg-black/30 [&_.swiper-button-next]:!w-10 [&_.swiper-button-prev]:!w-10 [&_.swiper-button-next]:!h-10 [&_.swiper-button-prev]:!h-10 [&_.swiper-button-next]:!rounded-full [&_.swiper-button-prev]:!rounded-full"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index} className="relative">
                <div className="swiper-zoom-container w-full h-full">
                  <Image
                    src={image}
                    alt={`${productName} - Main image`}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 512px"
                    priority={index === 0}
                    quality={90}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnails Swiper */}
          {allImages.length > 1 && (
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[FreeMode, Thumbs]}
              spaceBetween={6}
              slidesPerView={6}
              freeMode={true}
              watchSlidesProgress={true}
              className="!h-12"
            >
              {allImages.map((image, index) => (
                <SwiperSlide key={index} className="!h-12">
                  <div className="relative w-full h-full bg-gray-100 rounded cursor-pointer border border-transparent hover:border-blue-300 transition-all duration-200">
                    <Image
                      src={image}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      className="object-cover object-center"
                      sizes="80px"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          
          {/* Zoom instruction */}
          <div className="text-center text-xs text-gray-500">
            Click to zoom
          </div>
        </div>
      </div>
    </div>
  );
}
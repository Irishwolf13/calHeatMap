import React, { useState, useRef } from 'react';
import { IonBackButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import MainMenu from '../../components/MainMenu/MainMenu';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import './ImageSwiper.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';

const ImageSwiper: React.FC = () => {
  const currentJob = useSelector((state: RootState) => state.currentJob.currentJob);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

  const displaySlides = () => {
    if (!currentJob) return;
    if (currentJob.images && currentJob.images.length > 0) {
      return currentJob.images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="image-container">
            <img src={image.url} alt={`Slide ${index + 1}`} />
          </div>
        </SwiperSlide>
      ));
    } else {
      return <p>No images available</p>;
    }
  };

  const updateCurrentIndex = (swiper: { activeIndex: React.SetStateAction<number>; }) => {
    setCurrentIndex(swiper.activeIndex);
  };

  return (
    <>
      <MainMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Image Viewer</IonTitle>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="slide-counter">
            {(currentJob?.images?.length ?? 0) > 0 && (<p> {currentIndex + 1} of {currentJob?.images?.length} </p>)}
          </div>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={updateCurrentIndex}
            onSwiper={(swiper) => {
              console.log(swiper);
              // @ts-ignore
              swiperRef.current = swiper;
            }}
            scrollbar={{ draggable: true }}
          >
            {displaySlides()}
          </Swiper>
        </IonContent>
        <IonFooter>
          <IonToolbar></IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default ImageSwiper;

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import MainMenu from '../../components/MainMenu/MainMenu';
import CalendarMenu from '../../components/CalendarMenu/CalendarMenu';
import CalendarCell from '../../components/CalendarCell/CalendarCell';
import './InfiniteScrollCalendar.css';

const InfiniteScrollCalendar: React.FC = () => {
  const [dates, setDates] = useState<{ date: Date; key: string }[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  // const [currentMonthYear, setCurrentMonthYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Manage loading state
  const [fadeOut, setFadeOut] = useState(false); // Manage fade-out state
  const [firstSelectedDate, setFirstSelectedDate] = useState<Date | null>(null);
  const [secondSelectedDate, setSecondSelectedDate] = useState<Date | null>(null);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const initialDates = generateInitialDates();
    setDates(initialDates);

    // Set timeout to start fade-out effect after 1 second
    const loadingTimeout = setTimeout(() => {
      setFadeOut(true);
      // Remove loading screen after fade-out duration (e.g., 500ms)
      setTimeout(() => {
        setIsLoading(false);
      }, 250);
    }, 500);

    return () => clearTimeout(loadingTimeout);
  }, []);

  useLayoutEffect(() => {
    if (dates.length) {
      if (isLoading === true) {
        scrollHalfwayDown();
      }
    }
  }, [dates]);

  const generateInitialDates = (): { date: Date; key: string }[] => {
    const today = new Date();
    return generateDatesWithinRange(new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth() + 2, 0));
  };

  const generateDatesWithinRange = (startDate: Date, endDate: Date): { date: Date; key: string }[] => {
    const datesList: { date: Date; key: string }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      datesList.push({
        date: new Date(currentDate),
        key: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return datesList;
  };

  const handleScroll = () => {
    if (!calendarRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = calendarRef.current;
    const threshold = 100; // Preload when within 100px of the top or bottom

    if (scrollTop < threshold) {
      preloadPreviousDates();
    } else if (scrollTop + clientHeight > scrollHeight - threshold) {
      preloadNextDates();
    }
  };

  const pruneOldDates = (newStartDate: Date) => {
    setDates(prevDates => prevDates.filter(dateObj => dateObj.date >= newStartDate));
  };

  const pruneFutureDates = (newEndDate: Date) => {
    setDates(prevDates => prevDates.filter(dateObj => dateObj.date <= newEndDate));
  };

  const preloadPreviousDates = () => {
    if (dates.length === 0) return;

    const firstDate = dates[0].date;
    const newStartDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - 1, 1);
    const newEndDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 0);
    const newDates = generateDatesWithinRange(newStartDate, newEndDate);

    setDates(prev => [...newDates, ...prev]);
    pruneFutureDates(new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 0));
  };

  const preloadNextDates = () => {
    if (dates.length === 0) return;

    const lastDate = dates[dates.length - 1].date;
    const newStartDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
    const newEndDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 2, 0);
    const newDates = generateDatesWithinRange(newStartDate, newEndDate);

    setDates(prev => [...prev, ...newDates]);
    pruneOldDates(new Date(lastDate.getFullYear(), lastDate.getMonth() - 2, 1));
  };

  const scrollHalfwayDown = () => {
    if (calendarRef.current) {
      const scrollHeight = calendarRef.current.scrollHeight;
      const middlePosition = scrollHeight / 2;

      calendarRef.current.scrollTo({
        top: middlePosition,
        behavior: 'smooth'
      });
    }
  };

  const dateClicked = (myDate: Date) => {
    if (firstSelectedDate && 
      myDate.getDate() === firstSelectedDate.getDate() &&
      myDate.getMonth() === firstSelectedDate.getMonth() &&
      myDate.getFullYear() === firstSelectedDate.getFullYear()) {

      // Deselect both first and second selected dates
      setFirstSelectedDate(null);
      setSecondSelectedDate(null);

    } else if (secondSelectedDate && 
      myDate.getDate() === secondSelectedDate.getDate() &&
      myDate.getMonth() === secondSelectedDate.getMonth() &&
      myDate.getFullYear() === secondSelectedDate.getFullYear()) {

      // Deselect the second selected date
      setSecondSelectedDate(null);

    } else if (!firstSelectedDate) {
      // Select as the first date
      setFirstSelectedDate(myDate);

    } else if (firstSelectedDate && !secondSelectedDate) {
      if (myDate < firstSelectedDate) {
        // Swap dates if the new date is earlier than the first selected date
        setSecondSelectedDate(firstSelectedDate);
        setFirstSelectedDate(myDate);
      } else {
        // Select as the second date
        setSecondSelectedDate(myDate);
      }

    } else if (firstSelectedDate && secondSelectedDate) {
      // If both dates are already selected, update the second date with the new selection
      if (myDate < firstSelectedDate) {
        // Swap dates if the new date is earlier than the first selected date
        setSecondSelectedDate(firstSelectedDate);
        setFirstSelectedDate(myDate);
      } else {
        setSecondSelectedDate(myDate);
      }
    }

    console.log(`Clicked on date: ${myDate}`);
  };

  const renderCalendarCell = ({ date, key }: { date: Date; key: string }) => (
    <CalendarCell
      key={key}
      date={date}
      firstSelectedDate={firstSelectedDate}
      secondSelectedDate={secondSelectedDate}
      today={new Date()}
      handleClick={dateClicked}
    />
  );

  return (
    <>
      <MainMenu />
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
            </IonToolbar>
          </IonHeader>
          {isLoading && (
            <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
              <div className="loading-spinner"></div>
            </div>
          )}
          <div className="calendar-page">
            <div className="operation-section">
            <CalendarMenu 
              firstSelectedDate={firstSelectedDate}
              secondSelectedDate={secondSelectedDate}
            />
            </div>
            <div className="calendar-section">
              <div className="week-header">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="week-day">
                  {day}
                </div>
              ))}
            </div>
            <div ref={calendarRef} className="calendar-grid" onScroll={handleScroll}>
              {dates.map(renderCalendarCell)}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  </>
);
};

export default InfiniteScrollCalendar;
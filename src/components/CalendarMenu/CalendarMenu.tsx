import './CalendarMenu.css';

interface CalendarMenuProps {
  firstSelectedDate: Date | null;
  secondSelectedDate: Date | null;
}

const CalendarMenu: React.FC<CalendarMenuProps> = ({ firstSelectedDate, secondSelectedDate }) => {
  return (
    <div>
      <div>
        {'First date selected: '}
        {firstSelectedDate ? firstSelectedDate.toLocaleDateString() : 'None'}
      </div>
      <div>
        {'Second date selected: '}
        {secondSelectedDate ? secondSelectedDate.toLocaleDateString() : 'None'}
      </div>
    </div>
  );
};

export default CalendarMenu;

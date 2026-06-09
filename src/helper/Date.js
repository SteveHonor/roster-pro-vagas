import moment from 'moment';

export default {
  getAllDaysOfWeekInMonth(year, month, weekday) {
    const days = [];
    const date = moment([year, Number(month) - 1, 1]);
    const today = moment();

    const daysInMonth = date.daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      date.date(day);

      if (date.isoWeekday() === weekday && date.isSameOrAfter(today, 'day')) {
        days.push(day);
      }
    }

    return days;
  }
};

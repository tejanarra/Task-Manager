// utils/dateUtils.js
export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
  
    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `${hours} h${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / secondsInDay);
      if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      } else {
        // For dates older than a week, return the date in 'MMM DD, YYYY' format
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    }
  };
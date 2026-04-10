const DateUtils = {
    /**
     * Formats a date value into "DD/MM/YYYY HH:MM:SS GMT".
     * @param {string|Date} dateValue - The date value to format.
     * @returns {string} - The formatted date and time.
     */
    formatDate: (dateValue) => {
        const date = new Date(dateValue);

        // Format the date part
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        const datePart = `${day}/${month}/${year}`;

        // Format the time part
        const timePart = date.toUTCString().split(' ')[4]; // Extracts the time part

        // Combine date and time
        return `${datePart} ${timePart} GMT`;
    },

    /**
     * Formats a time duration from milliseconds into "Xh Xm Xs".
     * @param {number} milliseconds - The duration in milliseconds.
     * @returns {string} - The formatted time duration.
     */
    formatTime: (milliseconds) => {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        let formattedTime = "";
        if (hours > 0) {
            formattedTime += `${hours}h `;
        }
        if (minutes > 0) {
            formattedTime += `${minutes}m `;
        }
        formattedTime += `${seconds}s`;

        return formattedTime.trim();
    },

    /**
     * Formats a time duration to "X months ago".
     * @param {string|Date} dateValue - The date value to format
     * @returns {string} - The formatted value.
     */
    timeAgo: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30); // Approximate month calculation
        
        if (months > 0) {
            return `${months} months ago`;
        } else if (days > 0) {
            return `${days} days ago`;
        } else if (hours > 0) {
            return `${hours} hours ago`;
        } else if (minutes > 0) {
            return `${minutes} minutes ago`;
        } else {
            return `${seconds} seconds ago`;
        }
    }
      
};
export default DateUtils;
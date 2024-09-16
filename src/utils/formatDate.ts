export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Pad minutes with leading zero if necessary

  return `${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes}${ampm}`;
}

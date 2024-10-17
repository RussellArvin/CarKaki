/**
 * Converts a time string in the format "HH.MM AM/PM" to a format suitable for Drizzle ORM.
 * @param timeString - The time string to convert (e.g., "07.00 AM")
 * @returns A string in the format "HH:MM:SS" suitable for Drizzle ORM
 * @throws Error if the input string is invalid or cannot be parsed
 */
export function convertToDrizzleTime(timeString: string): string {
  if (!timeString || typeof timeString !== 'string') {
    throw new Error('Invalid input: timeString must be a non-empty string');
  }

  const parts = timeString.split(' ');
  if (parts.length !== 2) {
    throw new Error('Invalid time format: expected "HH.MM AM/PM"');
  }

  const [time, period] = parts;
  const [hoursStr, minutesStr] = time!.split('.');

  if (!hoursStr || !minutesStr || !period) {
    throw new Error('Invalid time format: missing hours, minutes, or period');
  }

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid time format: hours and minutes must be numbers');
  }

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time: hours must be 1-12, minutes must be 0-59');
  }

  if (period.toUpperCase() !== 'AM' && period.toUpperCase() !== 'PM') {
    throw new Error('Invalid period: must be AM or PM');
  }

  // Convert to 24-hour format
  let adjustedHours = hours;
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    adjustedHours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    adjustedHours = 0;
  }

  // Format the time as HH:MM:SS
  return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

/**
 * Formats a time string from Drizzle ORM to a string in the format "HH.MM AM/PM".
 * @param timeString - The time string from Drizzle ORM (format: "HH:MM:SS") or undefined
 * @returns A formatted time string, or "--:-- --" if the input is undefined or invalid
 */
export function formatFromDrizzleTime(timeString: string | undefined): string {
  // Check if the input is undefined or doesn't match the expected format
  if (timeString === undefined || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeString)) {
    return "--:-- --";
  }

  const [hoursStr, minutesStr] = timeString.split(':');
  
  // Additional check to ensure hoursStr and minutesStr are defined
  if (hoursStr === undefined || minutesStr === undefined) {
    return "--:-- --";
  }

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Check if parsing was successful
  if (isNaN(hours) || isNaN(minutes)) {
    return "--:-- --";
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours.toString().padStart(2, '0')}.${formattedMinutes} ${period}`;
}
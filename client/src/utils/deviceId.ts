/**
 * Generate or retrieve a unique device ID
 * This is used to track which device the user is logged in on
 */
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    // Create a new unique device ID
    deviceId = `device-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
};

/**
 * Clear the device ID (used during logout)
 */
export const clearDeviceId = (): void => {
  localStorage.removeItem("deviceId");
};

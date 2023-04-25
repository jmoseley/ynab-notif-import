import { NotificationPayload } from "./notificationHandler";

interface Filter {
  app: string | RegExp;
  name?: string | RegExp;
  text?: string | RegExp;
}

// device paring from messaging
const DEVICE_PAIRING = {
  app: "com.google.android.apps.messaging",
  name: "Device pairing",
};

const SLACK = {
  app: "com.Slack",
};

const TELEGRAM = {
  app: "org.telegram.messenger",
};

const GMAIL = {
  app: "com.google.android.gm",
};

const WHATSAPP = {
  app: "com.whatsapp",
};

const CALENDAR = {
  app: "com.google.android.calendar",
};

const SYSTEM = {
  app: "android",
};

const CLASSDOJO = {
  app: "com.classdojo.android",
};

const FILTERS: Filter[] = [
  DEVICE_PAIRING,
  SLACK,
  TELEGRAM,
  GMAIL,
  WHATSAPP,
  CALENDAR,
  SYSTEM,
  CLASSDOJO,
];

export const filterNotification = (notification: NotificationPayload) => {
  // filter out notifications that match the string or regex
  const matches = FILTERS.filter((filter) => {
    // if the notification matches any of the properties in the filter, return true
    return (
      matchesFilter(notification.app, filter.app) ||
      (filter.name && matchesFilter(notification.title, filter.name)) ||
      (filter.text && matchesFilter(notification.text, filter.text))
    );
  });

  return matches.length > 0;
};

const matchesFilter = (value: string, filter: string | RegExp) => {
  if (typeof filter === "string") {
    return value.includes(filter);
  } else {
    return filter.test(value);
  }
};

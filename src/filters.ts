export const filterNotification = (notification: NotificationPayload) => {
  // filter out notifications that match the string or regex
  const matches = FILTERS.filter((filter) => {
    if (filter.app instanceof RegExp) {
      return filter.app.test(notification.app);
    } else {
      return filter.app === notification.app;
    }
    if (filter.name) {
      if (filter.name instanceof RegExp) {
        return filter.name.test(notification.title);
      } else {
        return filter.name === notification.title;
      }
    }
    if (filter.text) {
      if (filter.text instanceof RegExp) {
        return filter.text.test(notification.text);
      } else {
        return filter.text === notification.text;
      }
    }
  });

  return matches.length > 0;
};

interface Filter {
  app: string | Regex;
  name?: string | Regex;
  text?: string | Regex;
}
const FILTERS: Filter[] = [DEVICE_PAIRING];

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

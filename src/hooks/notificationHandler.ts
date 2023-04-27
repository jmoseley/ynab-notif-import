import { filterNotification } from "./filters";
import { getData, storeData } from "./storage";
import { handleNotification } from "./ynab";

export interface NotificationPayload {
  time: string;
  app: string;
  title: string;
  titleBig: string;
  text: string;
  subText: string;
  summaryText: string;
  bigText: string;
  audioContentsURI: string;
  imageBackgroundURI: string;
  extraInfoText: string;
  groupedMessages: Array<{
    title: string;
    text: string;
  }>;
  icon: string;
  image: string;
}

/**
 * Note that this method MUST return a Promise.
 * Is that why I'm using an async function here.
 */
export const notificationHandler = async (params: {
  notification?: string | null;
}) => {
  const { notification: notificationStr } = params;
  /**
   * This notification is a JSON string in the follow format:
   *  {
   *      "time": string,
   *      "app": string,
   *      "title": string,
   *      "titleBig": string,
   *      "text": string,
   *      "subText": string,
   *      "summaryText": string,
   *      "bigText": string,
   *      "audioContentsURI": string,
   *      "imageBackgroundURI": string,
   *      "extraInfoText": string,
   *      "groupedMessages": Array<Object> [
   *          {
   *              "title": string,
   *              "text": string
   *          }
   *      ],
   *      "icon": string (base64),
   *      "image": string (base64), // WARNING! THIS MAY NOT WORK FOR SOME APPLICATIONS SUCH TELEGRAM AND WHATSAPP
   *  }
   *
   * Note that these properties depend on the sender configuration so many times a lot of them will be empty
   */

  if (notificationStr) {
    let notification = { text: notificationStr } as NotificationPayload;
    try {
      notification = JSON.parse(notificationStr) as NotificationPayload;
    } catch (e) {
      console.error("Error parsing notification", e);
    }

    if (filterNotification(notification)) {
      console.info("Notification filtered");
      return;
    }

    const handled = await handleNotification(notification);
    // if (handled) {
    //   console.info("Notification handled");
    //   return;
    // }

    /**
     * You could store the notifications in an external API.
     * I'm using AsyncStorage in the example project.
     */
    const existingNotifications = ((await getData("@notifications")) ||
      []) as NotificationPayload[];

    existingNotifications.push(notification);

    await storeData("@notifications", existingNotifications);
  }
};

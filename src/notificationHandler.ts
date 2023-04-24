import { getData, storeData } from "./storage";

export interface Notification {
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
export const notificationHandler = async ({
  notificationStr,
}: {
  notificationStr?: string | null;
}) => {
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
    const notification = JSON.parse(notificationStr) as Notification;
    console.info("notification", notification);

    /**
     * You could store the notifications in an external API.
     * I'm using AsyncStorage in the example project.
     */
    const existingNotifications = ((await getData("@notifications")) ||
      []) as Notification[];

    existingNotifications.push(notification);

    await storeData("@notifications", existingNotifications);
  }
};

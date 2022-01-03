export class WebhookPayloadEntity {
  /**
   * UUID column
   */
  id: string;

  /**
   * Name column
   */
  name: string;
  /**
   * Name column
   */
  tries: number;
  /**
   * event column
   */
  event: string;
  /**
   * url column
   */
  url: string;

  /**
   * secret column
   */
  secret: string;
  /**
   * conditions column
   */
  conditions: string;
  /**
   * created date column
   */
  createdDate: Date;

  /**
   * updated date column
   */
  updated: Date;

  /**
   * completed date column
   */
  completed: Date;

  /**
   * failed date column
   */
  failed: Date;

  /**
   * data column
   */
  data: string;
}

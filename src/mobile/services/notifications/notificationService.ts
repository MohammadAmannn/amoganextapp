export class NotificationService {
  public static async init(_onNotificationTap?: (conversationId: string) => void) {
    // Push notifications completely disabled per configuration
    return
  }
}

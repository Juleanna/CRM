from .models import Notification


def create_notification(recipient, title, message, notification_type, link=''):
    """Create a notification for a given recipient.

    Usage from other apps:
        from apps.notifications.services import create_notification
        from apps.notifications.models import Notification

        create_notification(
            recipient=user,
            title='Нове завдання',
            message='Вам призначено нове завдання',
            notification_type=Notification.NotificationType.TASK_CREATED,
            link='/tasks/42/',
        )
    """
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
    )

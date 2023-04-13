import { UINotification } from '~~/lib/types';

export default function () {
    const notification = useState<UINotification | undefined>('notification');

    let notificationTimeoutID: number;

    const startNotificationTimer = () => {
        if (notification.value) {
            notificationTimeoutID = window.setTimeout(() => {
                notification.value = undefined;
            }, 10000)
        }
    }

    const stopNotificationTimer = () => {
        if (notificationTimeoutID) {
            window.clearTimeout(notificationTimeoutID);
        }
    }

    watch(notification, () => {
        stopNotificationTimer();
        startNotificationTimer();
    })

    onMounted(() => {
        startNotificationTimer();
    })

    onUnmounted(() => {
        stopNotificationTimer();
    })

    return notification;
}
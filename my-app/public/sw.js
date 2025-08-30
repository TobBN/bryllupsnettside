self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const MILESTONES = [30, 7, 1]; // days before wedding

function scheduleNotification(days, weddingDate) {
  const targetTime = new Date(weddingDate).getTime() - days * 24 * 60 * 60 * 1000;
  const timeUntil = targetTime - Date.now();
  const show = () => self.registration.showNotification('Bryllupet nærmer seg!', {
    body: `${days} dager igjen til bryllupet!`,
    icon: '/romantic-silhouette.svg',
  });
  if (timeUntil <= 0) {
    show();
  } else if (timeUntil <= 2147483647) {
    setTimeout(show, timeUntil);
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'scheduleNotifications') {
    const weddingDate = event.data.weddingDate;
    MILESTONES.forEach((days) => scheduleNotification(days, weddingDate));
  }
});

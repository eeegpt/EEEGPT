const CACHE_NAME = 'EEEGPT-cache-v4';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './assets/cover.webp',
  './assets/profile.webp',
  './assets/icon.webp'
];


/* ================= INSTALL ================= */

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(FILES_TO_CACHE);

      })

  );

  /* নতুন Service Worker অপেক্ষা না করে activate করবে */
  self.skipWaiting();

});


/* ================= ACTIVATE ================= */

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    })

  );

  /* সব open page-এ নতুন Service Worker control নেবে */
  self.clients.claim();

});


/* ================= FETCH ================= */

self.addEventListener('fetch', event => {

  const request = event.request;


  /*
    ================= HTML / PAGE =================

    Online:
    নতুন version আগে নেবে।

    Offline:
    cache থেকে পুরোনো version খুলবে।
  */

  if (request.mode === 'navigate') {

    event.respondWith(

      fetch(request, {
        cache: 'no-cache'
      })

      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(request, copy);

          });

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

    );

    return;
  }


  /*
    ================= CSS / JS / ASSETS =================

    Online হলে নতুন file নেওয়ার চেষ্টা করবে।
    Network না থাকলে cache ব্যবহার করবে।
  */

  event.respondWith(

    fetch(request, {
      cache: 'no-cache'
    })

    .then(response => {

      /*
        Successful response হলে নতুন file cache করবে
      */

      if (response && response.status === 200) {

        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(request, copy);

          });

      }

      return response;

    })

    .catch(() => {

      /*
        Internet না থাকলে পুরোনো cached file
      */

      return caches.match(request);

    })

  );

});
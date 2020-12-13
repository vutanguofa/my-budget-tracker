// Module example
// const APP_PREFIX = 'FoodEvent-';     
// const VERSION = 'version_01';
// const CACHE_NAME = APP_PREFIX + VERSION
// const FILES_TO_CACHE = [
//   "./index.html",
//   "./events.html",
//   "./tickets.html",
//   "./schedule.html",
//   "./assets/css/style.css",
//   "./assets/css/bootstrap.css",
//   "./assets/css/tickets.css",
//   "./dist/app.bundle.js",
//   "./dist/events.bundle.js",
//   "./dist/tickets.bundle.js",
//   "./dist/schedule.bundle.js"
// ];

// // Respond with cached resources
// self.addEventListener('fetch', function (e) {
//   console.log('fetch request : ' + e.request.url)
//   e.respondWith(
//     caches.match(e.request).then(function (request) {
//       if (request) { // if cache is available, respond with cache
//         console.log('responding with cache : ' + e.request.url)
//         return request
//       } else {       // if there are no cache, try fetching request
//         console.log('file is not cached, fetching : ' + e.request.url)
//         return fetch(e.request)
//       }

//       // You can omit if/else for console.log & put one line below like this too.
//       // return request || fetch(e.request)
//     })
//   )
// })

// // Cache resources
// self.addEventListener('install', function (e) {
//   e.waitUntil(
//     caches.open(CACHE_NAME).then(function (cache) {
//       console.log('installing cache : ' + CACHE_NAME)
//       return cache.addAll(FILES_TO_CACHE)
//     })
//   )
// })

// // Delete outdated caches
// self.addEventListener('activate', function (e) {
//   e.waitUntil(
//     caches.keys().then(function (keyList) {
//       // `keyList` contains all cache names under your username.github.io
//       // filter out ones that has this app prefix to create keeplist
//       let cacheKeeplist = keyList.filter(function (key) {
//         return key.indexOf(APP_PREFIX);
//       })
//       // add current cache name to keeplist
//       cacheKeeplist.push(CACHE_NAME);

//       return Promise.all(keyList.map(function (key, i) {
//         if (cacheKeeplist.indexOf(key) === -1) {
//           console.log('deleting cache : ' + keyList[i] );
//           return caches.delete(keyList[i]);
//         }
//       }));
//     })
//   );
// });

const CACHE_NAME = "budget-trackercache";
const DATA_CACHE_NAME = "budget--tracker-data-cache";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "/js/index.js",
  "/js/idb.js",
  "/css/styles.css"
];

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching was successful!');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Delete outdated caches', key);
          return caches.delete(key);
        }
      })
      );
    })
  );

  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function (e) {
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(e.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(e.request);
            });
        })
        .catch(err => console.log(err))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then(function (response) {
        if (response) {
          return response;
        } else if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
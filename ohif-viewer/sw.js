/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (let registration of registrations) {
    registration.unregister();
  }
});

// https://developers.google.com/web/tools/workbox/guides/troubleshoot-and-debug
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0-beta.1/workbox-sw.js');

// Install newest
// https://developers.google.com/web/tools/workbox/modules/workbox-core
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Cache static assets that aren't precached
workbox.routing.registerRoute(/\.(?:js|css|json5)$/, new workbox.strategies.StaleWhileRevalidate({
  cacheName: 'static-resources'
}));

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/, new workbox.strategies.StaleWhileRevalidate({
  cacheName: 'google-fonts-stylesheets'
}));

// Cache the underlying font files with a cache-first strategy for 1 year.
workbox.routing.registerRoute(/^https:\/\/fonts\.gstatic\.com/, new workbox.strategies.CacheFirst({
  cacheName: 'google-fonts-webfonts',
  plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({
    statuses: [0, 200]
  }), new workbox.expiration.ExpirationPlugin({
    maxAgeSeconds: 60 * 60 * 24 * 365,
    // 1 Year
    maxEntries: 30
  })]
}));

// MESSAGE HANDLER
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        // TODO: We'll eventually want this to be user prompted
        // workbox.core.skipWaiting();
        // workbox.core.clientsClaim();
        // TODO: Global notification to indicate incoming reload
        break;
      default:
        console.warn(`SW: Invalid message type: ${event.data.type}`);
    }
  }
});
workbox.precaching.precacheAndRoute([{'revision':null,'url':'/12.bundle.b6c871aeaf586125ed9c.js'},{'revision':null,'url':'/125.bundle.253395f320b72180da63.js'},{'revision':null,'url':'/126.bundle.e76f946a41d0ac6fcb74.js'},{'revision':null,'url':'/181.bundle.75ce8f0e9be94aca6d0e.js'},{'revision':'8079c6447e119ba0680e8fab5875745d','url':'/181.css'},{'revision':null,'url':'/19.bundle.d13d2de7dac50eb33f6a.js'},{'revision':'51b8ed55f5b8d448837222f03bdd6de8','url':'/19.css'},{'revision':null,'url':'/202.bundle.ec714227032b22d4fa24.js'},{'revision':null,'url':'/220.bundle.f7e1c96c94245e70f2be.js'},{'revision':null,'url':'/221.bundle.9e69e836a33661e92e6f.js'},{'revision':'aa1d1f3e32367e42fe90399144d94577','url':'/221.css'},{'revision':null,'url':'/23.bundle.e008ad788170f2ed5569.js'},{'revision':null,'url':'/231.bundle.8aad229e39e23731d6c1.js'},{'revision':null,'url':'/236.bundle.b493e6422fe4499db19e.js'},{'revision':null,'url':'/250.bundle.7d3732a9738224da9a61.js'},{'revision':'0afb25509c7f072fbd7eda42c6895dbf','url':'/250.css'},{'revision':null,'url':'/281.bundle.5b48ee9f0e5ebd5b6f54.js'},{'revision':null,'url':'/359.bundle.21686a64b3a7c01745a4.js'},{'revision':'c4ea120c6da08aa75348edfa3e57ece9','url':'/36785fbd89b0e17f6099.wasm'},{'revision':null,'url':'/410.bundle.c9df318605b04ff911d5.js'},{'revision':null,'url':'/417.bundle.af0a207c29b109f84159.js'},{'revision':null,'url':'/43.bundle.9a332286b104ec2d4ebb.js'},{'revision':null,'url':'/451.bundle.a25e4f9497d2d6d1c3c2.js'},{'revision':null,'url':'/471.bundle.35e0ecf4d00c35be7d81.js'},{'revision':null,'url':'/485.bundle.8667a696ac2eaf99e4fa.js'},{'revision':'c377e1f5fe4a207d270c3f7a8dd3e3ca','url':'/5004fdc02f329ce53b69.wasm'},{'revision':null,'url':'/506.bundle.5eaf924fcf73f7feb08e.js'},{'revision':null,'url':'/530.bundle.a03b6f942ace3e1baa1e.js'},{'revision':null,'url':'/563.bundle.e970a20c5f352e755978.js'},{'revision':null,'url':'/575.bundle.d9386eb65dccf6534fad.js'},{'revision':'185e5e0a10fa6ab2fc7b3c38e63d550b','url':'/575.css'},{'revision':'51b8ed55f5b8d448837222f03bdd6de8','url':'/579.css'},{'revision':null,'url':'/604.bundle.a51f83e64004bca5f497.js'},{'revision':'62b4ae8445d191d5aab5503ce475724d','url':'/610.min.worker.js'},{'revision':'3c2206525c18cd87dd28082949a4e43e','url':'/610.min.worker.js.map'},{'revision':null,'url':'/613.bundle.a4839ad3c7347a3f9cf8.js'},{'revision':'5800265b6831396572fb5d32c6bd8eef','url':'/62ab5d58a2bea7b5a1dc.wasm'},{'revision':'ce10eced3ce34e663d86569b27f5bffb','url':'/65916ef3def695744bda.wasm'},{'revision':null,'url':'/663.bundle.bc959cdac21c1d35705b.js'},{'revision':null,'url':'/686.bundle.dccef1f36e4bc79bcc48.js'},{'revision':null,'url':'/687.bundle.3173517bf224f5006a5a.js'},{'revision':'cf3e4d4fa8884275461c195421812256','url':'/75788f12450d4c5ed494.wasm'},{'revision':'cc4a3a4da4ac1b863a714f93c66c6ef2','url':'/75a0c2dfe07b824c7d21.wasm'},{'revision':null,'url':'/775.bundle.2285e7e0e67878948c0d.js'},{'revision':null,'url':'/788.bundle.b1e25befdf3536d8a231.js'},{'revision':null,'url':'/814.bundle.a76b54f568ef4f42f871.js'},{'revision':null,'url':'/82.bundle.122d1b58bc3e22439dd9.js'},{'revision':null,'url':'/822.bundle.1e16a9254114bd0e8fdf.js'},{'revision':null,'url':'/886.bundle.29d0a93ba94cd2b1cd65.js'},{'revision':null,'url':'/933.bundle.6184b84edf14c687b936.js'},{'revision':'74c9647440e51f149ad12923d6ead952','url':'/945.min.worker.js'},{'revision':'cdf6f0457d4af2cef04fc41816241bc1','url':'/945.min.worker.js.map'},{'revision':'5dcd0ebd317213406ab3ce2a4edaff37','url':'/_headers'},{'revision':'52ba15caf05a85cdb1705e818eb02299','url':'/_redirects'},{'revision':'9be108ad27eca4188d01fcc7f3f4a3fd','url':'/app-config.js'},{'revision':'4d46bdc9a3d136c920e959eb85b0f5f7','url':'/app.bundle.css'},{'revision':null,'url':'/app.bundle.d7457cd96970f9269578.js'},{'revision':'cb4f64534cdf8dd88f1d7219d44490db','url':'/assets/android-chrome-144x144.png'},{'revision':'5cde390de8a619ebe55a669d2ac3effd','url':'/assets/android-chrome-192x192.png'},{'revision':'e7466a67e90471de05401e53b8fe20be','url':'/assets/android-chrome-256x256.png'},{'revision':'9bbe9b80156e930d19a4e1725aa9ddae','url':'/assets/android-chrome-36x36.png'},{'revision':'5698b2ac0c82fe06d84521fc5482df04','url':'/assets/android-chrome-384x384.png'},{'revision':'56bef3fceec344d9747f8abe9c0bba27','url':'/assets/android-chrome-48x48.png'},{'revision':'3e8b8a01290992e82c242557417b0596','url':'/assets/android-chrome-512x512.png'},{'revision':'517925e91e2ce724432d296b687d25e2','url':'/assets/android-chrome-72x72.png'},{'revision':'4c3289bc690f8519012686888e08da71','url':'/assets/android-chrome-96x96.png'},{'revision':'cf464289183184df09292f581df0fb4f','url':'/assets/apple-touch-icon-1024x1024.png'},{'revision':'0857c5282c594e4900e8b31e3bade912','url':'/assets/apple-touch-icon-114x114.png'},{'revision':'4208f41a28130a67e9392a9dfcee6011','url':'/assets/apple-touch-icon-120x120.png'},{'revision':'cb4f64534cdf8dd88f1d7219d44490db','url':'/assets/apple-touch-icon-144x144.png'},{'revision':'977d293982af7e9064ba20806b45cf35','url':'/assets/apple-touch-icon-152x152.png'},{'revision':'6de91b4d2a30600b410758405cb567b4','url':'/assets/apple-touch-icon-167x167.png'},{'revision':'87bff140e3773bd7479a620501c4aa5c','url':'/assets/apple-touch-icon-180x180.png'},{'revision':'647386c34e75f1213830ea9a38913525','url':'/assets/apple-touch-icon-57x57.png'},{'revision':'0c200fe83953738b330ea431083e7a86','url':'/assets/apple-touch-icon-60x60.png'},{'revision':'517925e91e2ce724432d296b687d25e2','url':'/assets/apple-touch-icon-72x72.png'},{'revision':'c9989a807bb18633f6dcf254b5b56124','url':'/assets/apple-touch-icon-76x76.png'},{'revision':'87bff140e3773bd7479a620501c4aa5c','url':'/assets/apple-touch-icon-precomposed.png'},{'revision':'87bff140e3773bd7479a620501c4aa5c','url':'/assets/apple-touch-icon.png'},{'revision':'05fa74ea9c1c0c3931ba96467999081d','url':'/assets/apple-touch-startup-image-1182x2208.png'},{'revision':'9e2cd03e1e6fd0520eea6846f4278018','url':'/assets/apple-touch-startup-image-1242x2148.png'},{'revision':'5591e3a1822cbc8439b99c1a40d53425','url':'/assets/apple-touch-startup-image-1496x2048.png'},{'revision':'337de578c5ca04bd7d2be19d24d83821','url':'/assets/apple-touch-startup-image-1536x2008.png'},{'revision':'cafb4ab4eafe6ef946bd229a1d88e7de','url':'/assets/apple-touch-startup-image-320x460.png'},{'revision':'d9bb9e558d729eeac5efb8be8d6111cc','url':'/assets/apple-touch-startup-image-640x1096.png'},{'revision':'038b5b02bac8b82444bf9a87602ac216','url':'/assets/apple-touch-startup-image-640x920.png'},{'revision':'2177076eb07b1d64d663d7c03268be00','url':'/assets/apple-touch-startup-image-748x1024.png'},{'revision':'4fc097443815fe92503584c4bd73c630','url':'/assets/apple-touch-startup-image-750x1294.png'},{'revision':'2e29914062dce5c5141ab47eea2fc5d9','url':'/assets/apple-touch-startup-image-768x1004.png'},{'revision':'87e13104edd0b8f21d90d3fbf3b5787c','url':'/assets/browserconfig.xml'},{'revision':'f3d9a3b647853c45b0e132e4acd0cc4a','url':'/assets/coast-228x228.png'},{'revision':'ad6e1def5c66193d649a31474bbfe45d','url':'/assets/favicon-16x16.png'},{'revision':'84d1dcdb6cdfa55e2f46be0c80fa5698','url':'/assets/favicon-32x32.png'},{'revision':'95fb44c4998a46109e49d724c060db24','url':'/assets/favicon.ico'},{'revision':'5df2a5b0cee399ac0bc40af74ba3c2cb','url':'/assets/firefox_app_128x128.png'},{'revision':'11fd9098c4b07c8a07e1d2a1e309e046','url':'/assets/firefox_app_512x512.png'},{'revision':'27cddfc922dca3bfa27b4a00fc2f5e36','url':'/assets/firefox_app_60x60.png'},{'revision':'a7a41fc30c2efc792a02c2f3a3e32dbd','url':'/assets/manifest.webapp'},{'revision':'cb4f64534cdf8dd88f1d7219d44490db','url':'/assets/mstile-144x144.png'},{'revision':'334895225e16a7777e45d81964725a97','url':'/assets/mstile-150x150.png'},{'revision':'e295cca4af6ed0365cf7b014d91b0e9d','url':'/assets/mstile-310x150.png'},{'revision':'cbefa8c42250e5f2443819fe2c69d91e','url':'/assets/mstile-310x310.png'},{'revision':'aa411a69df2b33a1362fa38d1257fa9d','url':'/assets/mstile-70x70.png'},{'revision':'5609af4f69e40e33471aee770ea1d802','url':'/assets/yandex-browser-50x50.png'},{'revision':'4b38735d858e92563557a68a72b56aee','url':'/assets/yandex-browser-manifest.json'},{'revision':'52b9a07fe0541fe8c313d9788550bf51','url':'/b6b803111e2d06a825bd.wasm'},{'revision':'7edb59d2be7c993050cb31ded36afa31','url':'/c22b37c3488e1d6c3aa4.wasm'},{'revision':'fc2da6ec5d17fa844b0a9d67a8b39b21','url':'/cornerstoneDICOMImageLoader.min.js'},{'revision':'59eb3dc6754e4d494b27c774ba53255c','url':'/cornerstoneDICOMImageLoader.min.js.map'},{'revision':null,'url':'/dicom-microscopy-viewer.bundle.2c146384eb9466d02ff8.js'},{'revision':'9d8c85b42d04bb117a3b583d654fbb08','url':'/dicomMicroscopyViewer.min.js'},{'revision':'450494c199cf8dd8e8c34d5e98bf5334','url':'/dicomMicroscopyViewer.min.js.LICENSE.txt'},{'revision':'1f5314becc20923b1a9a70212fa958e6','url':'/es6-shim.min.js'},{'revision':'0b59649ce9c11877ee55e7013d28ac68','url':'/google.js'},{'revision':'63e97fe2cf085248b93baf627aad56ef','url':'/index.html'},{'revision':'feee2d4ed9d00c64f0e4d6a46608fecf','url':'/index.worker.e62ecca63f1a2e124230.worker.js'},{'revision':'beaf37c564436e46bbcd825f0330cdbf','url':'/index.worker.e62ecca63f1a2e124230.worker.js.map'},{'revision':'71cec55513e051f0778ad89be760c11a','url':'/index.worker.min.worker.js'},{'revision':'fd1116add443fee52a935df926396e0f','url':'/index.worker.min.worker.js.map'},{'revision':'a2ff34b6bd0d1b3e9982d0863e209a1b','url':'/init-service-worker.js'},{'revision':'13370cf6d56f65af3368b9903e3f75ea','url':'/manifest.json'},{'revision':'c1bb6bd2197f670f76edc5080299fff2','url':'/ohif-logo-light.svg'},{'revision':'f3fdea69420c62b41b407fb2aadff911','url':'/ohif-logo.svg'},{'revision':'fad343d459abe4267f319419dc0865bc','url':'/oidc-client.min.js'},{'revision':'9a341bf703c079670eed520f74837072','url':'/polyfill.min.js'},{'revision':'e5242fadf304e9916f57adeddd642fa2','url':'/silent-refresh.html'}]);

// TODO: Cache API
// https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/cache-api
// Store DICOMs?
// Clear Service Worker cache?
// navigator.storage.estimate().then(est => console.log(est)); (2GB?)
/******/ })()
;
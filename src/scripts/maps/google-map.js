const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY ?? "";
const selector = "[data-google-map]";
const instances = new WeakMap();
// Якщо хтось викликає focusMarker() до того, як карта проініціювалась —
// запам'ятовуємо індекс і застосовуємо одразу після initMap().
const pendingFocus = new WeakMap();

const MAP_STYLES = [
   // Base: майже чорний фон
   { elementType: "geometry", stylers: [{ color: "#0b111a" }] },
   { elementType: "labels.text.fill", stylers: [{ color: "#d0d4dc" }] },
   { elementType: "labels.text.stroke", stylers: [{ color: "#0b111a" }] },
   { elementType: "labels.icon", stylers: [{ visibility: "off" }] },

   // Дрібні дороги — приховані
   { featureType: "road.local", stylers: [{ visibility: "off" }] },

   // Базовий колір усіх доріг
   {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1e2530" }],
   },

   // Arterial — другорядні після магістралей, приглушені
   {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#2a3344" }, { weight: 0.6 }],
   },
   {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7a8a99" }],
   },

   // Магістралі — яскраві
   {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }, { weight: 0.8 }],
   },
   {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#0b111a" }, { weight: 0.5 }],
   },
   {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ffffff" }],
   },

   // Адміністративні межі
   {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#141820" }],
   },
   {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d0d4dc" }],
   },

   // Транзит
   {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#0e1218" }],
   },
   {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9aa5b3" }],
   },

   // POI — приховані
   { featureType: "poi", stylers: [{ visibility: "off" }] },

   // Вода
   {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#05080e" }],
   },
   {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3a4d5c" }],
   },

   // Природа / парки
   {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#090c12" }],
   },
];

// Пін за замовчуванням якщо маркер не має свого icon URL
const DEFAULT_PIN = "/img/pin-1.svg";

function loadApi() {
   if (window.__gmapsLoaded) return Promise.resolve();
   if (window.__gmapsPromise) return window.__gmapsPromise;

   window.__gmapsPromise = new Promise((resolve) => {
      window.__gmapsReady = () => {
         window.__gmapsLoaded = true;
         resolve();
      };
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=__gmapsReady`;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
   });

   return window.__gmapsPromise;
}

function initMap(el) {
   if (el.dataset.googleMapInitialized) return;
   el.dataset.googleMapInitialized = "true";

   const markers = JSON.parse(el.dataset.gmMarkers || "[]");
   const center  = JSON.parse(el.dataset.gmCenter  || "null") || { lat: 48.874, lng: 2.296 };
   const zoom    = parseInt(el.dataset.gmZoom  || "13", 10);
   const panX    = parseInt(el.dataset.gmPanX ?? "0", 10);
   const panY    = parseInt(el.dataset.gmPanY ?? "0", 10);

   loadApi().then(() => {
      if (!document.contains(el)) return;

      const map = new google.maps.Map(el, {
         center,
         zoom,
         styles: MAP_STYLES,
         disableDefaultUI: true,
         zoomControl: true,
         zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
         },
      });

      // На мобільних екранах ручний panX/panY (підібраний під широкі екрани)
      // може виштовхувати один з пінів за межі видимої області — замість
      // нього вписуємо карту так, щоб всі піни були видимі (fitBounds).
      const mobileQuery = window.matchMedia("(max-width: 767.98px)");

      const applyLayout = (isMobile) => {
         if (isMobile && markers.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
            map.fitBounds(bounds, 48);
         } else {
            map.setCenter(center);
            map.setZoom(zoom);
            if (panX !== 0 || panY !== 0) {
               google.maps.event.addListenerOnce(map, "idle", () => map.panBy(panX, panY));
            }
         }
      };

      applyLayout(mobileQuery.matches);
      // Перерахунок при зміні розміру вʼюпорта (devtools, оберт екрана)
      // без перезавантаження сторінки — initMap() інакше відпрацьовує лише раз.
      mobileQuery.addEventListener("change", (e) => applyLayout(e.matches));

      const infoWindow = new google.maps.InfoWindow();

      const ICON_SIZE = { width: 44, height: 56 };
      const PIN_OPACITY = 0.8;

      const markerObjs = [];

      // marker.setOpacity() — вбудований спосіб Maps API підсвітити пін,
      // без додаткових класів/DOM-хаків. Плавність додає CSS-перехід
      // на <img> маркерів (.gm-style img), бо сам setOpacity миттєвий.
      markers.forEach((m) => {
         const iconUrl = m.icon ?? DEFAULT_PIN;

         const marker = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            title: m.title ?? "",
            optimized: false,
            opacity: PIN_OPACITY,
            icon: {
               url: iconUrl,
               scaledSize: new google.maps.Size(ICON_SIZE.width, ICON_SIZE.height),
               anchor: new google.maps.Point(ICON_SIZE.width / 2, ICON_SIZE.height),
            },
         });

         marker.addListener("mouseover", () => marker.setOpacity(1));
         marker.addListener("mouseout", () => marker.setOpacity(PIN_OPACITY));

         if (m.url) {
            marker.addListener("click", () => {
               infoWindow.setContent(`
                  <div class="gmap-info">
                     <div class="gmap-info__title">${m.title ?? ""}</div>
                     <a class="gmap-info__link" href="${m.url}" target="_blank" rel="noopener noreferrer">
                        View on Google Maps
                     </a>
                  </div>
               `);
               infoWindow.open(map, marker);
            });
         }

         markerObjs.push(marker);
      });

      instances.set(el, { map, markers: markerObjs, infoWindow });

      const pendingIndex = pendingFocus.get(el);
      if (pendingIndex !== undefined) {
         pendingFocus.delete(el);
         focusMarker(el, pendingIndex);
      }
   });
}

// Центрує карту на маркері за індексом і відкриває його InfoWindow —
// викликається кліком по картці локації (location-cards.js)
// через подію "map:focus-location".
function focusMarker(el, index) {
   const data = instances.get(el);
   if (!data) {
      pendingFocus.set(el, index);
      return;
   }

   const marker = data.markers[index];
   if (!marker) return;

   data.map.panTo(marker.getPosition());
   google.maps.event.trigger(marker, "click");
}

document.addEventListener("map:focus-location", (e) => {
   const el = document.querySelector(selector);
   if (!el) return;
   focusMarker(el, e.detail.index);
});

function initAllMaps() {
   document.querySelectorAll(selector).forEach(initMap);
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initAllMaps);
} else {
   initAllMaps();
}

document.addEventListener("page:ready", initAllMaps);

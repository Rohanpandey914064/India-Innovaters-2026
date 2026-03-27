import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, CheckCircle2, Clock3, AlertTriangle, Info, X } from 'lucide-react';

// Fix leaflet icon issue in react-leaflet (Keep defaults just in case)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createStatusIcon = (colorClass) => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div class="w-7 h-7 rounded-full border-[3px] border-white shadow-md relative overflow-hidden flex items-center justify-center ${colorClass}">
             <div class="w-2.5 h-2.5 rounded-full bg-white opacity-90"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'Reported': return createStatusIcon('bg-destructive'); // Red
    case 'In Progress': return createStatusIcon('bg-amber-500'); // Yellow
    case 'Resolved': return createStatusIcon('bg-emerald-500'); // Green
    default: return createStatusIcon('bg-slate-400');
  }
};

const userLocationIcon = L.divIcon({
  className: 'bg-transparent border-0',
  html: `<div class="relative w-8 h-8 flex items-center justify-center">
           <div class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-50"></div>
           <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg z-10"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const StatusBadge = ({ status, t }) => {
  switch(status) {
    case 'Reported':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-destructive/10 text-destructive border border-destructive/20 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1"></span>{t('Reported')}</span>;
    case 'In Progress':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>{t('In Progress')}</span>;
    case 'Resolved':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>{t('Resolved')}</span>;
    default:
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary text-secondary-foreground w-fit">{t(status)}</span>;
  }
};

const LocationFlyer = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

const MapView = () => {
  const { issues } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userCoords, setUserCoords] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  const reportedCount = issues.filter((i) => i.progress === 'Reported').length;
  const inProgressCount = issues.filter((i) => i.progress === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.progress === 'Resolved').length;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Map Geolocation Error:", error);
        },
        { timeout: 10000 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-30"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-25"></div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl relative z-10">
        <section className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.17),transparent_36%),hsl(var(--card))] p-5 md:p-6 shadow-sm mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">{t('City Map')}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t('Live civic reports across your city.')}</p>
        </section>

        <div className="relative w-full h-[calc(100vh-14rem)] overflow-hidden rounded-3xl border border-border/60 shadow-[0_12px_36px_hsl(var(--foreground)/0.12)]">
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {issues.map(issue => (
          issue.lat && issue.lng ? (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={getStatusIcon(issue.progress)}
              eventHandlers={{
                click: () => {
                  navigate(`/feed?issue=${issue.id}`);
                },
              }}
            >
              <Popup className="custom-popup rounded-lg overflow-hidden border-0 shadow-lg min-w-[220px]">
                <div className="p-0">
                  {issue.img && <img src={issue.img} alt={t(issue.title)} className="w-full h-28 object-cover rounded-t-lg border-b border-border/10" />}
                  <div className="p-4 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-base text-foreground leading-tight">{t(issue.title)}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                       <StatusBadge status={issue.progress} t={t} />
                       <div className="inline-block bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold">
                         {t(issue.category)}
                       </div>
                    </div>
                    
                    <p className="text-sm line-clamp-3 text-muted-foreground leading-relaxed">{t(issue.description) || t('No description provided.')}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        {userCoords && (
          <Marker position={userCoords} icon={userLocationIcon}>
            <Popup className="custom-popup rounded-lg border-0 shadow-lg min-w-[140px]">
              <div className="p-3 text-center">
                <p className="font-bold text-foreground text-sm">{t('You are here')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('Your current location')}</p>
              </div>
            </Popup>
          </Marker>
        )}
        <LocationFlyer coords={userCoords} />
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        {!showLegend && (
          <button
            type="button"
            onClick={() => setShowLegend(true)}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm"
          >
            <Info className="w-3.5 h-3.5 text-primary" />
            {t('Map Info')}
          </button>
        )}

        {showLegend && (
          <div className="w-[min(21rem,calc(100vw-2rem))] max-h-[52vh] overflow-y-auto bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_58%),hsl(var(--background)/0.95)] backdrop-blur-md p-4 rounded-2xl shadow-[0_14px_30px_hsl(var(--foreground)/0.1)] border border-border/60">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Activity className="w-3.5 h-3.5" />
                {t('Live Geospatial View')}
              </div>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                aria-label={t('Close map info')}
                className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="font-bold text-base tracking-tight mb-1 text-foreground">{t('City Map Overview')}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {t('Track active civic reports in real time. Click any marker to open its report.')}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-2">
                <div className="text-[10px] text-muted-foreground">{t('Reported')}</div>
                <div className="font-black text-sm">{reportedCount}</div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2">
                <div className="text-[10px] text-muted-foreground">{t('In Progress')}</div>
                <div className="font-black text-sm">{inProgressCount}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2">
                <div className="text-[10px] text-muted-foreground">{t('Resolved')}</div>
                <div className="font-black text-sm">{resolvedCount}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/70 p-3 space-y-2 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground text-[11px] uppercase tracking-wide">{t('Marker Guide')}</div>
              <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> {t('Red: Reported')}</div>
                <div className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5 text-amber-500" /> {t('Yellow: In progress')}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t('Green: Resolved')}</div>
                {userCoords && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {t('Blue pulse: You')}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;

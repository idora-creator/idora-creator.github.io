import { useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { getHeatColor, getVisitLabel, GD_CENTER, GD_ZOOM } from '../../data/mockData';
import gdGeoJson from '../../data/gd_geojson.json';
import './HeatMap.css';

// 修复 Leaflet 默认图标
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let iconDefaultSet = false;
function fixLeafletIcon() {
  if (iconDefaultSet) return;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
  iconDefaultSet = true;
}

function createVillageIcon(visitCount: number, isSelected: boolean) {
  const color = getHeatColor(visitCount);
  const size = isSelected ? 18 : Math.max(8, Math.min(16, 6 + visitCount * 0.6));
  const border = isSelected ? '#1A202C' : '#fff';
  const borderWidth = isSelected ? 3 : 1.5;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2 + 8}" height="${size * 2 + 8}" viewBox="0 0 ${size * 2 + 8} ${size * 2 + 8}">
      <circle cx="${size + 4}" cy="${size + 4}" r="${size}" fill="${color}" stroke="${border}" stroke-width="${borderWidth}" />
      ${visitCount === 0 ? `<line x1="${size}" y1="${size + 4}" x2="${size + 8}" y2="${size + 4}" stroke="white" stroke-width="1.5" opacity="0.7"/>` : ''}
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'village-marker',
    iconSize: [size * 2 + 8, size * 2 + 8],
    iconAnchor: [size + 4, size + 4],
  });
}

// 城市配色映射 — 珠三角暖色、粤东西北冷色
const CITY_COLORS: Record<string, string> = {
  '广州市': '#fff5f5', '深圳市': '#fff5f5', '东莞市': '#fff5f5', '佛山市': '#fff5f5',
  '珠海市': '#fff5f5', '中山市': '#fff5f5', '惠州市': '#fffaf0', '江门市': '#fffaf0',
  '肇庆市': '#fffaf0', '汕头市': '#f0f4ff', '潮州市': '#f0f4ff', '揭阳市': '#f0f4ff',
  '汕尾市': '#f0f4ff', '梅州市': '#f5f0ff', '河源市': '#f5f0ff', '韶关市': '#f5f0ff',
  '清远市': '#f0fff4', '湛江市': '#fff0f5', '茂名市': '#fff0f5', '阳江市': '#fff0f5',
  '云浮市': '#f0fff4',
};

const NEEDY_CITIES = new Set([
  '汕尾市', '河源市', '湛江市', '茂名市', '阳江市', '云浮市',
  '梅州市', '清远市', '韶关市', '揭阳市',
]);

export default function HeatMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);

  const allVillages = useAppStore((s) => s.villages);
  const villages = useMemo(() => allVillages.filter((v) => v.status === 'approved' || !v.status), [allVillages]);
  const selectedVillageId = useAppStore((s) => s.selectedVillageId);
  const selectVillage = useAppStore((s) => s.selectVillage);

  const initMap = useCallback(() => {
    if (!mapContainer.current || mapInstance.current) return;

    fixLeafletIcon();

    mapInstance.current = L.map(mapContainer.current, {
      center: [GD_CENTER.lat, GD_CENTER.lng],
      zoom: GD_ZOOM,
      minZoom: 6,
      maxZoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      className: 'map-tile',
    }).addTo(mapInstance.current);

    // ===== 广东省 GeoJSON 边界层 =====
    geoLayer.current = L.geoJSON(gdGeoJson as any, {
      style: (feature) => {
        const name: string = feature?.properties?.name || '';
        const baseColor = CITY_COLORS[name] || '#fafafa';
        return {
          fillColor: baseColor,
          fillOpacity: 0.55,
          color: NEEDY_CITIES.has(name) ? '#e53e3e' : '#a0aec0',
          weight: NEEDY_CITIES.has(name) ? 1.8 : 1,
          dashArray: NEEDY_CITIES.has(name) ? '5,3' : undefined,
        };
      },
      onEachFeature: (feature, layer) => {
        const name: string = feature?.properties?.name || '';
        // 城市名标签
        if (feature.properties?.center) {
          const c = feature.properties.center as number[];
          L.marker([c[1], c[0]], {
            icon: L.divIcon({
              className: 'city-label',
              html: `<span class="city-label-text">${name}</span>`,
              iconSize: [80, 18],
              iconAnchor: [40, 9],
            }),
          }).addTo(mapInstance.current!);
        } else if (feature.properties?.centroid) {
          const c = feature.properties.centroid as number[];
          L.marker([c[1], c[0]], {
            icon: L.divIcon({
              className: 'city-label',
              html: `<span class="city-label-text">${name}</span>`,
              iconSize: [80, 18],
              iconAnchor: [40, 9],
            }),
          }).addTo(mapInstance.current!);
        }
        // 点击城市区域
        layer.on('click', () => {
          const cityVillages = villages.filter((v) => v.city === name);
          if (cityVillages.length > 0) {
            selectVillage(cityVillages[0].id);
          }
        });
      },
    }).addTo(mapInstance.current);

    // 标记层（在 GeoJSON 之上）
    markersLayer.current = L.layerGroup().addTo(mapInstance.current);

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize();
    });
    resizeObserver.observe(mapContainer.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    initMap();
  }, [initMap]);

  // 更新标记点
  useEffect(() => {
    if (!markersLayer.current) return;
    markersLayer.current.clearLayers();

    villages.forEach((v) => {
      const isSelected = v.id === selectedVillageId;
      const icon = createVillageIcon(v.visitCount, isSelected);

      const marker = L.marker([v.lat, v.lng], { icon })
        .addTo(markersLayer.current!)
        .bindTooltip(v.name, {
          direction: 'top',
          offset: [0, -8],
          className: 'village-tooltip',
        });

      const popupContent = `
        <div class="village-popup">
          <h3>${v.name}</h3>
          <p class="popup-location">${v.province} ${v.city} ${v.county}</p>
          <div class="popup-stats">
            <span class="popup-badge" style="background:${getHeatColor(v.visitCount)}">
              ${getVisitLabel(v.visitCount)} (${v.visitCount}次)
            </span>
            <span>人口: ${v.population}人</span>
          </div>
          <p class="popup-desc">${v.description}</p>
          <div class="popup-needs">
            <strong>待解决需求:</strong> ${v.needs.filter((n) => n.status === 'pending').length} 项
          </div>
          <button class="popup-btn" onclick="window.__selectVillage('${v.id}')">查看详情</button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });

      if (isSelected) {
        marker.openPopup();
        mapInstance.current?.flyTo([v.lat, v.lng], Math.max(8, mapInstance.current.getZoom()), { duration: 0.8 });
      }

      marker.on('click', () => selectVillage(v.id));
    });

    (window as any).__selectVillage = (id: string) => selectVillage(id);
  }, [villages, selectedVillageId, selectVillage]);

  useEffect(() => {
    if (!selectedVillageId || !mapInstance.current) return;
    const v = villages.find((x) => x.id === selectedVillageId);
    if (v) {
      mapInstance.current.flyTo([v.lat, v.lng], Math.max(8, mapInstance.current.getZoom()), { duration: 0.8 });
    }
  }, [selectedVillageId, villages]);

  return (
    <div className="heatmap-wrapper">
      <div ref={mapContainer} className="heatmap-container" />
      <div className="heatmap-legend">
        <div className="legend-title">访问频次</div>
        {[
          { label: '高频 (≥20次)', color: getHeatColor(20) },
          { label: '较热 (15-19次)', color: getHeatColor(15) },
          { label: '温热 (10-14次)', color: getHeatColor(10) },
          { label: '低频 (5-9次)', color: getHeatColor(5) },
          { label: '稀少 (1-4次)', color: getHeatColor(1) },
          { label: '实践空白 (0次)', color: getHeatColor(0) },
        ].map((item) => (
          <div key={item.label} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
        <div className="legend-footer">
          红色虚线 = 实践需求突出区域
        </div>
      </div>
    </div>
  );
}

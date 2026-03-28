//======================================================================================
//? Importing
//======================================================================================
import React, { useState, useEffect } from 'react';
import { COLORS } from '../../styles/colorPalette';
import { routeStatus } from '../../enums/statusEnums';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';

interface RouteData {
  id: string;
  title: string;
  color: string;
  status: string;
  stations: string[];
}

interface Station {
  id: string;
  stationName: string;
}

interface UpdateRouteProps {
  onClose: () => void;
  onSuccess: () => void;
  routeId: string;
}

//======================================================================================
//? UpdateRoute
//======================================================================================
const UpdateRoute: React.FC<UpdateRouteProps> = ({ onClose, onSuccess, routeId }) => {
  const { t } = useTranslation('routes');
  const { t: tGlobal } = useTranslation('translation');
  const [formData, setFormData] = useState<RouteData>({
    id: routeId,
    title: '',
    color: '#000000',
    status: '',
    stations: []
  });
  const [initialData, setInitialData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  ///-------------------------------------------------------------------------
  const fetchRouteData = async () => {
    try {
      const response = await apiClient.get('/api/user/routes/all', {
        headers: { 'Content-Type': 'application/json' }
      });
      const currentRoute = response.data.data.find((route: any) => route.id === routeId);
      if (currentRoute) {
        const nextData: RouteData = {
          id: currentRoute.id,
          title: currentRoute.title,
          color: currentRoute.color,
          status: currentRoute.status,
          stations: Array.isArray(currentRoute.stations)
            ? currentRoute.stations.map((s: any) => s.id ?? s.stationId ?? s)
            : []
        };

        setFormData(nextData);
        setInitialData(nextData);
      }
    // -----------------------------------------------  
    } catch (err: unknown) {
      const messageKey = tryGetApiErrorMessageKey(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('updateForm.loadError'));
    }
  };

  useEffect(() => {
    if (routeId) {
      fetchRouteData();
    }
  }, [routeId]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiClient.get('/api/admin/stations/picker');
        setStations(response.data.data || response.data || []);
      // -----------------------------------------------
      } catch (err: unknown) {
        const messageKey = tryGetApiErrorMessageKey(err);
        setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('updateForm.stationsLoadError'));
      }
    };

    fetchStations();
  }, []);
  ///-------------------------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStationToggle = (stationId: string) => {
    setFormData(prev => {
      const exists = prev.stations.includes(stationId);
      return {
        ...prev,
        stations: exists
          ? prev.stations.filter(id => id !== stationId)
          : [...prev.stations, stationId]
      };
    });
  };

  // handle drag and drop ----------------------------------------------------------------------
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    setFormData(prev => {
      if (dragIndex === null || dragIndex === dropIndex) return prev;
      const next = [...prev.stations];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return { ...prev, stations: next };
    });
    setDragIndex(null);
  };

  // move station ----------------------------------------------------------------------
  const moveStation = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      if (fromIndex === toIndex) return prev;
      if (fromIndex < 0 || fromIndex >= prev.stations.length) return prev;
      if (toIndex < 0 || toIndex >= prev.stations.length) return prev;

      const next = [...prev.stations];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, stations: next };
    });
  };

  ///-------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates: Record<string, any> = { id: formData.id };

      if (initialData) {
        if (formData.title !== initialData.title) updates.title = formData.title;
        if (formData.color !== initialData.color) updates.color = formData.color;
        if (formData.status !== initialData.status) updates.status = formData.status;

        const stationsChanged = JSON.stringify(formData.stations) !== JSON.stringify(initialData.stations);
        if (stationsChanged) {
          updates.stations = formData.stations;
          updates.totalStops = formData.stations.length;
        }
      } else {
        Object.assign(updates, formData, { totalStops: formData.stations.length });
      }

      await apiClient.patch('/api/admin/route/update', updates, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const messageKey = tryGetApiErrorMessageKey(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('updateForm.error'));
    } finally {
      setLoading(false);
    }
  };
  ///-------------------------------------------------------------------------

  //======================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('updateForm.title')}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.titleLabel')}
               
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.color')}
               
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full h-10 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.stations')}
            </label>
            {/* stations list (for ordering) ------------------------------------------------------------------ */}
            {formData.stations.length > 0 && (
              <div className="mb-3 border rounded p-2">
                <div className="text-xs font-semibold text-gray-700 mb-2">{t('updateForm.stations')}</div>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                  {formData.stations.map((stationId, idx) => {
                    const st = stations.find(s => s.id === stationId);
                    const label = st ? `${st.id} - ${st.stationName}` : stationId;
                    return (
                      <li
                        key={stationId}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(idx)}
                        className="select-none bg-gray-50 border rounded px-2 py-1 text-sm text-gray-700"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="cursor-move text-gray-400">≡</span>
                            <span className="truncate">{idx + 1}. {label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveStation(idx, idx - 1)}
                              disabled={idx === 0}
                              className="px-2 py-0.5 border rounded text-xs text-gray-700 disabled:opacity-40"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStation(idx, idx + 1)}
                              disabled={idx === formData.stations.length - 1}
                              className="px-2 py-0.5 border rounded text-xs text-gray-700 disabled:opacity-40"
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  </ul>
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
              {stations.length === 0 && (
                <p className="text-sm text-gray-500">{t('updateForm.noStations')}</p>
              )}
              {stations.map((station) => (
                <label key={station.id} className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.stations.includes(station.id)}
                    onChange={() => handleStationToggle(station.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{station.id} - {station.stationName}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('updateForm.totalStopsLabel')} {formData.stations.length}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.status')}
               
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">{t('updateForm.selectStatus')}</option>
              {(Object.values(routeStatus) as string[]).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
            >
              {t('updateForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
              style={{ backgroundColor: COLORS.burgundy }}
            >
              {loading ? t('updateForm.loading') : t('updateForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//======================================================================================
export default UpdateRoute;

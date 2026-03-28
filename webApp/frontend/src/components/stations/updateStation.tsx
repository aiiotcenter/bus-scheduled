//======================================================================================
//? Importing
//======================================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';
import { stationDefaultType } from '../../enums/statusEnums';
import type { StationDefaultType } from '../../enums/statusEnums';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

interface StationData {
  id: string;
  stationName: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
	isDefault?: boolean;
	defaultType: StationDefaultType;
}

interface UpdateStationProps {
  onClose: () => void;
  onSuccess: () => void;
  stationId: string;
}

//======================================================================================
//? UpdateStation
//======================================================================================
const UpdateStation: React.FC<UpdateStationProps> = ({ onClose, onSuccess, stationId }) => {
  const { t } = useTranslation('stations');
  const { t: tGlobal } = useTranslation('translation');
  const [formData, setFormData] = useState<StationData>({
    id: stationId,
    stationName: '',
    latitude: null,
    longitude: null,
	status: '',
	isDefault: false,
	defaultType: null,
  });
  const [initialData, setInitialData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );

  ///-------------------------------------------------------------------------
  const fetchStationData = async () => {
    try {
      const response = await apiClient.get('/api/admin/stations/fetch', {
        headers: { 'Content-Type': 'application/json' }
      });
      const currentStation = response.data.data.find((station: any) => station.id === stationId);
      if (currentStation) {
        const nextData: StationData = {
          id: currentStation.id,
          stationName: currentStation.stationName,
          latitude: Number(currentStation.latitude),
          longitude: Number(currentStation.longitude),
			status: currentStation.status,
			isDefault: Boolean(currentStation.isDefault),
			defaultType: (currentStation.defaultType as StationDefaultType) || null,
        };

        setFormData(nextData);
        setInitialData(nextData);
      }
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('updateForm.loadError'));
    }
  };

  useEffect(() => {
    if (stationId) {
      fetchStationData();
    }
  }, [stationId]);
  ///-------------------------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: checked,
			defaultType: checked ? (prev.defaultType == null ? stationDefaultType.end : prev.defaultType) : null,
		}));
	};

	const handleDefaultTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setFormData(prev => ({
			...prev,
			defaultType: value as StationDefaultType,
			isDefault: value != null,
		}));
	};

  // Map interactions: update coordinates when admin clicks on map
  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const LocationSelector = () => {
    useMapEvents({
      click: (event) => handleMapClick(event.latlng.lat, event.latlng.lng),
    });
    return null;
  };

  ///-------------------------------------------------------------------------
  ///-------------------------------------------------------------------------
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!Number.isFinite(formData.latitude) || !Number.isFinite(formData.longitude)) {
      setError(t('updateForm.locationRequired'));
      setLoading(false);
      return;
    }

    try {
      const updates: Record<string, any> = { id: formData.id };

      if (initialData) {
        if (formData.stationName !== initialData.stationName) updates.stationName = formData.stationName;
        if (formData.status !== initialData.status) updates.status = formData.status;
		if (formData.defaultType !== initialData.defaultType) updates.defaultType = formData.defaultType;
		if (Boolean(formData.isDefault) !== Boolean(initialData.isDefault)) updates.isDefault = Boolean(formData.isDefault);

        const latChanged = formData.latitude !== initialData.latitude;
        const lngChanged = formData.longitude !== initialData.longitude;
        if (latChanged) updates.latitude = formData.latitude;
        if (lngChanged) updates.longitude = formData.longitude;
      } else {
        Object.assign(updates, formData);
      }

      await apiClient.patch('/api/admin/station/update', updates, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
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
              {t('updateForm.stationName')}
               
            </label>
            <input
              type="text"
              name="stationName"
              value={formData.stationName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* location  Column   ================================================================================================= */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.pickLocation')}
               
            </label>
            <div className="h-64 w-full rounded-md overflow-hidden border">
              {/* Map controller: initializes map, view, and context --------------------------------------------------------------------------- */}
              <MapContainer
                /* Remount map when coords change so Leaflet re-centers; fallback to university coords when null */
                key={`${formData.latitude ?? 'null'}-${formData.longitude ?? 'null'}`}
                center={[
                  Number.isFinite(formData.latitude) ? Number(formData.latitude) : 35.226801682469194,

                  Number.isFinite(formData.longitude) ? Number(formData.longitude) : 33.319740659406264
                ]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                {/* Load and display OpenStreetMap raster tiles as the base map layer --------------------------------- */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Listens to map clicks -> extracts lat and long -> saves them into "formData" */}
                <LocationSelector />

                {/* Verifies both values exist and are real numbers */}
                {Number.isFinite(formData.latitude) && Number.isFinite(formData.longitude) && (

                  // if above condition approved, place a marker on the map using formData values(lat, lng)
                  <Marker
                    position={[Number(formData.latitude), Number(formData.longitude)]}
                    icon={markerIcon}
                  />
                )}
              </MapContainer>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {formData.latitude && formData.longitude ? (
                <span>
                  {t('updateForm.selectedPrefix')} {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                </span>
              ) : (
                <span>{t('mapModal.clickToSet')}</span>
              )}
            </div>
          </div>
          


		  {/* ====================================================================================== */}
      <div className="mb-4">
			<label className="inline-flex items-center gap-2 text-gray-700 text-sm font-bold">
				<input
					type="checkbox"
					name="isDefault"
					checked={Boolean(formData.isDefault)}
					onChange={handleCheckboxChange}
					className="h-4 w-4"
				/>
				Default station
			</label>
		  </div>

		  {Boolean(formData.isDefault) && (
			<div className="mb-4 pl-6 border-l-4 rounded p-1"
           style={{ backgroundColor: `${COLORS.navbar}80`, borderLeftColor: COLORS.navbar}}>
              
				<div className="text-gray-700 text-sm font-bold mb-2">Default type</div>
				<div className="flex gap-6">
					<label className="inline-flex items-center gap-2 text-gray-700 text-sm">
						<input
							type="radio"
							name="defaultType"
							value={stationDefaultType.start}
							checked={formData.defaultType === stationDefaultType.start}
							onChange={handleDefaultTypeChange}
							className="h-4 w-4"
						/>
						START
					</label>

					<label className="inline-flex items-center gap-2 text-gray-700 text-sm">
						<input
							type="radio"
							name="defaultType"
							value={stationDefaultType.end}
							checked={formData.defaultType === stationDefaultType.end}
							onChange={handleDefaultTypeChange}
							className="h-4 w-4"
						/>
						END
					</label>
				</div>
			</div>
		  )}

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
export default UpdateStation;

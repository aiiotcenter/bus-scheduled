//======================================================================================
//? Importing
//======================================================================================
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';
import { stationDefaultType } from '../../enums/statusEnums';
import type { StationDefaultType } from '../../enums/statusEnums';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

interface StationData {
  stationName: string;
  latitude: number | null;
  longitude: number | null;
	isDefault: boolean;
	defaultType: StationDefaultType;
}

interface AddStationProps {
  onClose: () => void;
  onSuccess: () => void;
}

//======================================================================================
//? AddStation
//======================================================================================
const AddStation: React.FC<AddStationProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation('stations');
  const { t: tGlobal } = useTranslation('translation');
  const [formData, setFormData] = useState<StationData>({
    stationName: '',
    latitude: null,
    longitude: null,
	isDefault: false,
	defaultType: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          'https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png', // location icon, for the map
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );

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
			[name]: checked, // when checked, defaultType is set to end, otherwise notDefault
			defaultType: checked ? stationDefaultType.end : null,
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

  //  handling map operations -----------------------------------
  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const LocationSelector = () => {
    useMapEvents({
      click: (event) => {
        handleMapClick(event.latlng.lat, event.latlng.lng);
      },
    });
    return null;
  };

  ///-------------------------------------------------------------------------
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // ensure that latitude and longitude are provided 
    if (!Number.isFinite(formData.latitude) || !Number.isFinite(formData.longitude)) {
      setError(t('addForm.locationRequired'));
      setLoading(false);
      return;
    }


    try {
      await apiClient.post('/api/admin/station/add', formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      onSuccess();
      onClose();
    // -------------------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('addForm.error'));
    // -------------------------------------------------------
    } finally {
      setLoading(false);
    }
  };
  ///-------------------------------------------------------------------------

  //======================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('addForm.title')}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('addForm.stationName')}
              <span className="text-red-600"> *</span>
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

          {/* location  Column   =================================================================================================
          {/* we view map so admin can select location of the station */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('addForm.pickLocation')}
              <span className="text-red-600"> *</span>
            </label>
            <div className="h-72 w-full rounded-md overflow-hidden border">

               {/* Map controller: initializes map, view, and context ----------------------------------------------------------------------------
               {/*in MapContainer we define the specifications for what it viws , "cener" is pointing to near east univerity - innovation building locaiton */}
              <MapContainer
                center={[35.226801682469194, 33.319740659406264]} 
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                
                {/* Load and display OpenStreetMap raster tiles as the base map layer --------------------------------- */}
                
                {/* OpenStreetMap serves map tiles as images */}
                {/* {z}zoom level {x}tile column  {y}tile row  {s}subdomain (a, b, c) for load balancing */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> 
                
                {/* update the data(latitude and logntiude) ----------------------------------------------------------*/}
                
                {/* Listens to map clicks -> extracts lat and long -> saves them into "formData" */}
                <LocationSelector /> 

                {/* Verifies both values exist and are real numbers */}
                {Number.isFinite(Number(formData.latitude)) && Number.isFinite(Number(formData.longitude)) && (

                  // if above condition approved, place a marker on the map using formData values(lat, lng)
                  <Marker
                    position={[Number(formData.latitude), Number(formData.longitude)]}
                    icon={markerIcon}
                  />
                )}
              
              </MapContainer>
              {/* ================================================================================================================ */}
            </div>

            <div className="mt-2 text-sm text-gray-700">
              {formData.latitude && formData.longitude ? (
                <span>
                  {t('addForm.selectedPrefix')} {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                </span>
              ) : (
                <span>{t('mapModal.clickToSet')}</span>
              )}
            </div>
          </div>

		  <div className="mb-4">
			<label className="inline-flex items-center gap-2 text-gray-700 text-sm font-bold">
				<input
					type="checkbox"
					name="isDefault"
					checked={formData.isDefault}
					onChange={handleCheckboxChange}
					className="h-4 w-4"
				/>
				Default station
			</label>
		  </div>

		  {/* Default type ------------------------------------------------------------------- */}
      {formData.isDefault && (
			<div className="mb-4 pl-6">
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
      {/* ----------------------------------------------------------------- */}

       
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
            >
              {t('addForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
              style={{ backgroundColor: COLORS.burgundy }}
            >
              {loading ? t('addForm.loading') : t('addForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//======================================================================================
export default AddStation;

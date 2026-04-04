//======================================================================================
//? Importing
//======================================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../../../styles/colorPalette';

import { apiClient } from '../../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../../services/apiError';

//======================================================================================
//? Types
//======================================================================================

type DriverRow = {
  id: string;
  name: string;
};

type BusRow = {
  id: string;
  plate: string;
};

type SelectedCell = {
  scheduleId: string;
  time: string;
  routeId: string;
  routeTitle?: string;
};

type AddScheduledTripProps = {
  open: boolean;
  selectedCell: SelectedCell | null;
  detailedScheduleId?: string;
  initialDriverId?: string;
  initialBusId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//======================================================================================
//? Component
//======================================================================================

const AddScheduledTrip: React.FC<AddScheduledTripProps> = ({
  open,
  selectedCell,
  detailedScheduleId,
  initialDriverId,
  initialBusId,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const { t: tBusSchedule } = useTranslation('busScedule');
  const { t: tCommon } = useTranslation('translation');

  //====================================================================================
  //? State
  //====================================================================================

  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [buses, setBuses] = useState<BusRow[]>([]);

  const [driverId, setDriverId] = useState('');
  const [busId, setBusId] = useState('');

  const [loadingLists, setLoadingLists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tripInfo = useMemo(() => {
    if (!selectedCell) return null;
    return {
      scheduleId: selectedCell.scheduleId,
      routeId: selectedCell.routeId,
      routeTitle: selectedCell.routeTitle,
      time: selectedCell.time,
    };
  }, [selectedCell]);

  //====================================================================================
  //? Effects
  //====================================================================================

  useEffect(() => {
    if (!open || !tripInfo) return;

    setDriverId(initialDriverId || '');
    setBusId(initialBusId || '');
    setError('');

    void fetchLists();
  }, [open, tripInfo?.scheduleId, tripInfo?.routeId, tripInfo?.time, initialDriverId, initialBusId]);

  //====================================================================================
  //? Functions
  //====================================================================================

  const fetchLists = async () => {
    setLoadingLists(true);
    setError('');

    try {
      const [driversRes, busesRes] = await Promise.all([
        apiClient.get('/api/admin/drivers/all'),
        apiClient.get('/api/admin/buses/all'),
      ]);

      const driversRows: DriverRow[] = Array.isArray(driversRes.data?.data) ? driversRes.data.data : [];
      const busesRows: BusRow[] = Array.isArray(busesRes.data?.data) ? busesRes.data.data : [];

      setDrivers(driversRows);
      setBuses(busesRows);
      // ---------------------------------------------
    } catch (e: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(e);
      setError(messageKey ? tCommon(messageKey, { defaultValue: messageKey }) : tBusSchedule('tripForm.error'));
      setDrivers([]);
      setBuses([]);
      // -------------------------------------------
    } finally {
      setLoadingLists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripInfo) return;

    setLoading(true);
    setError('');

    try {
      // usage of the new upsert endpoint (always POST to /upsert)
      const res = await apiClient.post(
        `/api/admin/schedule/trip/upsert`,
        {
          scheduleId: tripInfo.scheduleId,
          time: tripInfo.time,
          routeId: tripInfo.routeId,
          driverId,
          busId,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const serverMessageKey = String(res?.data?.message || '').trim();
      onSuccess(serverMessageKey ? tCommon(serverMessageKey, { defaultValue: serverMessageKey }) : tCommon('tripForm.success.saved'));
      onClose();
      await onRefresh();
      // ------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tCommon(messageKey, { defaultValue: messageKey }) : tCommon('tripForm.error'));
    // -----------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  //====================================================================================
  //? UI
  //====================================================================================

  if (!open || !tripInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{tBusSchedule('tripForm.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div> : null}

        <div className="mb-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
          <div>
            <span className="font-semibold">Schedule:</span> {tripInfo.scheduleId}
          </div>
          <div>
            <span className="font-semibold">Time:</span> {String(tripInfo.time).slice(0, 5)}
          </div>
          <div>
            <span className="font-semibold">Route:</span> {tripInfo.routeTitle ? tripInfo.routeTitle : tripInfo.routeId}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {tBusSchedule('tripForm.driver')}
              <span className="text-red-600"> *</span>
            </label>
            {loadingLists ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{tBusSchedule('tripForm.loadingLists')}</div>
            ) : (
              <select
                value={driverId}
                onChange={(ev) => setDriverId(ev.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{tBusSchedule('tripForm.selectDriver')}</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {tBusSchedule('tripForm.bus')}
              <span className="text-red-600"> *</span>
            </label>
            {loadingLists ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{tBusSchedule('tripForm.loadingLists')}</div>
            ) : (
              <select
                value={busId}
                onChange={(ev) => setBusId(ev.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{tBusSchedule('tripForm.selectBus')}</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.plate} ({b.id})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              {tBusSchedule('tripForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || loadingLists}
              className="px-4 py-2 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 disabled:opacity-50"
              style={{ background: COLORS.burgundy }}
            >
              {loading ? tBusSchedule('tripForm.saving') : tBusSchedule('tripForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ===========================================================================================
export default AddScheduledTrip;

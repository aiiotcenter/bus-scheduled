//======================================================================================
//? Importing
//======================================================================================
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../../styles/colorPalette';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

//======================================================================================
//? Types
//======================================================================================

type ServicePattern = {
  servicePatternId: string;
  title: string;
};

export type ScheduleRecord = {
  scheduleId: string;
  date: string;
  day: string;
  servicePatternId: string;
};

type UpdateScheduleProps = {
  open: boolean;
  record: ScheduleRecord | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//======================================================================================
//? Component
//======================================================================================

const UpdateSchedule: React.FC<UpdateScheduleProps> = ({ open, record, onClose, onSuccess, onRefresh }) => {
  const { t: tBusSchedule } = useTranslation('busScedule');
  const { t: tGlobal } = useTranslation('translation');

  //====================================================================================
  //? State
  //====================================================================================

  const [date, setDate] = useState('');
  const [servicePatternId, setServicePatternId] = useState('');
  const [patterns, setPatterns] = useState<ServicePattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //====================================================================================
  //? Effects
  //====================================================================================

  useEffect(() => {
    if (!open || !record) return;
    setDate(record.date ? String(record.date).split('T')[0] : '');
    setServicePatternId(record.servicePatternId || '');
    setError('');
    void fetchPatterns();
  }, [open, record]);

  //====================================================================================
  //? Functions
  //====================================================================================

  const fetchPatterns = async () => {
    setLoadingPatterns(true);
    try {
      const res = await apiClient.get('/api/admin/service-pattern/fetch');
      const rows: ServicePattern[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setPatterns(rows);
      // ----------------------------------------------------
    } catch (e: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(e);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tBusSchedule('updateForm.error'));
      setPatterns([]);
      // ------------------------------------------------
    } finally {
      setLoadingPatterns(false);
    }
  };

  //====================================================================================
  //? UI
  //====================================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setLoading(true);
    setError('');

    try {
      const originalDate = record.date ? String(record.date).split('T')[0] : '';
      const originalServicePatternId = record.servicePatternId || '';

      const updates: Record<string, any> = { scheduleId: record.scheduleId };

      if (date !== originalDate) updates.date = date;
      if (servicePatternId !== originalServicePatternId) updates.servicePatternId = servicePatternId;

      await apiClient.patch('/api/admin/schedule/update', updates, { headers: { 'Content-Type': 'application/json' } });

      onSuccess(tBusSchedule('success.updated'));
      onClose();
      await onRefresh();
      // ------------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tBusSchedule('updateForm.error'));
    // ------------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{tBusSchedule('updateForm.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {tBusSchedule('updateForm.date')}
               
            </label>
            <input
              type="date"
              value={date}
              onChange={(ev) => setDate(ev.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {tBusSchedule('updateForm.servicePattern')}
               
            </label>
            {loadingPatterns ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">{tBusSchedule('updateForm.loadingServicePatterns')}</div>
            ) : (
              <select
                value={servicePatternId}
                onChange={(ev) => setServicePatternId(ev.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{tBusSchedule('updateForm.selectServicePattern')}</option>
                {patterns.map((p) => (
                  <option key={p.servicePatternId} value={p.servicePatternId}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              {tBusSchedule('updateForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || loadingPatterns}
              className="px-4 py-2 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 disabled:opacity-50"
              style={{ background: COLORS.burgundy }}
            >
              {loading ? tBusSchedule('updateForm.loading') : tBusSchedule('updateForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSchedule;


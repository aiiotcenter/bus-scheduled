//======================================================================================
//? Importing
//======================================================================================
import React, { useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../../services/apiError';

//======================================================================================
//? Types
//======================================================================================

type RemoveScheduledTripProps = {
  open: boolean;
  detailedScheduleId: string | null;
  tripInfo: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//======================================================================================
//? Component
//======================================================================================

const RemoveScheduledTrip: React.FC<RemoveScheduledTripProps> = ({
  open,
  detailedScheduleId,
  tripInfo,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const { t: tBusSchedule } = useTranslation('busScedule');
  const { t: tCommon } = useTranslation('translation');

  //====================================================================================
  //? State
  //====================================================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translatedTripInfo = useMemo(() => tripInfo, [tripInfo]);

  //====================================================================================
  //? Functions
  //====================================================================================

  if (!open || !detailedScheduleId) return null;

  const handleRemove = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.delete('/api/admin/schedule/trip/remove', {
        data: { detailedScheduleId },
        headers: { 'Content-Type': 'application/json' },
      });

      const serverMessageKey = String(res?.data?.message || '').trim();
      onSuccess(serverMessageKey ? tCommon(serverMessageKey, { defaultValue: serverMessageKey }) : tCommon('tripForm.success.removed'));
      onClose();
      await onRefresh();
      // ------------------------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tCommon(messageKey, { defaultValue: messageKey }) : tCommon('tripForm.errors.notRemoved'));
    // -----------------------------------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  //====================================================================================
  //? UI
  //====================================================================================

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{tBusSchedule('removeTripDialog.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error ? <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div> : null}

        <div className="mb-6">
          <p className="text-gray-700 mb-2">{tBusSchedule('removeTripDialog.confirmText')}</p>
          <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">{translatedTripInfo}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 disabled:bg-gray-400 transition"
          >
            {loading ? tBusSchedule('removeTripDialog.loading') : tBusSchedule('removeTripDialog.confirm')}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition">
            {tBusSchedule('removeTripDialog.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveScheduledTrip;

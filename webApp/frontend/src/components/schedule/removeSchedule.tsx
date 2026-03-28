//======================================================================================
//? Importing
//======================================================================================

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

//======================================================================================
//? Types
//======================================================================================

type RemoveScheduleProps = {
  open: boolean;
  scheduleId: string | null;
  scheduleInfo: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//======================================================================================
//? Component
//======================================================================================

const RemoveSchedule: React.FC<RemoveScheduleProps> = ({
  open,
  scheduleId,
  scheduleInfo,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const { t: tBusSchedule } = useTranslation('busScedule');
  const { t: tGlobal } = useTranslation('translation');

  //====================================================================================
  //? State
  //====================================================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //====================================================================================
  //? Functions
  //====================================================================================

  if (!open || !scheduleId) return null;

  const handleRemove = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.delete('/api/admin/schedule/remove', {
        data: { scheduleId },
        headers: { 'Content-Type': 'application/json' },
      });

      onSuccess(tBusSchedule('success.removed'));
      onClose();
      await onRefresh();
      // -----------------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tBusSchedule('removeDialog.error'));
    // -----------------------------------------------------------  
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
          <h2 className="text-xl font-bold text-gray-800">{tBusSchedule('removeDialog.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error ? <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div> : null}

        <div className="mb-6">
          <p className="text-gray-700 mb-2">{tBusSchedule('removeDialog.confirmText')}</p>
          <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">{scheduleInfo}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 disabled:bg-gray-400 transition"
          >
            {loading ? tBusSchedule('removeDialog.loading') : tBusSchedule('removeDialog.confirm')}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition">
            {tBusSchedule('removeDialog.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};


//=================================================================================
export default RemoveSchedule;


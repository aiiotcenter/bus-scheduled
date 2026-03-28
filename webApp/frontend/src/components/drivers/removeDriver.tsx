//======================================================================================
//? Importing
//======================================================================================
import React, { useState } from 'react';

import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';

interface RemoveDriverProps {
  driverId: string;
  driverName?: string;
  onClose: () => void;
  onSuccess: () => void;
}



//======================================================================================
//? RemoveDriver
//======================================================================================

const RemoveDriver: React.FC<RemoveDriverProps> = ({ 
  driverId, 
  driverName, 
  onClose, 
  onSuccess 
}) => {
  const { t } = useTranslation('drivers');
  const { t: tGlobal } = useTranslation('translation');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const displayDriverName = driverName || t('removeDialog.defaultDriverName');

  const handleRemove = async () => {
    setIsLoading(true);
    setError('');

    try {
      await apiClient.delete(`/api/admin/driver/remove`, {
        data: { id: driverId },
      });

      onSuccess();
      onClose();
    //-----------------------------------------------
    } catch (err: unknown) {
      const messageKey = tryGetApiErrorMessageKey(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('removeDialog.error'));
    //-----------------------------------------------
    } finally {
      setIsLoading(false);
    }
  };

  //======================================================================================
  return (
    <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {t('removeDialog.title')}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {t('removeDialog.confirmText')}<strong>{displayDriverName}</strong>{t('removeDialog.warning')}
        </p>

        {error && (
          <div className=" text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
          >
            {t('removeDialog.cancel')}
          </button>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="px-4 py-2  text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 disabled:opacity-50"
            style={{background: COLORS.burgundy}}
          >
            {isLoading ? t('removeDialog.loading') : t('removeDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

//======================================================================================

export default RemoveDriver;

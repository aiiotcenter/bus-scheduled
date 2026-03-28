//===============================================================================================
//? Importing
//===============================================================================================

import { useState } from 'react';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

//===============================================================================================
//? Types
//===============================================================================================

type RemoveServicePatternProps = {
  open: boolean;
  servicePatternId: string | null;
  title: string | null;
  onClose: () => void;
  onDeleted: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//===============================================================================================
//? Component
//===============================================================================================

const RemoveServicePattern = ({
  open,
  servicePatternId,
  title,
  onClose,
  onDeleted,
  onRefresh,
}: RemoveServicePatternProps) => {
  const { t } = useTranslation('servicePatterns');
  const { t: tGlobal } = useTranslation('translation');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!open || !servicePatternId) {
    return null;
  }

  const label = title?.trim() ? title.trim() : servicePatternId;

  const onConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.delete(`/api/admin/service-pattern/remove`, {
        withCredentials: true,
        data: { servicePatternId },
      });

      onDeleted(t('success.removed'));
      onClose();
      await onRefresh();
    // -------------------------------------------------------
    } catch (err: unknown) {
      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('removeDialog.error'));
    // -------------------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-3">{t('removeDialog.title')}</h2>
        <div className="text-gray-700 mb-6">{t('removeDialog.confirmText', { label })}</div>

        {error ? <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div> : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('removeDialog.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-white rounded-md"
            style={{ background: COLORS.burgundy }}
          >
            {loading ? t('removeDialog.loading') : t('removeDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveServicePattern;

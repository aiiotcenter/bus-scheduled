//===============================================================================================
//? Importing
//===============================================================================================

import { useState } from 'react';
import type { FormEvent } from 'react';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

//===============================================================================================
//? Types
//===============================================================================================

type AddServicePatternProps = {
  open: boolean;
  startOperatingHour: number;
  endOperatingHour: number;
  startOperatingMinuteLabel: string;
  operatingMinuteLabel: string;
  onClose: () => void;
  onCreated: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//===============================================================================================
//? Component
//===============================================================================================

const AddServicePattern = ({
  open,
  startOperatingHour,
  endOperatingHour,
  startOperatingMinuteLabel,
  operatingMinuteLabel,
  onClose,
  onCreated,
  onRefresh,
}: AddServicePatternProps) => {
  const { t } = useTranslation('servicePatterns');
  const { t: tGlobal } = useTranslation('translation');
  const [title, setTitle] = useState('');
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const toggleHour = (hour: number) => {
    setSelectedHours((prev) => {
      if (prev.includes(hour)) {
        return prev.filter((h) => h !== hour);
      }
      return [...prev, hour].sort((a, b) => a - b);
    });
  };

  const handleClose = () => {
    setCreateError(null);
    setTitle('');
    setSelectedHours([]);
    onClose();
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setCreateError(t('addForm.validation.enterTitle'));
      return;
    }
    if (selectedHours.length === 0) {
      setCreateError(t('addForm.validation.selectHour'));
      return;
    }

    const hasInvalidHour = selectedHours.some((h) => h < startOperatingHour || h > endOperatingHour);
    if (hasInvalidHour) {
      const startTime = `${String(startOperatingHour).padStart(2, '0')}:${startOperatingMinuteLabel}`;
      const endTime = `${String(endOperatingHour).padStart(2, '0')}:${operatingMinuteLabel}`;
      setCreateError(t('addForm.validation.invalidHours', { startTime, endTime }));
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient.post(
        `/api/admin/service-pattern/add`,
        {
          title: trimmedTitle,
          hours: selectedHours,
        },
        { withCredentials: true }
      );

      void res;
      onCreated(t('success.added'));
      setTitle('');
      setSelectedHours([]);
      onClose();
      await onRefresh();
    // -------------------------------------------------------
    } catch (err: unknown) {
      const maybeAxiosError = err as { response?: { status?: number } };
      const status = typeof maybeAxiosError?.response?.status === 'number' ? maybeAxiosError.response.status : undefined;

      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      const msg = messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tGlobal('common.errors.internal');
      setCreateError(status ? `${msg} (HTTP ${status})` : msg);
    // -------------------------------------------------------
    } finally {
      setCreating(false);
    }
  };

  // ================================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{t('addForm.title')}</h2>

        {createError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{createError}</div>
        )}

        <form onSubmit={onCreate}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('addForm.patternTitle')}
                <span className="text-red-600"> *</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('addForm.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-700">
                  {t('addForm.coveredHours')}
                  <span className="text-red-600"> *</span>
                </div>
                <div className="text-xs text-gray-500">{t('addForm.hoursHint')}</div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Array.from({ length: endOperatingHour - startOperatingHour + 1 }).map((_, idx) => {
                  const hour = startOperatingHour + idx;
                  const checked = selectedHours.includes(hour);
                  const minuteLabel = hour === startOperatingHour ? startOperatingMinuteLabel : operatingMinuteLabel;
                  const label = `${String(hour).padStart(2, '0')}:${minuteLabel}`;
                  return (
                    <label
                      key={hour}
                      className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm cursor-pointer select-none ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleHour(hour)}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-800">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('addForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              style={{ background: COLORS.burgundy }}
            >
              {creating ? t('addForm.saving') : t('addForm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServicePattern;


//===============================================================================================
//? Importing
//===============================================================================================

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { getApiErrorMessageKeyOrUndefined } from '../../services/apiError';

//===============================================================================================
//? Types
//===============================================================================================

type OperatingHourDto = {
  operatingHourId: string;
  hour: string;
};

type ServicePatternDto = {
  servicePatternId: string;
  title: string;
  operatingHours: OperatingHourDto[];
};

type UpdateServicePatternProps = {
  open: boolean;
  pattern: ServicePatternDto | null;
  startOperatingHour: number;
  endOperatingHour: number;
  startOperatingMinuteLabel: string;
  operatingMinuteLabel: string;
  onClose: () => void;
  onUpdated: (message: string) => void;
  onRefresh: () => Promise<void>;
};

//===============================================================================================
//? Component
//===============================================================================================

const UpdateServicePattern = ({
  open,
  pattern,
  startOperatingHour,
  endOperatingHour,
  startOperatingMinuteLabel,
  operatingMinuteLabel,
  onClose,
  onUpdated,
  onRefresh,
}: UpdateServicePatternProps) => {
  const { t } = useTranslation('servicePatterns');
  const { t: tGlobal } = useTranslation('translation');
  const [title, setTitle] = useState('');
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !pattern) {
      return;
    }

    setTitle(pattern.title || '');
    const hours = (pattern.operatingHours || [])
      .map((oh) => {
        const hh = String(oh.hour).slice(0, 2);
        const num = Number(hh);
        return Number.isFinite(num) ? num : null;
      })
      .filter((x): x is number => x !== null);

    setSelectedHours(Array.from(new Set(hours)).sort((a, b) => a - b));
    setUpdateError(null);
  }, [open, pattern]);

  if (!open || !pattern) {
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
    setUpdateError(null);
    onClose();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdateError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setUpdateError(t('updateForm.validation.enterTitle'));
      return;
    }

    if (selectedHours.length === 0) {
      setUpdateError(t('updateForm.validation.selectHour'));
      return;
    }

    const hasInvalidHour = selectedHours.some((h) => h < startOperatingHour || h > endOperatingHour);
    if (hasInvalidHour) {
      const startTime = `${String(startOperatingHour).padStart(2, '0')}:${startOperatingMinuteLabel}`;
      const endTime = `${String(endOperatingHour).padStart(2, '0')}:${operatingMinuteLabel}`;
      setUpdateError(t('updateForm.validation.invalidHours', { startTime, endTime }));
      return;
    }

    setUpdating(true);
    try {
      const res = await apiClient.patch(
        `/api/admin/service-pattern/update`,
        {
          servicePatternId: pattern.servicePatternId,
          title: trimmedTitle,
          hours: selectedHours,
        },
        { withCredentials: true }
      );

      void res;
      onUpdated(t('success.updated'));
      onClose();
      await onRefresh();
    // -------------------------------------------------------
    } catch (err: unknown) {
      const maybeAxiosError = err as { response?: { status?: number } };
      const status = typeof maybeAxiosError?.response?.status === 'number' ? maybeAxiosError.response.status : undefined;

      const messageKey = getApiErrorMessageKeyOrUndefined(err);
      const msg = messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tGlobal('common.errors.internal');
      setUpdateError(status ? `${msg} (HTTP ${status})` : msg);
    // -------------------------------------------------------
    } finally {
      setUpdating(false);
    }
  };

  // ===============================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{t('updateForm.title')}</h2>

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{updateError}</div>
        )}

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('updateForm.patternTitle')}
                 
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('updateForm.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-700">
                  {t('updateForm.coveredHours')}
                   
                </div>
                <div className="text-xs text-gray-500">{t('updateForm.hoursHint')}</div>
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
              {t('updateForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              style={{ background: COLORS.burgundy }}
            >
              {updating ? t('updateForm.saving') : t('updateForm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateServicePattern;


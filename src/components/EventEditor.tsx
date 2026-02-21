import { useState } from 'react';
import type { MatchEvent } from '../types';
import { useLanguage } from '../hooks/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X } from 'lucide-react';

interface EventEditorProps {
  event: MatchEvent;
  onSave: (updates: Partial<MatchEvent>) => void;
  onClose: () => void;
}

export function EventEditor({ event, onSave, onClose }: EventEditorProps) {
  const { t } = useLanguage();
  const [minute, setMinute] = useState(event.minute.toString());
  const [half, setHalf] = useState<1 | 2>(event.half || 1);
  const [prevEventId, setPrevEventId] = useState(event.id);

  if (event.id !== prevEventId) {
    setPrevEventId(event.id);
    setMinute(event.minute.toString());
    setHalf(event.half || 1);
  }

  const handleSave = () => {
    const minuteNum = parseInt(minute, 10);
    if (!isNaN(minuteNum) && minuteNum >= 0) {
      onSave({ minute: minuteNum, half });
      onClose();
    }
  };

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border rounded-lg shadow-lg p-4 z-[100] w-72 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('editEvent')}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={half === 1 ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setHalf(1)}
        >
          {t('firstHalf')}
        </Button>
        <Button
          variant={half === 2 ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setHalf(2)}
        >
          {t('secondHalf')}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minute">{t('minute')}</Label>
        <Input
          id="minute"
          type="number"
          min="1"
          max="120"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave}>
          {t('save')}
        </Button>
      </div>
    </div>
  );
}

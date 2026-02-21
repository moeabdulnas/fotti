import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Check, X } from 'lucide-react';
import { useMatch } from '@/hooks/useMatch';
import { useLanguage } from '@/hooks/LanguageContext';

export function TeamEditor() {
  const { currentMatch, updateHomeTeam, updateAwayTeam, updateHomeScore, updateAwayScore, updateDate } = useMatch();
  const { t } = useLanguage();
  const [editingHome, setEditingHome] = useState(false);
  const [editingAway, setEditingAway] = useState(false);
  const [homeName, setHomeName] = useState('');
  const [awayName, setAwayName] = useState('');

  if (!currentMatch) return null;

  const handleStartEditHome = () => {
    setHomeName(currentMatch.homeTeam.name);
    setEditingHome(true);
  };

  const handleStartEditAway = () => {
    setAwayName(currentMatch.awayTeam.name);
    setEditingAway(true);
  };

  const handleSaveHome = () => {
    if (homeName.trim()) {
      updateHomeTeam(homeName.trim());
    }
    setEditingHome(false);
  };

  const handleSaveAway = () => {
    if (awayName.trim()) {
      updateAwayTeam(awayName.trim());
    }
    setEditingAway(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{t('matchTeams')}</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="match-date" className="text-muted-foreground">{t('date')}:</Label>
          <Input 
            id="match-date"
            type="date" 
            value={currentMatch.date} 
            onChange={(e) => updateDate(e.target.value)} 
            className="h-8 w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="flex-1">
            <Label className="text-muted-foreground">{t('homeTeam')}</Label>
            <div className="flex items-center gap-2 mt-1">
              {editingHome ? (
                <>
                  <Input
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveHome()}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveHome}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingHome(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-lg">{currentMatch.homeTeam.name}</span>
                  <Button size="icon" variant="ghost" onClick={handleStartEditHome}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Label className="text-muted-foreground">{t('score')}</Label>
              <Input
                type="number"
                min="0"
                value={currentMatch.homeScore ?? 0}
                onChange={(e) => updateHomeScore(parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
            </div>
          </div>
          <div className="flex items-center text-muted-foreground font-semibold">{t('vs')}</div>
          <div className="flex-1">
            <Label className="text-muted-foreground">{t('awayTeam')}</Label>
            <div className="flex items-center gap-2 mt-1">
              {editingAway ? (
                <>
                  <Input
                    value={awayName}
                    onChange={(e) => setAwayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAway()}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveAway}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingAway(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-lg">{currentMatch.awayTeam.name}</span>
                  <Button size="icon" variant="ghost" onClick={handleStartEditAway}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Label className="text-muted-foreground">{t('score')}</Label>
              <Input
                type="number"
                min="0"
                value={currentMatch.awayScore ?? 0}
                onChange={(e) => updateAwayScore(parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

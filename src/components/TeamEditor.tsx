import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Check, X } from 'lucide-react';
import { useMatch } from '@/hooks/useMatch';

export function TeamEditor() {
  const { currentMatch, updateHomeTeam, updateAwayTeam } = useMatch();
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Match Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="flex-1">
            <Label className="text-muted-foreground">Home Team</Label>
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
          </div>
          <div className="flex items-center text-muted-foreground font-semibold">vs</div>
          <div className="flex-1">
            <Label className="text-muted-foreground">Away Team</Label>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

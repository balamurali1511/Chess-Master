import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Volume2, VolumeX, Clock, Palette } from 'lucide-react';

interface SettingsDialogProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
  timeControl: { white: number; black: number; increment: number };
  onTimeControlChange: (timeControl: { white: number; black: number; increment: number }) => void;
  boardTheme: string;
  onBoardThemeChange: (theme: string) => void;
}

const TIME_PRESETS = [
  { name: 'Bullet (1+0)', time: 60, increment: 0 },
  { name: 'Bullet (2+1)', time: 120, increment: 1 },
  { name: 'Blitz (3+0)', time: 180, increment: 0 },
  { name: 'Blitz (3+2)', time: 180, increment: 2 },
  { name: 'Blitz (5+0)', time: 300, increment: 0 },
  { name: 'Blitz (5+3)', time: 300, increment: 3 },
  { name: 'Rapid (10+0)', time: 600, increment: 0 },
  { name: 'Rapid (15+10)', time: 900, increment: 10 },
  { name: 'Classical (30+0)', time: 1800, increment: 0 },
  { name: 'Custom', time: 0, increment: 0 }
];

const BOARD_THEMES = [
  { name: 'Classic', value: 'classic' },
  { name: 'Modern', value: 'modern' },
  { name: 'Wooden', value: 'wooden' },
  { name: 'Glass', value: 'glass' }
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  soundEnabled,
  onSoundToggle,
  timeControl,
  onTimeControlChange,
  boardTheme,
  onBoardThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localTimeControl, setLocalTimeControl] = useState(timeControl);
  const [selectedPreset, setSelectedPreset] = useState('Custom');

  const handleTimePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = TIME_PRESETS.find(p => p.name === presetName);
    if (preset && preset.name !== 'Custom') {
      const newTimeControl = {
        white: preset.time,
        black: preset.time,
        increment: preset.increment
      };
      setLocalTimeControl(newTimeControl);
    }
  };

  const handleApplySettings = () => {
    onTimeControlChange(localTimeControl);
    setIsOpen(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-game-panel border-game-panel-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Game Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound Effects
            </Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-toggle" className="text-sm text-muted-foreground">
                Enable move sounds and game alerts
              </Label>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={onSoundToggle}
              />
            </div>
          </div>

          {/* Time Control Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Control
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Preset</Label>
                <Select value={selectedPreset} onValueChange={handleTimePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PRESETS.map(preset => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Time per player</Label>
                  <div className="mt-2">
                    <Slider
                      value={[localTimeControl.white]}
                      onValueChange={([value]) => {
                        const newTimeControl = {
                          ...localTimeControl,
                          white: value,
                          black: value
                        };
                        setLocalTimeControl(newTimeControl);
                        setSelectedPreset('Custom');
                      }}
                      max={3600}
                      min={30}
                      step={30}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      {formatTime(localTimeControl.white)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Increment (seconds)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[localTimeControl.increment]}
                      onValueChange={([value]) => {
                        setLocalTimeControl(prev => ({ ...prev, increment: value }));
                        setSelectedPreset('Custom');
                      }}
                      max={30}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      +{localTimeControl.increment}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Board Theme Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Board Theme
            </Label>
            <Select value={boardTheme} onValueChange={onBoardThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOARD_THEMES.map(theme => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <Button onClick={handleApplySettings} className="w-full">
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
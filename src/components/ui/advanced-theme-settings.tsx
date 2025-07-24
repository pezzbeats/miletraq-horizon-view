import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, Palette, Moon, Sun, Sunset, Type, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ThemeCustomization {
  primaryColor: string;
  fontSize: number;
  reducedMotion: boolean;
  highContrast: boolean;
  compactMode: boolean;
  autoThemeTime: boolean;
  darkModeStart: string;
  lightModeStart: string;
}

const THEME_COLORS = [
  { name: "Blue", value: "217 91% 60%", class: "bg-blue-500" },
  { name: "Green", value: "142 76% 36%", class: "bg-green-500" },
  { name: "Purple", value: "262 83% 58%", class: "bg-purple-500" },
  { name: "Orange", value: "24 95% 53%", class: "bg-orange-500" },
  { name: "Red", value: "0 84% 60%", class: "bg-red-500" },
  { name: "Teal", value: "173 80% 40%", class: "bg-teal-500" },
];

const FONT_SIZES = [
  { name: "Small", value: 14 },
  { name: "Medium", value: 16 },
  { name: "Large", value: 18 },
  { name: "Extra Large", value: 20 },
];

export const AdvancedThemeSettings: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const [customization, setCustomization] = React.useState<ThemeCustomization>({
    primaryColor: "217 91% 60%",
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
    autoThemeTime: true,
    darkModeStart: "19:00",
    lightModeStart: "07:00",
  });

  const [isOpen, setIsOpen] = React.useState(false);

  // Apply customizations to CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', customization.primaryColor);
    root.style.setProperty('--font-size-base', `${customization.fontSize}px`);
    
    if (customization.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    if (customization.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (customization.compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
  }, [customization]);

  const updateCustomization = (key: keyof ThemeCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setCustomization({
      primaryColor: "217 91% 60%",
      fontSize: 16,
      reducedMotion: false,
      highContrast: false,
      compactMode: false,
      autoThemeTime: true,
      darkModeStart: "19:00",
      lightModeStart: "07:00",
    });
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Sunset;

  return (
    <>
      {/* Floating Settings Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        size="icon"
        variant="gradient"
      >
        <Settings className="h-6 w-6" />
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Advanced Theme Settings
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ×
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Theme Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'auto', icon: Sunset, label: 'Auto' },
                  ].map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      variant={theme === value ? "default" : "outline"}
                      className="h-16 flex-col gap-2"
                      onClick={() => setTheme(value as any)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto Theme Time Settings */}
              {theme === 'auto' && customization.autoThemeTime && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">Auto Theme Schedule</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Dark Mode Start</Label>
                      <input
                        type="time"
                        value={customization.darkModeStart}
                        onChange={(e) => updateCustomization('darkModeStart', e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Light Mode Start</Label>
                      <input
                        type="time"
                        value={customization.lightModeStart}
                        onChange={(e) => updateCustomization('lightModeStart', e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Color */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Primary Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={customization.primaryColor === color.value ? "default" : "outline"}
                      className="h-12 gap-2"
                      onClick={() => updateCustomization('primaryColor', color.value)}
                    >
                      <div className={cn("w-4 h-4 rounded-full", color.class)} />
                      <span className="text-xs">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Font Size</Label>
                <div className="space-y-2">
                  <Slider
                    value={[customization.fontSize]}
                    onValueChange={([value]) => updateCustomization('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (12px)</span>
                    <span>Current: {customization.fontSize}px</span>
                    <span>Large (24px)</span>
                  </div>
                </div>
              </div>

              {/* Accessibility Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Accessibility</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Reduce Motion</Label>
                      <p className="text-xs text-muted-foreground">
                        Minimizes animations for motion sensitivity
                      </p>
                    </div>
                    <Switch
                      checked={customization.reducedMotion}
                      onCheckedChange={(checked) => updateCustomization('reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">High Contrast</Label>
                      <p className="text-xs text-muted-foreground">
                        Increases contrast for better readability
                      </p>
                    </div>
                    <Switch
                      checked={customization.highContrast}
                      onCheckedChange={(checked) => updateCustomization('highContrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Reduces spacing for more content
                      </p>
                    </div>
                    <Switch
                      checked={customization.compactMode}
                      onCheckedChange={(checked) => updateCustomization('compactMode', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preview</Label>
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium" style={{ fontSize: customization.fontSize }}>
                    Sample Heading
                  </h4>
                  <p className="text-muted-foreground" style={{ fontSize: customization.fontSize - 2 }}>
                    This is how your text will appear with the current settings.
                  </p>
                  <Button size="sm" style={{ fontSize: customization.fontSize - 2 }}>
                    Sample Button
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={resetToDefaults} variant="outline" className="flex-1">
                  Reset to Defaults
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Apply Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
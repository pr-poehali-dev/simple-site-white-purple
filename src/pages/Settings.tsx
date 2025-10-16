import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CORRECT_PASSWORD = "210212";

export default function Settings() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState('');
  const [defaultImage, setDefaultImage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedDefaults = localStorage.getItem('defaultSettings');
    if (savedDefaults) {
      const defaults = JSON.parse(savedDefaults);
      setDefaultMessage(defaults.message || 'Добро пожаловать!');
      setDefaultImage(defaults.image || 'https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg');
    } else {
      setDefaultMessage('Добро пожаловать!');
      setDefaultImage('https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg');
    }
  }, []);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleSave = () => {
    const defaultSettings = {
      message: defaultMessage,
      image: defaultImage
    };
    localStorage.setItem('defaultSettings', JSON.stringify(defaultSettings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={() => navigate('/')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Введите пароль</DialogTitle>
            <DialogDescription className="text-center">
              Для доступа к настройкам требуется авторизация
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Пароль"
              className={`text-center text-lg ${passwordError ? 'border-destructive' : ''}`}
            />
            {passwordError && (
              <p className="text-sm text-destructive text-center">Неверный пароль</p>
            )}
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Icon name="Lock" size={18} className="mr-2" />
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-primary/10 p-6">
      <Card className="w-full max-w-2xl p-8 shadow-xl border-2 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Настройки по умолчанию
          </h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="border-2 border-primary text-primary hover:bg-secondary"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultMessage" className="text-lg font-medium">
              Текст приветствия по умолчанию
            </Label>
            <Input
              id="defaultMessage"
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              placeholder="Введите текст приветствия..."
              className="text-lg border-2 border-primary/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultImage" className="text-lg font-medium">
              URL изображения по умолчанию
            </Label>
            <Input
              id="defaultImage"
              value={defaultImage}
              onChange={(e) => setDefaultImage(e.target.value)}
              placeholder="https://..."
              className="text-lg border-2 border-primary/30 focus:border-primary"
            />
            {defaultImage && (
              <div className="mt-4 rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src={defaultImage} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+URL';
                  }}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isSaved ? (
              <>
                <Icon name="Check" size={20} className="mr-2" />
                Сохранено!
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Эти настройки будут использоваться при сбросе к начальным значениям
          </p>
        </div>
      </Card>
    </div>
  );
}

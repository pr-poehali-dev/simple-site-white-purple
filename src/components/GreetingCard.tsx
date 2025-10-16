import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CORRECT_PASSWORD = "210212";

interface GreetingCardProps {
  initialMessage?: string;
  imageUrl?: string;
}

export default function GreetingCard({ 
  initialMessage = "Добро пожаловать!", 
  imageUrl = "https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg"
}: GreetingCardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [tempMessage, setTempMessage] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMessage = localStorage.getItem('greetingMessage');
    const savedImage = localStorage.getItem('greetingImage');
    
    setMessage(savedMessage || initialMessage);
    setTempMessage(savedMessage || initialMessage);
    setCurrentImage(savedImage || imageUrl);
  }, [initialMessage, imageUrl]);

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

  const handleEdit = () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }

    if (isEditing) {
      setMessage(tempMessage);
      localStorage.setItem('greetingMessage', tempMessage);
    } else {
      setTempMessage(message);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setTempMessage(message);
    setIsEditing(false);
  };

  const handleImageUpload = () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCurrentImage(result);
        localStorage.setItem('greetingImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-xl border-2 border-primary/20 hover:shadow-2xl transition-all duration-300">
        <div className="relative h-64 bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden group">
          <img 
            src={currentImage} 
            alt="Greeting" 
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          <Button
            onClick={handleImageUpload}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            Загрузить фото
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="p-8 bg-white">
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  className="text-2xl font-bold text-center border-2 border-primary focus:border-primary focus:ring-primary"
                  placeholder="Введите сообщение..."
                />
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={handleEdit}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
                  >
                    <Icon name="Check" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-secondary font-medium px-6"
                  >
                    <Icon name="X" size={18} className="mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {message}
                </h2>
                <Button 
                  onClick={handleEdit}
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <Icon name="Edit3" size={18} className="mr-2" />
                  Редактировать
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Введите пароль</DialogTitle>
            <DialogDescription className="text-center">
              Для редактирования требуется авторизация
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
    </>
  );
}

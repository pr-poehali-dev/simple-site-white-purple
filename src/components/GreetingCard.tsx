import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = "210212251277";
const API_URL = "https://functions.poehali.dev/828e1e69-52be-411c-9b7c-26486b3b2d8e";

interface GreetingCardProps {
  initialMessage?: string;
  imageUrl?: string;
}

export default function GreetingCard({ 
  initialMessage = "Добро пожаловать!", 
  imageUrl = "https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg"
}: GreetingCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [tempMessage, setTempMessage] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [greetingId, setGreetingId] = useState('default');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let deviceId = localStorage.getItem('deviceGreetingId');
    if (!deviceId) {
      deviceId = 'default';
      localStorage.setItem('deviceGreetingId', deviceId);
    }
    
    const urlId = searchParams.get('id');
    if (urlId) {
      setGreetingId(urlId);
    } else {
      setGreetingId(deviceId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (greetingId) {
      loadSettings();
    }
  }, [greetingId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}?id=${greetingId}`);
      const data = await response.json();
      setMessage(data.message);
      setTempMessage(data.message);
      setCurrentImage(data.imageUrl);
    } catch (error) {
      setMessage(initialMessage);
      setTempMessage(initialMessage);
      setCurrentImage(imageUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newMessage: string, newImageUrl: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': ADMIN_PASSWORD
        },
        body: JSON.stringify({
          id: greetingId,
          message: newMessage,
          imageUrl: newImageUrl
        })
      });

      if (response.ok) {
        toast({
          title: "Сохранено!",
          description: "Изменения применены к этой версии",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    }
  };

  const handleReset = async () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }

    const savedDefaults = localStorage.getItem('defaultSettings');
    if (savedDefaults) {
      const defaults = JSON.parse(savedDefaults);
      setMessage(defaults.message);
      setTempMessage(defaults.message);
      setCurrentImage(defaults.image);
      await saveSettings(defaults.message, defaults.image);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleEdit = async () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }

    if (isEditing) {
      setMessage(tempMessage);
      await saveSettings(tempMessage, currentImage);
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
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setCurrentImage(result);
        await saveSettings(message, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-xl border-2 border-primary/30 bg-gradient-to-br from-white via-blue-50/50 to-white">
        <div className="p-8 text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-xl border-2 border-primary/30 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50/50 to-white">
        <div 
          className={`relative h-64 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 overflow-hidden group ${isDragging ? 'ring-4 ring-primary ring-offset-2' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <img 
            src={currentImage} 
            alt="Greeting" 
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {isDragging && (
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-white text-xl font-bold flex items-center gap-2">
                <Icon name="Upload" size={32} />
                Отпустите для загрузки
              </div>
            </div>
          )}
          
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
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="p-8 bg-gradient-to-br from-white via-blue-50/30 to-white">
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
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button 
                    onClick={handleEdit}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Icon name="Edit3" size={18} className="mr-2" />
                    Редактировать
                  </Button>
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-secondary font-medium px-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Icon name="RotateCcw" size={18} className="mr-2" />
                    Сбросить
                  </Button>
                  <Button 
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-secondary font-medium px-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Icon name="Settings" size={18} className="mr-2" />
                    Настройки
                  </Button>
                  <Button 
                    onClick={() => navigate('/manage')}
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-secondary font-medium px-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Icon name="Users" size={18} className="mr-2" />
                    Версии
                  </Button>
                </div>
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

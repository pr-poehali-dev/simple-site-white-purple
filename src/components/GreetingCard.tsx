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

interface Version {
  id: string;
  message: string;
  imageUrl: string;
}

export default function GreetingCard({ 
  initialMessage = "Добро пожаловать!", 
  imageUrl = "https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg"
}: GreetingCardProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [tempMessage, setTempMessage] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [greetingId, setGreetingId] = useState('default');
  const [versions, setVersions] = useState<Version[]>([]);
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

  const loadAllVersions = async () => {
    try {
      const response = await fetch(`${API_URL}?action=list`, {
        headers: {
          'X-Auth-Token': ADMIN_PASSWORD
        }
      });
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить версии",
        variant: "destructive"
      });
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

  const handleVersionsClick = async () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }
    await loadAllVersions();
    setShowVersionsDialog(true);
  };

  const handleSwitchVersion = (versionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('id', versionId);
    setSearchParams(newParams);
    setShowVersionsDialog(false);
    window.location.reload();
  };

  const handleCopyLink = (versionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${versionId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Скопировано!",
      description: "Ссылка скопирована в буфер обмена",
    });
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
                  className="text-2xl font-bold border-2 border-primary/50 focus:border-primary"
                  placeholder="Введите текст приветствия..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleEdit} className="flex-1">
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <Icon name="X" size={16} className="mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-normal pb-1">
                  {message}
                </h2>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleEdit} 
              variant="outline" 
              className="flex-1 border-2 border-primary/50 hover:bg-primary hover:text-white transition-all"
            >
              <Icon name={isEditing ? "Check" : "Edit"} size={16} className="mr-2" />
              {isEditing ? "Сохранить" : "Изменить"}
            </Button>
            <Button 
              onClick={handleVersionsClick}
              variant="outline" 
              className="flex-1 border-2 border-purple-500/50 hover:bg-purple-500 hover:text-white transition-all"
            >
              <Icon name="Layers" size={16} className="mr-2" />
              Версии
            </Button>
            <Button 
              onClick={() => navigate('/settings')}
              variant="outline" 
              className="flex-1 border-2 border-blue-500/50 hover:bg-blue-500 hover:text-white transition-all"
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Введите пароль</DialogTitle>
            <DialogDescription>
              Для редактирования требуется пароль
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Введите пароль"
              className={passwordError ? 'border-red-500' : ''}
            />
            {passwordError && (
              <p className="text-sm text-red-500">Неверный пароль</p>
            )}
            <Button onClick={handlePasswordSubmit} className="w-full">
              Подтвердить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Все версии приветствий</DialogTitle>
            <DialogDescription>
              Выберите версию для просмотра или скопируйте ссылку для отправки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Нет доступных версий</p>
            ) : (
              versions.map((version) => (
                <Card key={version.id} className="p-4 border-2 hover:border-primary/50 transition-all">
                  <div className="flex gap-4">
                    <img 
                      src={version.imageUrl} 
                      alt={version.id}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">
                        {version.id}
                        {version.id === greetingId && (
                          <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">Текущая</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{version.message}</p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSwitchVersion(version.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Icon name="Eye" size={14} className="mr-1" />
                          Открыть
                        </Button>
                        <Button 
                          onClick={() => handleCopyLink(version.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Icon name="Link" size={14} className="mr-1" />
                          Копировать ссылку
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

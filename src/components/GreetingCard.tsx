import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [editingImage, setEditingImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editVersionFileInputRef = useRef<HTMLInputElement>(null);

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

  const saveVersionEdit = async (versionId: string, newMessage: string, newImageUrl: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': ADMIN_PASSWORD
        },
        body: JSON.stringify({
          id: versionId,
          message: newMessage,
          imageUrl: newImageUrl
        })
      });

      if (response.ok) {
        toast({
          title: "Сохранено!",
          description: `Версия "${versionId}" обновлена`,
        });
        await loadAllVersions();
        setEditingVersionId(null);
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

  const handleCopyUrl = (versionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${versionId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Скопировано!",
      description: "Ссылка скопирована в буфер обмена",
    });
  };

  const handleSwitchVersion = (versionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${versionId}`;
    window.open(url, '_blank');
  };

  const startEditingVersion = (version: Version) => {
    setEditingVersionId(version.id);
    setEditingMessage(version.message);
    setEditingImage(version.imageUrl);
  };

  const cancelEditingVersion = () => {
    setEditingVersionId(null);
    setEditingMessage('');
    setEditingImage('');
  };

  const saveEditingVersion = async () => {
    if (editingVersionId) {
      await saveVersionEdit(editingVersionId, editingMessage, editingImage);
    }
  };

  const handleEditVersionImageUpload = () => {
    editVersionFileInputRef.current?.click();
  };

  const handleEditVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditingImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
        <div 
          className={`relative h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 transition-all duration-300 ${isDragging ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentImage && (
            <img 
              src={currentImage} 
              alt="Greeting" 
              className="w-full h-full object-cover"
            />
          )}
          {isDragging && (
            <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
              <div className="text-white text-xl font-semibold">Отпустите файл здесь</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="p-8 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <Label htmlFor="message" className="text-lg font-semibold text-gray-700">
                Редактировать сообщение
              </Label>
              <Input
                id="message"
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                className="text-lg"
                placeholder="Введите новое сообщение"
              />
              <div className="flex gap-2">
                <Button onClick={handleEdit} className="flex-1">
                  <Icon name="Check" size={18} className="mr-2" />
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{message}</h1>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleEdit} 
              variant={isEditing ? "default" : "outline"}
              className="flex-1 min-w-[140px]"
            >
              <Icon name="Edit" size={18} className="mr-2" />
              {isEditing ? 'Готово' : 'Редактировать текст'}
            </Button>
            <Button onClick={handleImageUpload} variant="outline" className="flex-1 min-w-[140px]">
              <Icon name="Upload" size={18} className="mr-2" />
              Изменить картинку
            </Button>
            <Button onClick={handleVersionsClick} variant="outline" className="flex-1 min-w-[140px]">
              <Icon name="List" size={18} className="mr-2" />
              Все версии
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Введите пароль администратора</DialogTitle>
            <DialogDescription>
              Для редактирования требуется пароль
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className={passwordError ? 'border-red-500' : ''}
            />
            {passwordError && (
              <p className="text-sm text-red-500">Неверный пароль</p>
            )}
            <Button onClick={handlePasswordSubmit} className="w-full">
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Все версии (100 последних)</DialogTitle>
            <DialogDescription>
              Список всех версий приветствий. Нажмите "Редактировать" для изменения.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {versions.map((version) => (
              <div key={version.id} className="p-4 border rounded-lg bg-gray-50">
                {editingVersionId === version.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold min-w-[60px]">ID:</Label>
                      <span className="text-sm text-gray-600">{version.id}</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Сообщение:</Label>
                      <Input
                        value={editingMessage}
                        onChange={(e) => setEditingMessage(e.target.value)}
                        placeholder="Текст сообщения"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Картинка:</Label>
                      <div className="flex gap-2">
                        <Input
                          value={editingImage}
                          onChange={(e) => setEditingImage(e.target.value)}
                          placeholder="URL изображения"
                          className="flex-1"
                        />
                        <Button onClick={handleEditVersionImageUpload} variant="outline" size="sm">
                          <Icon name="Upload" size={16} />
                        </Button>
                      </div>
                      {editingImage && (
                        <img 
                          src={editingImage} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEditingVersion} size="sm" className="flex-1">
                        <Icon name="Check" size={16} className="mr-1" />
                        Сохранить
                      </Button>
                      <Button onClick={cancelEditingVersion} variant="outline" size="sm" className="flex-1">
                        <Icon name="X" size={16} className="mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-500">ID:</span>
                          <span className="text-sm">{version.id}</span>
                        </div>
                        <p className="text-gray-700">{version.message}</p>
                        {version.imageUrl && (
                          <img 
                            src={version.imageUrl} 
                            alt={version.id} 
                            className="w-full h-24 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        onClick={() => startEditingVersion(version)} 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        <Icon name="Edit" size={16} className="mr-1" />
                        Редактировать
                      </Button>
                      <Button 
                        onClick={() => handleSwitchVersion(version.id)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Icon name="ExternalLink" size={16} className="mr-1" />
                        Открыть
                      </Button>
                      <Button 
                        onClick={() => handleCopyUrl(version.id)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Icon name="Copy" size={16} className="mr-1" />
                        Копировать
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <input
            ref={editVersionFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleEditVersionFileChange}
            className="hidden"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = "210212251277";
const API_URL = "https://functions.poehali.dev/828e1e69-52be-411c-9b7c-26486b3b2d8e";

interface Greeting {
  id: string;
  message: string;
}

export default function Manage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGreetingId, setNewGreetingId] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadGreetings();
    }
  }, [isAuthenticated]);

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

  const loadGreetings = async () => {
    try {
      const response = await fetch(`${API_URL}?action=list`, {
        headers: {
          'X-Auth-Token': ADMIN_PASSWORD
        }
      });
      const data = await response.json();
      setGreetings(data.greetings || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список версий",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGreeting = async () => {
    if (!newGreetingId.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID для новой версии",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': ADMIN_PASSWORD
        },
        body: JSON.stringify({
          id: newGreetingId,
          message: 'Добро пожаловать!',
          imageUrl: 'https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg'
        })
      });

      if (response.ok) {
        toast({
          title: "Создано!",
          description: "Новая версия приветствия создана",
        });
        setNewGreetingId('');
        setShowCreateDialog(false);
        loadGreetings();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать версию",
        variant: "destructive"
      });
    }
  };

  const handleSetAsDefault = (id: string) => {
    localStorage.setItem('deviceGreetingId', id);
    toast({
      title: "Установлено!",
      description: `Версия "${id}" теперь по умолчанию на этом устройстве`,
    });
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/?id=${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Скопировано!",
      description: "Ссылка скопирована в буфер обмена",
    });
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={() => navigate('/')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Введите пароль администратора</DialogTitle>
            <DialogDescription className="text-center">
              Для доступа к управлению версиями требуется авторизация
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
      <Card className="w-full max-w-4xl p-8 shadow-xl border-2 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Управление версиями
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Создать версию
            </Button>
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
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {greetings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Нет созданных версий</p>
            ) : (
              greetings.map((greeting) => (
                <Card key={greeting.id} className="p-6 border-2 border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {greeting.id === 'default' ? '🏠 ' : ''}
                        {greeting.id}
                      </h3>
                      <p className="text-muted-foreground">{greeting.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/?id=${greeting.id}`)}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-secondary"
                      >
                        <Icon name="Eye" size={16} className="mr-2" />
                        Открыть
                      </Button>
                      <Button
                        onClick={() => handleCopyLink(greeting.id)}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-secondary"
                      >
                        <Icon name="Link" size={16} className="mr-2" />
                        Копировать ссылку
                      </Button>
                      <Button
                        onClick={() => handleSetAsDefault(greeting.id)}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-secondary"
                      >
                        <Icon name="Home" size={16} className="mr-2" />
                        По умолчанию
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-primary/20">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <Icon name="Info" size={18} />
            Как это работает:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Каждое устройство видит свою версию по умолчанию</li>
            <li>• С паролем можно просматривать все версии и создавать новые</li>
            <li>• Скопируйте ссылку с ID чтобы поделиться конкретной версией</li>
            <li>• Кнопка "По умолчанию" устанавливает версию для текущего устройства</li>
          </ul>
        </div>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Создать новую версию</DialogTitle>
            <DialogDescription className="text-center">
              Введите уникальный ID для новой версии приветствия
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newGreetingId}
              onChange={(e) => setNewGreetingId(e.target.value)}
              placeholder="Например: anna, vova, family..."
              className="text-center text-lg"
            />
            <div className="flex gap-3">
              <Button 
                onClick={handleCreateGreeting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Создать
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewGreetingId('');
                }}
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-secondary"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

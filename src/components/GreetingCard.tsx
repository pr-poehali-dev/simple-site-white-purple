import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface GreetingCardProps {
  initialMessage?: string;
  imageUrl?: string;
}

export default function GreetingCard({ 
  initialMessage = "Добро пожаловать!", 
  imageUrl = "https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg"
}: GreetingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [tempMessage, setTempMessage] = useState(initialMessage);

  const handleEdit = () => {
    if (isEditing) {
      setMessage(tempMessage);
    } else {
      setTempMessage(message);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setTempMessage(message);
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-xl border-2 border-primary/20 hover:shadow-2xl transition-all duration-300">
      <div className="relative h-64 bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Greeting" 
          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
  );
}

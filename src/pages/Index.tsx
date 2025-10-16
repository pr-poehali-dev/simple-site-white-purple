import GreetingCard from '@/components/GreetingCard';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-primary/10 p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />
      
      <GreetingCard />
    </div>
  );
};

export default Index;
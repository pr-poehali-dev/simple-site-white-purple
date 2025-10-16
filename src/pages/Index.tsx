import GreetingCard from '@/components/GreetingCard';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-primary/10 p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-20 left-5 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
      <div className="absolute top-1/3 left-10 w-20 h-20 bg-secondary/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 right-10 w-40 h-40 bg-secondary/35 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-primary/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="absolute top-10 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-5 w-28 h-28 bg-secondary/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.8s' }} />
      <div className="absolute bottom-1/3 left-20 w-16 h-16 bg-primary/35 rounded-full blur-xl" />
      
      <GreetingCard />
    </div>
  );
};

export default Index;
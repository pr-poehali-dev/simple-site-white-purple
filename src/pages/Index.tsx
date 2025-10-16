import GreetingCard from '@/components/GreetingCard';
import DraggableCircle from '@/components/DraggableCircle';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-primary/10 p-6 relative overflow-hidden">
      <DraggableCircle 
        initialX={-20} 
        initialY={-20} 
        size={600} 
        color="primary" 
        opacity={25} 
        blur="3xl"
        floatDuration={25}
        floatX={30}
        floatY={20}
      />
      <DraggableCircle 
        initialX={5} 
        initialY={10} 
        size={200} 
        color="primary" 
        opacity={30} 
        blur="2xl"
        floatDuration={18}
        floatX={-20}
        floatY={15}
      />
      <DraggableCircle 
        initialX={8} 
        initialY={35} 
        size={120} 
        color="secondary" 
        opacity={40} 
        blur="xl"
        floatDuration={22}
        floatX={15}
        floatY={-25}
      />
      
      <DraggableCircle 
        initialX={85} 
        initialY={85} 
        size={700} 
        color="primary" 
        opacity={20} 
        blur="3xl"
        floatDuration={28}
        floatX={-25}
        floatY={30}
      />
      <DraggableCircle 
        initialX={80} 
        initialY={20} 
        size={250} 
        color="secondary" 
        opacity={35} 
        blur="2xl"
        floatDuration={20}
        floatX={20}
        floatY={-15}
      />
      <DraggableCircle 
        initialX={70} 
        initialY={10} 
        size={150} 
        color="primary" 
        opacity={25} 
        blur="xl"
        floatDuration={19}
        floatX={-15}
        floatY={20}
      />
      
      <DraggableCircle 
        initialX={92} 
        initialY={50} 
        size={180} 
        color="primary" 
        opacity={20} 
        blur="3xl"
        floatDuration={24}
        floatX={25}
        floatY={-20}
      />
      <DraggableCircle 
        initialX={95} 
        initialY={55} 
        size={170} 
        color="secondary" 
        opacity={30} 
        blur="2xl"
        floatDuration={21}
        floatX={-18}
        floatY={22}
      />
      
      <DraggableCircle 
        initialX={-5} 
        initialY={88} 
        size={500} 
        color="secondary" 
        opacity={25} 
        blur="3xl"
        floatDuration={26}
        floatX={20}
        floatY={-28}
      />
      <DraggableCircle 
        initialX={15} 
        initialY={70} 
        size={100} 
        color="primary" 
        opacity={35} 
        blur="xl"
        floatDuration={17}
        floatX={-22}
        floatY={18}
      />
      
      <GreetingCard />
    </div>
  );
};

export default Index;

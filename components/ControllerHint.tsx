import React from 'react';

interface ControllerHintProps {
  visible: boolean;
}

const ControllerHint: React.FC<ControllerHintProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-orange-500/95 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg pointer-events-none max-w-lg">
      <p className="text-center mb-1">🎮 Controller tilsluttet</p>
      <p className="text-center text-xs font-normal opacity-90">
        Stik/D-pad: flyt · A: vælg · B: annuller · X: hjælp · Y: fortryd · LB: farer · Start: nyt spil
      </p>
    </div>
  );
};

export default ControllerHint;

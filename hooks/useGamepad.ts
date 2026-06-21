import { useEffect, useRef, useState, useCallback } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GamepadActions {
  onConfirm: () => void;
  onCancel: () => void;
  onMove: (direction: Direction) => void;
  onAdvice?: () => void;
  onUndo?: () => void;
  onNewGame?: () => void;
  onToggleThreats?: () => void;
}

const STICK_DEADZONE = 0.45;
const REPEAT_DELAY_MS = 180;
const STICK_REPEAT_MS = 220;

const DPAD_BUTTONS: Record<number, Direction> = {
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

function getActiveGamepad(): Gamepad | null {
  const pads = navigator.getGamepads?.() ?? [];
  for (const pad of pads) {
    if (pad?.connected) return pad;
  }
  return null;
}

function readDirection(pad: Gamepad): Direction | null {
  for (const [index, dir] of Object.entries(DPAD_BUTTONS)) {
    if (pad.buttons[Number(index)]?.pressed) return dir;
  }

  const x = pad.axes[0] ?? 0;
  const y = pad.axes[1] ?? 0;

  if (Math.abs(x) < STICK_DEADZONE && Math.abs(y) < STICK_DEADZONE) return null;
  if (Math.abs(x) > Math.abs(y)) {
    return x < 0 ? 'left' : 'right';
  }
  return y < 0 ? 'up' : 'down';
}

export function useGamepad(actions: GamepadActions, enabled = true) {
  const [connected, setConnected] = useState(false);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const prevButtonsRef = useRef<boolean[]>([]);
  const lastMoveRef = useRef(0);
  const heldDirectionRef = useRef<Direction | null>(null);

  const handleConnect = useCallback(() => {
    setConnected(!!getActiveGamepad());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    handleConnect();
    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleConnect);

    let frameId = 0;

    const poll = () => {
      const pad = getActiveGamepad();
      const isConnected = !!pad;
      setConnected((prev) => (prev !== isConnected ? isConnected : prev));

      if (pad) {
        const prev = prevButtonsRef.current;
        const now = Date.now();
        const pressed = (index: number) => pad.buttons[index]?.pressed ?? false;
        const justPressed = (index: number) => pressed(index) && !prev[index];

        if (justPressed(0)) actionsRef.current.onConfirm();
        if (justPressed(1)) actionsRef.current.onCancel();
        if (justPressed(2)) actionsRef.current.onAdvice?.();
        if (justPressed(3)) actionsRef.current.onUndo?.();
        if (justPressed(9)) actionsRef.current.onNewGame?.();
        if (justPressed(4)) actionsRef.current.onToggleThreats?.();

        const direction = readDirection(pad);
        const repeatMs = pad.buttons[12]?.pressed || pad.buttons[13]?.pressed ||
          pad.buttons[14]?.pressed || pad.buttons[15]?.pressed
          ? REPEAT_DELAY_MS
          : STICK_REPEAT_MS;

        if (direction) {
          if (direction !== heldDirectionRef.current || now - lastMoveRef.current >= repeatMs) {
            actionsRef.current.onMove(direction);
            lastMoveRef.current = now;
            heldDirectionRef.current = direction;
          }
        } else {
          heldDirectionRef.current = null;
        }

        prevButtonsRef.current = pad.buttons.map((b) => b.pressed);
      }

      frameId = requestAnimationFrame(poll);
    };

    frameId = requestAnimationFrame(poll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleConnect);
    };
  }, [enabled, handleConnect]);

  return { connected };
}

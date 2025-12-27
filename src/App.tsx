import { useEffect, useRef, useState } from 'react'
import Modal from './components/Modal'

enum Status {
  start = "start",
  playing = "playing",
  allCleared = "allCleared",
  gameOver = "gameOver"
}

interface Location {
  x: number;
  y: number;
}

interface Point {
  number: number;
  location: Location;
  clicked: boolean;
  remaining: number;
  opacity: number;
}

function App() {
  const [timer, setTimer] = useState<number>(0)
  const [amount, setAmount] = useState<string>('5')
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<Status>(Status.start);
  const [current, setCurrent] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showLoseModal, setShowLoseModal] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);

  console.log('Updated dev');

  useEffect(() => {
    let interval: any;
    if (status === Status.playing) {
      interval = setInterval(() => {
        setTimer(timer => timer + 10);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === Status.playing) {
      const interval = setInterval(() => {
        setPoints(prev => {
          // Skip updates if nothing is clicked to avoid unnecessary re-renders
          const hasClicked = prev.some(point => point.clicked);
          if (!hasClicked) return prev;

          const updatedPoints = prev
            .map(point => {
              if (point.clicked) {
                const remaining = point.remaining - 0.1;
                if (remaining <= 0) {
                  return null;
                }

                return { ...point, remaining, opacity: (remaining / 3) * 100 };
              }

              return point;
            })
            .filter(point => point !== null) as Point[];

          if (updatedPoints.length === 0) {
            setStatus(Status.allCleared);
            setAutoPlay(false);
            setShowWinModal(true);
          }

          return updatedPoints;
        })
      }, 100);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === Status.playing) {
      const interval = setInterval(() => {
        if (autoPlay) {
          handleClick(current);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoPlay, status, current]);

  const handleStart = () => {
    // Clear all state
    setTimer(0);
    setCurrent(1);
    setPoints([]);
    setAutoPlay(false);
    setStatus(Status.playing);
    setShowWinModal(false);
    setShowLoseModal(false);

    const pointSize = 60;
    const boxWidth = boxRef.current?.clientWidth || 650;
    const boxHeight = boxRef.current?.clientHeight || 400;

    const totalPoints = Math.max(1, Number.parseInt(amount, 10) || 0);
    const newPoints: Point[] = [];
    for (let i = totalPoints; i >= 1; i--) {
      const x = Math.floor(Math.random() * (boxWidth - pointSize)) + 1;
      const y = Math.floor(Math.random() * (boxHeight - pointSize)) + 1;
      newPoints.push({ number: i, location: { x, y }, clicked: false, remaining: 3, opacity: 100 });
    }
    setPoints(newPoints);
  }

  const handleClick = (number: number) => {
    if (number !== current) {
      setStatus(Status.gameOver);
      setAutoPlay(false);
      setShowLoseModal(true);
      return;
    }

    if (status === Status.playing) {
      setPoints(points => points.map(point => point.number === number ? { ...point, clicked: true } : point));
      setCurrent(current => current + 1);
    }
  }

  const toggleAutoPlay = () => {
    if (status === Status.playing)
      setAutoPlay(autoPlay => !autoPlay);
  }

  return (
    <div className='px-10 py-15'>
      {/* Title */}
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>🎯 Points Game</h1>
        <p className='text-gray-600'>Click the points in numerical order!</p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200'>
        <p className={`text-2xl font-bold text-center ${status === Status.allCleared ? 'text-green-500' : status === Status.gameOver ? 'text-red-500' : 'text-blue-600'}`}>
          {
            status === Status.allCleared ? 'All Cleared' : status === Status.gameOver ? 'Game Over' : 'Let\'s Play'
          }
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200'>
        <div className='flex gap-20'>
          <div className='flex flex-col gap-2 justify-between'>
            <p className='text-xl font-medium text-gray-700'>Points: </p>
            <p className='text-xl font-medium text-gray-700'>Time: </p>
          </div>
          <div className='flex flex-col gap-2 justify-between'>
            <input value={amount} onChange={(e) => {
              const numeric = Math.max(1, Number.parseInt(e.target.value, 10) || 0);
              setAmount(String(numeric));
            }} type="number" min={1} className='border-2 border-gray-300 focus:border-blue-500 focus:outline-none rounded-md px-3 py-1 shadow-sm' />
            <p className='text-xl font-bold text-blue-600'>{(timer / 100).toFixed(1)}s</p>
          </div>
        </div>
      </div>
      <div className='flex flex-row gap-5 mt-3'>
        {status === Status.start ? (
          <button
            onClick={handleStart}
            className='bg-blue-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            🚀 Start Game
          </button>
        ) : (
          <>
            <button
              onClick={handleStart}
              className='bg-green-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg'
            >
              🔄 Restart
            </button>
            {status === Status.playing && (
              <button
                onClick={toggleAutoPlay}
                className={`px-8 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${!autoPlay
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
              >
                {autoPlay ? 'Auto Play OFF' : 'Auto Play ON'}
              </button>
            )}
          </>
        )}
      </div>
      <div ref={boxRef} className='w-1/2 h-115 border-4 border-gray-300 rounded-xl mt-3 relative bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg mx-auto'>
        {points.map(point => (
          <div
            onClick={() => handleClick(point.number)}
            key={point.number}
            className={`
              absolute w-13 h-13 rounded-full border-2 border-orange-500
              hover:cursor-pointer select-none
              flex flex-col items-center justify-center
              transition-transform duration-[3s]
              shadow-md
              ${point.clicked ? `bg-orange-500 text-white border-orange-500` : 'bg-white'}
            `}
            style={{
              top: `${point.location.y}px`,
              left: `${point.location.x}px`,
              opacity: point.clicked ? point.opacity / 100 : 1
            }}
          >
            <p className={`text-xl ${point.clicked ? 'text-white' : ''}`}>{point.number}</p>
            <p className={`text-sm ${point.clicked ? 'text-white' : 'hidden'}`}>{(point.remaining).toFixed(2)}s</p>
          </div>
        ))}
      </div>

      {/* Win Modal */}
      <Modal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">You Won!</h3>
          <p className="text-gray-600 mb-4">
            You successfully cleared all {amount} points in {(timer / 100).toFixed(1)} seconds!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStart}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200"
            >
              Play Again
            </button>
            <button
              onClick={() => setShowWinModal(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Lose Modal */}
      <Modal
        isOpen={showLoseModal}
        onClose={() => setShowLoseModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center p-6">
          <div className="text-6xl mb-4">💀</div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">You Lost!</h3>
          <p className="text-gray-600 mb-4">
            You clicked the wrong point. Try again!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStart}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowLoseModal(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default App

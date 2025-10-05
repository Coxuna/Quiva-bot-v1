import React from 'react';

const GameToastModal = ({ 
  title, 
  cta = "Continue", 
  isVisible, 
  watchAds = false, 
  toastType, 
  message, 
  message2 = "Keep playing to win more!", 
  showOutOfSpins = false,
  onClose, 
  onWatchAd 
}) => {
  const closeModal = () => {
    onClose();
  };

  const watchAdFunction = () => {
    if (onWatchAd) {
      onWatchAd();
    }
  };

  if (!isVisible) return null;

  // For testing - show ads.png only for ads-related modals
  let imageSrc = "";
  let showMLetter = false;
  let showRewards = false;
  let rewards = [];
  
          // Show ads.png only for ads-related modals
          if (toastType === 'noHints' || toastType === 'noShuffles' || watchAds) {
            imageSrc = "/assets/adss.png";
          }

          // Show M letter for time up and game over modals
          if (toastType === 'timeUp' || toastType === 'gameOver') {
            showMLetter = true;
          }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={closeModal}>
      <div 
        className="bg-[#18325B] p-5 w-full max-w-lg mx-auto rounded-lg text-center shadow-[2px_10px_0px_0px_black]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="invisible">{title}</h3>
          <button onClick={closeModal} className="bg-transparent border-none text-2xl cursor-pointer">
            <img src="/assets/x.png" alt="close" />
          </button>
        </div>
        
                <div className="w-full mt-3 flex flex-col justify-center items-center">
                  {/* M Letter Tile for specific modals - show first */}
                  {showMLetter && (
                    <div className="mb-4">
                      <div className="shrink-0 w-8 h-[32.34px] relative mx-auto">
                        <img
                          className="w-8 h-[32.34px] absolute left-0 top-0 overflow-visible"
                          src="/assets/na.png"
                          alt="Icon"
                        />
                        <div
                          className="text-center text-[17.2px] font-normal uppercase absolute left-[8.6px] top-[2.88px] w-[13.07px] h-[17.19px] text-black"
                          style={{ 
                            transformOrigin: "0 0", 
                            transform: "rotate(0deg) scale(1, 1)",
                            textShadow: "none",
                            WebkitTextStroke: "none"
                          }}
                        >
                          M
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main message with party poppers for success */}
                  <div className="flex items-center justify-center mb-4">
                    {toastType === 'wordFormed' || toastType === 'levelComplete' || toastType === 'perfectScore' || toastType === 'newHighScore' ? (
                      <>
                        <span className="text-2xl mr-2">🎉</span>
                        <h2 className="text-xl text-white font-bold italic" style={{ fontFamily: 'Adventure, sans-serif' }}>{message}</h2>
                        <span className="text-2xl ml-2">🎉</span>
                      </>
                    ) : (
                      <h2 className="text-xl text-white font-bold italic" style={{ fontFamily: 'Adventure, sans-serif' }}>{message}</h2>
                    )}
                  </div>
          
          {/* Rewards section for success modals */}
          {showRewards && rewards.length > 0 && (
            <div className="flex justify-center items-center gap-4 mb-4">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-1">
                  <img src={reward.icon} alt="reward" className="w-6 h-6" />
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>{reward.amount}</span>
                </div>
              ))}
            </div>
          )}
          
                  {/* Secondary message */}
                  <span className="text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{message2}</span>

          {/* Image after text for watch ads and other modals */}
          {imageSrc && (
            <div className="mb-4">
              <img className="w-3/4 mx-auto" src={imageSrc} alt={toastType || "game result"} />
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-5">
          {watchAds ? (
            <button 
             onClick={watchAdFunction}
              className="bg-[#FAA31E] h-12 px-16 text-black font-bold shadow-[2px_10px_0px_0px_black] flex items-center justify-center gap-2 w-full max-w-xs mx-auto"
            >
              <span style={{ fontFamily: 'Adventure, sans-serif' }}>WATCH</span>
              <img src="/assets/ads.png" alt="ads" className="w-6 h-6" />
            </button>
                  ) : (
                    <button
                      onClick={closeModal}
                      className="bg-[#FAA31E] h-10 px-10 text-black font-bold shadow-[2px_10px_0px_0px_black] flex items-center justify-center"
                    >
                      <span style={{ fontFamily: 'Adventure, sans-serif' }}>{cta}</span>
                    </button>
                  )}
        </div>
      </div>
    </div>
  );
};

export default GameToastModal;

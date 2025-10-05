import './App.scss'
import {THEME, TonConnectUIProvider} from "@tonconnect/ui-react";
import {Header} from "./components/Header/Header";
import HomePage from './pages/Home/HomePage';
import MainPage from './pages/Main/MainPage';
import GamePage from './pages/Game/GamePage';
import JumboJester from './pages/Game/Jumbo-Jester/Jumbo-Jester';
import { GamePlayWordFormedPointAwarded } from './pages/Game/Test-Jumbo/GamePlayWordFormedPointAwarded/GamePlayWordFormedPointAwarded';
import Scrabble from './pages/Game/Scrabble/Scrabble';
import RewardsPanel from './pages/Star/StarPage';
import ComicPage from './pages/Book/ComicPage';
import FarmPage from './pages/Farm/FarmPage';
import Friends from './pages/Friends/ReferPage';
import Admin from './pages/Admin/Admin'; 
import TasksView from './pages/Tasks/TaskPage';
import AppLayout from './AppLayout';
import { Routes, Route} from "react-router";


function App() {
  return (
      <TonConnectUIProvider
          manifestUrl="https://game-quiva.netlify.app/tonconnect-manifest.json"
          uiPreferences={{ theme: THEME.DARK }}
         
          actionsConfiguration={{
              twaReturnUrl: 'https://t.me/Quiva_bot/Quiva'
             
          }}
      >
        <div className="app">
          
        
             <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path="/Admin" element={<Admin/>} />
             <Route path="/Task" element={<TasksView />} />
             <Route element={<AppLayout />}>
       
            <Route path="/Home" element={<MainPage />} />
            <Route path="/Game" element={<GamePage />}  />
              <Route path="/Game/Jumbo" element={<JumboJester />} />
              <Route path="/Game/TestJumbo" element={<GamePlayWordFormedPointAwarded />} />
           
              <Route path="/Game/Scrabble" element={<Scrabble />} />
              <Route path="/Farm" element={<FarmPage />} />
              <Route path="/Star" element={<RewardsPanel />} />
              <Route path="/Book" element={<ComicPage />} />
              <Route path="/Friends" element={<Friends />} />
             
            </Route>
    </Routes>
  
        </div>
      </TonConnectUIProvider>
  )
}

export default App

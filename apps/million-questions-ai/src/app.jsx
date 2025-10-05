import React, { useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';

// 导入页面组件
import HomePage from './components/pages/HomePage';
import InspirationPage from './components/pages/InspirationPage';
import QuestionsPage from './components/pages/QuestionsPage';
import MentorHallPage from './components/pages/MentorHallPage';
import SolutionPage from './components/pages/SolutionPage';
import BoardReportPage from './components/pages/BoardReportPage';
import BoardSelectionModal from './components/modals/BoardSelectionModal';

// 导入全局样式
import './styles/global.css';

export default function App() {
  // 应用全局状态
  const [currentIdea, setCurrentIdea] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [boardSelection, setBoardSelection] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);

  // 处理想法变更
  const handleIdeaChange = (idea) => {
    setCurrentIdea(idea);
  };

  // 处理问题选择
  const handleQuestionSelect = (question) => {
    setCurrentQuestion(question);
  };

  // 处理导师选择
  const handleMentorSelect = (mentorId) => {
    setSelectedMentorId(mentorId);
  };

  // 处理董事会选择完成
  const handleBoardSelectionComplete = (selection) => {
    setBoardSelection(selection);
    setShowBoardModal(false);
    // 导航到董事会报告页面
    window.location.hash = '#/board-report';
  };

  return (
    <IonApp>
      <IonReactHashRouter>
        <IonRouterOutlet>
          <Switch>
            {/* 首页 */}
            <Route exact path="/">
              <HomePage />
            </Route>

            {/* 想法输入页 */}
            <Route path="/inspiration">
              <InspirationPage onIdeaChange={handleIdeaChange} />
            </Route>

            {/* 黄金提问页 */}
            <Route path="/questions">
              <QuestionsPage 
                currentIdea={currentIdea}
                onQuestionSelect={handleQuestionSelect}
              />
            </Route>

            {/* 大师殿堂页 */}
            <Route path="/mentor-hall">
              <MentorHallPage 
                currentQuestion={currentQuestion}
                onMentorSelect={handleMentorSelect}
              />
            </Route>

            {/* 解决方案页 */}
            <Route path="/solution">
              <SolutionPage 
                currentQuestion={currentQuestion}
                selectedMentorId={selectedMentorId}
                currentIdea={currentIdea}
              />
            </Route>

            {/* 董事会选择页（触发弹窗） */}
            <Route path="/board-selection">
              <InspirationPage onIdeaChange={handleIdeaChange} />
              {/* 使用副作用触发弹窗 */}
              <BoardSelectionTrigger onTrigger={() => setShowBoardModal(true)} />
            </Route>

            {/* 董事会报告页 */}
            <Route path="/board-report">
              <BoardReportPage 
                currentIdea={currentIdea}
                boardSelection={boardSelection}
              />
            </Route>

            {/* 默认重定向 */}
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </IonRouterOutlet>

        {/* 董事会选择弹窗 */}
        <BoardSelectionModal
          isOpen={showBoardModal}
          onClose={() => {
            setShowBoardModal(false);
            window.location.hash = '#/inspiration';
          }}
          onComplete={handleBoardSelectionComplete}
        />
      </IonReactHashRouter>
    </IonApp>
  );
}

// 用于触发董事会选择弹窗的辅助组件
function BoardSelectionTrigger({ onTrigger }) {
  React.useEffect(() => {
    onTrigger();
  }, []);

  return null;
}
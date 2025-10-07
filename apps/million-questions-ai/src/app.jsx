import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';

// 导入 Context Provider
import { AppProvider, useAppContext } from './contexts/AppContext';

// 导入页面组件
import HomePage from './components/pages/HomePage';
import InspirationPage from './components/pages/InspirationPage';
import QuestionsPage from './components/pages/QuestionsPage';
import MentorHallPage from './components/pages/MentorHallPage';
import SolutionPage from './components/pages/SolutionPage';
import BoardReportPage from './components/pages/BoardReportPage';
import BoardSelectionModal from './components/modals/BoardSelectionModal';
import LanguageSwitcher from './components/LanguageSwitcher';

// 导入全局样式
import './styles/global.css';

// 检测是否为开发/调试模式 - 安全检查
const isDevelopment = (() => {
  try {
    return (import.meta?.env?.DEV === true) || 
           (import.meta?.env?.MODE === 'development') ||
           (process?.env?.NODE_ENV === 'development') ||
           true; // 默认显示语言切换器
  } catch (error) {
    return true; // 如果检测失败，默认显示
  }
})();

// 内部组件，使用 Context
function AppContent() {
  const {
    showBoardModal,
    setShowBoardModal,
    setBoardSelection
  } = useAppContext();

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
            <InspirationPage />
          </Route>

          {/* 黄金提问页 */}
          <Route path="/questions">
            <QuestionsPage />
          </Route>

          {/* 大师殿堂页 */}
          <Route path="/mentor-hall">
            <MentorHallPage />
          </Route>

          {/* 解决方案页 */}
          <Route path="/solution">
            <SolutionPage />
          </Route>

          {/* 董事会选择页（触发弹窗） */}
          <Route path="/board-selection">
            <InspirationPage />
            {/* 使用副作用触发弹窗 */}
            <BoardSelectionTrigger onTrigger={() => setShowBoardModal(true)} />
          </Route>

          {/* 董事会报告页 */}
          <Route path="/board-report">
            <BoardReportPage />
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

      {/* 语言切换器 - 仅在开发模式显示 */}
      {isDevelopment && <LanguageSwitcher />}
    </IonApp>
  );
}

// 主应用组件
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// 用于触发董事会选择弹窗的辅助组件
function BoardSelectionTrigger({ onTrigger }) {
  React.useEffect(() => {
    onTrigger();
  }, [onTrigger]);

  return null;
}
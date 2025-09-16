import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

// 안전한 리마인더 데이터 가져오기
export const getRemindersData = async () => {
  try {
    const remindersResult = await AppSdk.reminder.getUserReminders();
    
    if (remindersResult && Array.isArray(remindersResult) && remindersResult.length > 0) {
      return remindersResult;
    } else {
      console.log("리마인더 데이터가 없습니다.");
      return [];
    }
  } catch (error) {
    console.error("리마인더 조회 실패:", error);
    await reportError(error, 'ReminderFetchError');
    return [];
  }
};

// 리마인더 결과 유효성 검사
export const validateRemindersResult = (remindersResult) => {
  if (!remindersResult) {
    console.warn("remindersResult가 null 또는 undefined입니다.");
    return [];
  }
  
  if (!Array.isArray(remindersResult)) {
    console.warn("remindersResult가 배열이 아닙니다:", typeof remindersResult);
    return [];
  }
  
  return remindersResult;
};

// 전역 리마인더 오류 처리
export const handleReminderError = async (error, context = '') => {
  console.error(`리마인더 오류 ${context}:`, error);
  await reportError(error, 'ReminderError', { context });
  
  // 사용자에게 친화적인 메시지 반환
  const userMessage = "리마인더 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  
  return {
    success: false,
    error: userMessage,
    data: []
  };
};

// 안전한 타이머 리마인더 정리
export const cleanupTimerRemindersSafely = async () => {
  try {
    console.log('타이머 리마인더 정리 시작...');
    
    // 모든 리마인더 가져오기
    const remindersResult = await getRemindersData();
    const validReminders = validateRemindersResult(remindersResult);
    
    // 타이머 관련 리마인더 필터링
    const timerReminders = validReminders.filter(r => 
      r && r.title === '자연 정원 뽀모도로'
    );
    
    console.log(`발견된 타이머 리마인더: ${timerReminders.length}개`);
    
    // 각 타이머 리마인더 정리
    const cleanupResults = [];
    for (const reminder of timerReminders) {
      try {
        if (reminder && reminder.id) {
          const deleteResult = await AppSdk.reminder.deleteReminder({ id: reminder.id });
          cleanupResults.push({
            id: reminder.id,
            success: deleteResult,
            title: reminder.title
          });
          console.log(`리마인더 ${reminder.id} 정리 완료`);
        }
      } catch (deleteError) {
        console.error(`리마인더 ${reminder.id} 정리 실패:`, deleteError);
        cleanupResults.push({
          id: reminder.id,
          success: false,
          error: deleteError.message
        });
      }
    }
    
    console.log('타이머 리마인더 정리 완료');
    return {
      success: true,
      cleaned: cleanupResults.length,
      results: cleanupResults
    };
    
  } catch (error) {
    console.error('타이머 리마인더 정리 중 오류:', error);
    await reportError(error, 'TimerReminderCleanupError');
    return {
      success: false,
      error: error.message,
      cleaned: 0
    };
  }
};

// 리마인더 디버깅 정보
export const debugReminder = async (reminderId) => {
  try {
    console.log(`=== 리마인더 디버깅 ${reminderId || 'ALL'} ===`);
    
    if (reminderId) {
      // 특정 리마인더 디버깅
      const reminder = await AppSdk.reminder.getReminder({ id: reminderId });
      console.log('특정 리마인더:', reminder);
      console.log('리마인더 타입:', typeof reminder);
      console.log('리마인더 존재 여부:', !!reminder);
    } else {
      // 모든 리마인더 디버깅
      const remindersResult = await getRemindersData();
      console.log('모든 리마인더 결과:', remindersResult);
      console.log('리마인더 개수:', remindersResult.length);
      
      // 타이머 관련 리마인더만 필터링
      const timerReminders = remindersResult.filter(r => 
        r && r.title === '자연 정원 뽀모도로'
      );
      console.log('타이머 리마인더:', timerReminders);
    }
    
    console.log('=== 디버깅 완료 ===');
    return true;
    
  } catch (error) {
    console.error('리마인더 디버깅 실패:', error);
    await reportError(error, 'ReminderDebugError');
    return false;
  }
};

// 안전한 리마인더 생성
export const createReminderSafely = async (reminderData) => {
  try {
    // 입력 데이터 유효성 검사
    if (!reminderData || !reminderData.message || !reminderData.start_time) {
      throw new Error('리마인더 생성에 필요한 데이터가 부족합니다.');
    }
    
    const reminder = await AppSdk.reminder.createReminder(reminderData);
    
    if (reminder && reminder.id) {
      console.log('리마인더 생성 성공:', reminder.id);
      return {
        success: true,
        reminder: reminder
      };
    } else {
      throw new Error('리마인더 생성 결과가 유효하지 않습니다.');
    }
    
  } catch (error) {
    console.error('리마인더 생성 실패:', error);
    await reportError(error, 'ReminderCreateError');
    return {
      success: false,
      error: error.message
    };
  }
};

// 안전한 리마인더 삭제
export const deleteReminderSafely = async (reminderId) => {
  try {
    if (!reminderId) {
      console.warn('삭제할 리마인더 ID가 없습니다.');
      return { success: false, error: 'ID가 필요합니다.' };
    }
    
    const deleteResult = await AppSdk.reminder.deleteReminder({ id: reminderId });
    
    if (deleteResult) {
      console.log('리마인더 삭제 성공:', reminderId);
      return { success: true };
    } else {
      throw new Error('리마인더 삭제에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('리마인더 삭제 실패:', error);
    await reportError(error, 'ReminderDeleteError');
    return {
      success: false,
      error: error.message
    };
  }
};
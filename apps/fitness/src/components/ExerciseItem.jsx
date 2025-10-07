import React from 'react';
import { 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonBadge 
} from '@ionic/react';
import { 
  timeOutline, 
  barbell, 
  body, 
  bodyOutline, 
  handLeft, 
  bug, 
  resize, 
  sync, 
  disc, 
  trailSign, 
  walk, 
  bicycle, 
  footsteps, 
  pulse, 
  boat, 
  rocket, 
  fitness
} from 'ionicons/icons';

const ExerciseItem = ({ exercise, onClick }) => {
  // 图标映射表
  const iconMap = {
    'barbell': barbell,
    'body': body,
    'body-outline': bodyOutline,
    'hand-left': handLeft,
    'bug': bug,
    'resize': resize,
    'sync': sync,
    'disc': disc,
    'trail-sign': trailSign,
    'walk': walk,
    'bicycle': bicycle,
    'footsteps': footsteps,
    'pulse': pulse,
    'boat': boat,
    'rocket': rocket,
    'fitness': fitness
  };

  // 获取动作对应的图标，如果没有指定则使用默认图标
  const getExerciseIcon = () => {
    if (exercise.icon && iconMap[exercise.icon]) {
      return iconMap[exercise.icon];
    }
    return barbell; // 默认图标
  };

  // 获取图标颜色，根据运动类型设置不同的颜色
  const getIconColor = () => {
    if (exercise.category) {
      switch (exercise.category.id) {
        case 'chest': return 'primary';
        case 'back': return 'secondary';
        case 'shoulders': return 'tertiary';
        case 'arms': return 'danger';
        case 'legs': return 'warning';
        case 'core': return 'success';
        case 'cardio': return 'medium';
        default: return 'primary';
      }
    }
    return 'primary';
  };

  return (
    <IonItem button onClick={onClick} className="exercise-list-item">
      <div style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%', 
        backgroundColor: `rgba(var(--ion-color-${getIconColor()}-rgb), 0.1)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px'
      }}>
        <IonIcon 
          icon={getExerciseIcon()} 
          color={getIconColor()} 
          style={{ fontSize: '20px' }} 
        />
      </div>
      <IonLabel>
        <h2 style={{ fontWeight: '500' }}>{exercise.name}</h2>
        <div className="exercise-detail">
          <span>{exercise.sets} 组 × {exercise.reps} 次</span>
          {exercise.weight > 0 && (
            <span style={{ marginLeft: '8px' }}> • {exercise.weight} kg</span>
          )}
        </div>
      </IonLabel>
      <IonBadge 
        color="light" 
        slot="end"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px 8px', 
          borderRadius: '12px',
          backgroundColor: 'rgba(var(--ion-color-medium-rgb), 0.1)',
          color: 'var(--ion-color-medium)'
        }}
      >
        <IonIcon icon={timeOutline} size="small" />
        &nbsp;{exercise.restBetweenSets}秒
      </IonBadge>
    </IonItem>
  );
};

export default ExerciseItem;
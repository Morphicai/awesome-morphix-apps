import React from 'react';
import { IonList, IonItem, IonLabel, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import styles from './ItemList.module.css';

const ItemList = ({ items }) => {
  const history = useHistory();

  const handleItemClick = (id) => {
    if (id.startsWith('demo-')) return;
    history.push(`/edit/${id}`);
  };

  return (
    <div>
      <IonList className={styles.itemList}>
        {items.map(item => {
          const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;
          const isValidDate = purchaseDate && !isNaN(purchaseDate.getTime());
          const daysSincePurchase = isValidDate 
            ? Math.max(0, Math.ceil((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          return (
            <IonItem 
              key={item.id} 
              button={!item._isDemo}
              onClick={() => handleItemClick(item.id)} 
              className={`${styles.item} ${item._optimistic ? styles.optimisticItem : ''} ${item._isDemo ? styles.demoItem : ''}`}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemInfo}>
                  <IonLabel className={styles.itemName}>
                    {item.name || '未命名物品'}
                  </IonLabel>
                  <IonText className={styles.itemMeta}>
                    {item.status || '服役中'} • ×{item.quantity || 1} {item.price ? `• ${item.price}元` : ''}
                  </IonText>
                </div>
                <div className={styles.itemValue}>
                  <IonText className={styles.itemDays}>
                    {daysSincePurchase}天
                  </IonText>
                </div>
              </div>
            </IonItem>
          );
        })}
      </IonList>
      
      {items.some(item => item._isDemo) && (
        <div className={styles.demoTip}>
          <IonText>小提示：长按可快速操作哦～</IonText>
        </div>
      )}
    </div>
  );
};

export default ItemList;
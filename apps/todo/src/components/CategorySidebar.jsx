import React from 'react';
import { IonIcon } from '@ionic/react';
import { 
  briefcaseOutline, 
  personOutline, 
  cartOutline, 
  bookOutline, 
  appsOutline,
  ellipseOutline
} from 'ionicons/icons';
import { translate } from '../utils/i18n';

const CategorySidebar = ({ 
  categories, 
  activeCategory, 
  onSelectCategory, 
  todos,
  language = 'en'
}) => {
  const t = (key, params) => translate(language, key, params);

  const categoryIcons = {
    [t('categories.all')]: appsOutline,
    [t('categories.work')]: briefcaseOutline,
    [t('categories.personal')]: personOutline,
    [t('categories.shopping')]: cartOutline,
    [t('categories.study')]: bookOutline,
  };

  const getCategoryCount = (category) => {
    if (category === t('categories.all')) {
      return todos.filter(todo => !todo.completed).length;
    }
    return todos.filter(todo => todo.category === category && !todo.completed).length;
  };

  const getColorForCategory = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'var(--ion-color-primary)',
      'var(--ion-color-secondary)',
      'var(--ion-color-tertiary)',
      'var(--ion-color-success)',
      'var(--ion-color-warning)',
      'var(--ion-color-danger)'
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="app-sidebar">
      <div className="sidebar-header">{t('tasks.category')}</div>
      <div className="category-list">
        <div 
          className={`category-item ${activeCategory === t('categories.all') ? 'active' : ''}`}
          onClick={() => onSelectCategory(t('categories.all'))}
        >
          <IonIcon icon={categoryIcons[t('categories.all')]} />
          <span>{t('categories.all')}</span>
          <span className="category-count">{getCategoryCount(t('categories.all'))}</span>
        </div>
        
        {categories.map(category => (
          <div 
            key={category} 
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {categoryIcons[category] ? (
              <IonIcon icon={categoryIcons[category]} />
            ) : (
              <IonIcon 
                icon={ellipseOutline} 
                style={{ color: getColorForCategory(category) }}
              />
            )}
            <span>{category}</span>
            <span className="category-count">{getCategoryCount(category)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
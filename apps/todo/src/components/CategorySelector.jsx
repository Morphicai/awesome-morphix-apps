import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  briefcaseOutline, 
  personOutline, 
  cartOutline, 
  bookOutline, 
  appsOutline,
  ellipsisHorizontal,
  chevronDownOutline,
  settingsOutline
} from 'ionicons/icons';
import { translate } from '../utils/i18n';

const CategorySelector = ({ 
  categories, 
  activeCategory, 
  onSelectCategory, 
  onManageCategories,
  todos,
  maxVisibleCategories = 4,
  language = 'en'
}) => {
  const t = (key, params) => translate(language, key, params);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const dropdownRef = useRef(null);
  
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (categories.length <= maxVisibleCategories) {
      setVisibleCategories(categories);
      setHiddenCategories([]);
      return;
    }

    const categoryUsage = categories.map(category => ({
      name: category,
      count: getCategoryCount(category)
    }));

    categoryUsage.sort((a, b) => b.count - a.count);

    let visibleCats = [];
    let hiddenCats = [];

    if (activeCategory !== t('categories.all') && categories.includes(activeCategory)) {
      visibleCats.push(activeCategory);
      
      categoryUsage
        .filter(cat => cat.name !== activeCategory)
        .slice(0, maxVisibleCategories - 1)
        .forEach(cat => visibleCats.push(cat.name));
      
      hiddenCats = categories.filter(cat => !visibleCats.includes(cat));
    } else {
      visibleCats = categoryUsage.slice(0, maxVisibleCategories).map(cat => cat.name);
      hiddenCats = categories.filter(cat => !visibleCats.includes(cat));
    }

    setVisibleCategories(visibleCats);
    setHiddenCategories(hiddenCats);
  }, [categories, activeCategory, todos, maxVisibleCategories, language]);

  const handleSelectCategory = (category) => {
    onSelectCategory(category);
    setShowDropdown(false);
  };

  return (
    <div className="category-selector">
      <div className="category-tabs">
        <div 
          className={`category-tab ${activeCategory === t('categories.all') ? 'active' : ''}`}
          onClick={() => onSelectCategory(t('categories.all'))}
        >
          <IonIcon icon={categoryIcons[t('categories.all')]} className="category-icon" />
          <span className="category-name">{t('categories.all')}</span>
          <span className="category-count">{getCategoryCount(t('categories.all'))}</span>
        </div>
        
        {visibleCategories.map(category => (
          <div 
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            <IonIcon icon={categoryIcons[category] || appsOutline} className="category-icon" />
            <span className="category-name">{category}</span>
            <span className="category-count">{getCategoryCount(category)}</span>
          </div>
        ))}
        
        {hiddenCategories.length > 0 && (
          <div className="more-categories-wrapper" ref={dropdownRef}>
            <div 
              className={`category-tab more-button ${showDropdown ? 'active' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <IonIcon icon={ellipsisHorizontal} className="category-icon" />
              <span className="category-name">{t('categories.more')}</span>
              <IonIcon 
                icon={chevronDownOutline} 
                className={`dropdown-icon ${showDropdown ? 'open' : ''}`} 
              />
            </div>
            
            {showDropdown && (
              <div className="categories-dropdown">
                {hiddenCategories.map(category => (
                  <div 
                    key={category}
                    className={`dropdown-item ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(category)}
                  >
                    <IonIcon icon={categoryIcons[category] || appsOutline} className="category-icon" />
                    <span className="category-name">{category}</span>
                    <span className="category-count">{getCategoryCount(category)}</span>
                  </div>
                ))}
                <div className="dropdown-divider"></div>
                <div className="dropdown-item manage-item" onClick={onManageCategories}>
                  <IonIcon icon={settingsOutline} className="category-icon" />
                  <span className="category-name">{t('categories.manage')}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {hiddenCategories.length === 0 && (
          <div 
            className="category-tab manage-button"
            onClick={onManageCategories}
          >
            <IonIcon icon={settingsOutline} className="category-icon" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
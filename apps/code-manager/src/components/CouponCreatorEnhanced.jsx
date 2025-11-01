/**
 * 增强版优惠券创建组件
 * 
 * 支持功能：
 * - 金额券和折扣券两种类型
 * - 添加备注信息
 * - 输入公司名称
 * - 批量创建优惠券
 * - 保存为模板
 */

import React, { useState, useEffect } from 'react';
import { 
  IonButton, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonAlert
} from '@ionic/react';
import { 
  alertCircleOutline, 
  addCircleOutline,
  saveOutline,
  copyOutline
} from 'ionicons/icons';
import { validateAmount, validateDiscount, validateNote, validateCompanyName, validateQuantity } from '../utils/validators';
import { CouponType } from '../utils/types';
import useCouponManager from '../hooks/useCouponManager';
import useErrorHandler from '../hooks/useErrorHandler';
import styles from '../styles/CouponCreatorEnhanced.module.css';

const CouponCreatorEnhanced = ({ onCouponCreated, onBatchCreated }) => {
  // 表单状态
  const [couponType, setCouponType] = useState(CouponType.AMOUNT);
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [note, setNote] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // 错误状态
  const [errors, setErrors] = useState({});
  
  // 模板相关
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateAlert, setShowTemplateAlert] = useState(false);
  
  const { 
    createCoupon, 
    isLoading, 
    error: serviceError, 
    clearError
  } = useCouponManager();

  const { 
    handleValidationError,
    handleStorageError,
    withLoading,
    showToast
  } = useErrorHandler();

  // 加载模板
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('couponTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      setShowTemplateAlert(true);
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: templateName,
      type: couponType,
      amount: couponType === CouponType.AMOUNT ? amount : '0',
      discount: couponType === CouponType.DISCOUNT ? discount : null,
      note,
      companyName,
      createdAt: new Date()
    };

    const updatedTemplates = [...templates, template];
    localStorage.setItem('couponTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    showToast('模板保存成功', 'success');
    setTemplateName('');
    setSaveAsTemplate(false);
  };

  const loadTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCouponType(template.type);
      setAmount(template.amount);
      setDiscount(template.discount || '');
      setNote(template.note);
      setCompanyName(template.companyName);
      showToast('模板加载成功', 'success');
    }
  };

  const handleTypeChange = (e) => {
    setCouponType(e.detail.value);
    setErrors({});
  };

  const handleAmountChange = (e) => {
    setAmount(e.detail.value);
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  const handleDiscountChange = (e) => {
    setDiscount(e.detail.value);
    if (errors.discount) {
      setErrors({ ...errors, discount: '' });
    }
  };

  const handleNoteChange = (e) => {
    setNote(e.detail.value);
    if (errors.note) {
      setErrors({ ...errors, note: '' });
    }
  };

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.detail.value);
    if (errors.companyName) {
      setErrors({ ...errors, companyName: '' });
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.detail.value);
    if (errors.quantity) {
      setErrors({ ...errors, quantity: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (couponType === CouponType.AMOUNT) {
      if (!amount.trim()) {
        newErrors.amount = '请输入优惠券金额';
      } else if (!validateAmount(amount)) {
        newErrors.amount = '请输入有效的金额（大于0）';
      }
    } else {
      if (!discount.trim()) {
        newErrors.discount = '请输入折扣值';
      } else if (!validateDiscount(discount)) {
        newErrors.discount = '请输入有效的折扣（1-100）';
      }
    }

    if (note && !validateNote(note)) {
      newErrors.note = '备注不能超过200字';
    }

    if (companyName && !validateCompanyName(companyName)) {
      newErrors.companyName = '公司名称不能超过50字';
    }

    if (!validateQuantity(quantity)) {
      newErrors.quantity = '请输入有效的数量（1-100）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCoupon = async () => {
    if (!validateForm()) {
      return;
    }

    const couponData = {
      type: couponType,
      amount: couponType === CouponType.AMOUNT ? parseFloat(amount) : 0,
      discount: couponType === CouponType.DISCOUNT ? parseFloat(discount) : null,
      note,
      companyName
    };

    const numQuantity = parseInt(quantity);

    if (numQuantity === 1) {
      // 创建单个优惠券
      const result = await withLoading(async () => {
        const coupon = await createCoupon(couponData);
        if (!coupon) {
          throw new Error(serviceError || '创建优惠券失败');
        }
        return coupon;
      }, '创建优惠券失败，请重试');

      if (result.success) {
        resetForm();
        if (onCouponCreated) {
          onCouponCreated(result.data);
        }
      } else {
        handleStorageError(result.error);
      }
    } else {
      // 批量创建优惠券
      const result = await withLoading(async () => {
        const coupons = [];
        for (let i = 0; i < numQuantity; i++) {
          const coupon = await createCoupon(couponData);
          if (coupon) {
            coupons.push(coupon);
          }
        }
        return coupons;
      }, '批量创建优惠券失败，请重试');

      if (result.success && result.data.length > 0) {
        resetForm();
        showToast(`成功创建 ${result.data.length} 张优惠券`, 'success');
        if (onBatchCreated) {
          onBatchCreated(result.data);
        }
      } else {
        handleStorageError(result.error || '批量创建失败');
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setDiscount('');
    setNote('');
    setQuantity('1');
    setErrors({});
    if (!saveAsTemplate) {
      setCompanyName('');
    }
  };

  return (
    <div className={styles.container}>
      <IonCard className={styles.formCard}>
        <IonCardHeader>
          <IonCardTitle>创建优惠券</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* 模板选择 */}
          {templates.length > 0 && (
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">使用模板（可选）</IonLabel>
              <IonSelect
                value={selectedTemplate}
                placeholder="选择模板"
                onIonChange={(e) => {
                  setSelectedTemplate(e.detail.value);
                  loadTemplate(e.detail.value);
                }}
              >
                {templates.map(template => (
                  <IonSelectOption key={template.id} value={template.id}>
                    {template.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}

          {/* 优惠券类型 */}
          <div className={styles.typeSection}>
            <IonLabel className={styles.sectionLabel}>优惠券类型</IonLabel>
            <IonSegment value={couponType} onIonChange={handleTypeChange}>
              <IonSegmentButton value={CouponType.AMOUNT}>
                <IonLabel>金额券</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value={CouponType.DISCOUNT}>
                <IonLabel>折扣券</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* 金额或折扣输入 */}
          {couponType === CouponType.AMOUNT ? (
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">优惠金额 (元) *</IonLabel>
              <IonInput
                type="number"
                placeholder="请输入金额"
                value={amount}
                onIonInput={handleAmountChange}
                className={errors.amount ? styles.inputError : ''}
              />
            </IonItem>
          ) : (
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">折扣 (%) *</IonLabel>
              <IonInput
                type="number"
                placeholder="例如：8.5 表示 8.5折"
                value={discount}
                onIonInput={handleDiscountChange}
                className={errors.discount ? styles.inputError : ''}
              />
            </IonItem>
          )}

          {errors.amount && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {errors.amount}</p>
            </IonText>
          )}

          {errors.discount && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {errors.discount}</p>
            </IonText>
          )}

          {/* 公司名称 */}
          <IonItem className={styles.inputItem}>
            <IonLabel position="stacked">公司名称（可选）</IonLabel>
            <IonInput
              type="text"
              placeholder="请输入公司名称"
              value={companyName}
              onIonInput={handleCompanyNameChange}
              maxlength={50}
              className={errors.companyName ? styles.inputError : ''}
            />
          </IonItem>

          {errors.companyName && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {errors.companyName}</p>
            </IonText>
          )}

          {/* 备注 */}
          <IonItem className={styles.inputItem}>
            <IonLabel position="stacked">备注（可选）</IonLabel>
            <IonTextarea
              placeholder="请输入备注信息"
              value={note}
              onIonInput={handleNoteChange}
              maxlength={200}
              rows={3}
              className={errors.note ? styles.inputError : ''}
            />
          </IonItem>

          {errors.note && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {errors.note}</p>
            </IonText>
          )}

          {/* 创建数量 */}
          <IonItem className={styles.inputItem}>
            <IonLabel position="stacked">创建数量</IonLabel>
            <IonInput
              type="number"
              placeholder="1"
              value={quantity}
              onIonInput={handleQuantityChange}
              min="1"
              max="100"
              className={errors.quantity ? styles.inputError : ''}
            />
          </IonItem>

          {errors.quantity && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {errors.quantity}</p>
            </IonText>
          )}

          {/* 保存为模板 */}
          <IonItem className={styles.checkboxItem} lines="none">
            <IonCheckbox
              checked={saveAsTemplate}
              onIonChange={(e) => setSaveAsTemplate(e.detail.checked)}
            />
            <IonLabel className={styles.checkboxLabel}>保存为模板</IonLabel>
          </IonItem>

          {saveAsTemplate && (
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">模板名称</IonLabel>
              <IonInput
                type="text"
                placeholder="请输入模板名称"
                value={templateName}
                onIonInput={(e) => setTemplateName(e.detail.value)}
              />
            </IonItem>
          )}

          {serviceError && (
            <IonText color="danger" className={styles.errorText}>
              <p><IonIcon icon={alertCircleOutline} /> {serviceError}</p>
            </IonText>
          )}

          {/* 操作按钮 */}
          <div className={styles.actionButtons}>
            {saveAsTemplate && (
              <IonButton
                expand="block"
                fill="outline"
                onClick={saveTemplate}
                className={styles.saveTemplateButton}
              >
                <IonIcon icon={saveOutline} slot="start" />
                保存模板
              </IonButton>
            )}

            <IonButton
              expand="block"
              onClick={handleCreateCoupon}
              disabled={isLoading}
              className={styles.createButton}
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span className={styles.buttonText}>创建中...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={quantity > 1 ? copyOutline : addCircleOutline} slot="start" />
                  {quantity > 1 ? `批量创建 ${quantity} 张` : '创建优惠券'}
                </>
              )}
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      {/* 模板名称输入提示 */}
      <IonAlert
        isOpen={showTemplateAlert}
        onDidDismiss={() => setShowTemplateAlert(false)}
        header="提示"
        message="请输入模板名称"
        buttons={['确定']}
      />
    </div>
  );
};

export default CouponCreatorEnhanced;

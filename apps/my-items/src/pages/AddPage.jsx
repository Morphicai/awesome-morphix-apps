import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToggle,
  useIonToast,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { PageHeader } from '@morphixai/components';
import useItemStore from '../store/useItemStore';
import FormField from '../components/FormField';
import FormSection from '../components/FormSection';
import SubmitButton from '../components/SubmitButton';
import DateInput from '../components/DateInput';
import styles from './AddPage.module.css';

const AddPage = () => {
  const history = useHistory();
  const { id: editId } = useParams();
  const { addItem, updateItem, getItem } = useItemStore();
  const [present] = useIonToast();

  const [formData, setFormData] = useState({
    name: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    price: '',
    quantity: 1,
    status: '服役中',
    includeSecondHandValue: false,
    calculatePerUse: false,
  });

  useEffect(() => {
    if (editId) {
      const item = getItem(editId);
      if (item) {
        setFormData(item);
      }
    }
  }, [editId, getItem]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      present({ message: '请填写必填项', duration: 2000 });
      return;
    }

    const { id, _optimistic, _isDemo, createdAt, ...cleanData } = formData;

    const result = editId
      ? await updateItem(editId, cleanData)
      : await addItem(cleanData);

    if (result.success) {
      present({ message: editId ? '更新成功' : '保存成功', duration: 2000 });
      history.goBack();
    } else {
      present({ message: '操作失败', duration: 2000 });
    }
  };

  return (
    <IonPage>
      <PageHeader title={editId ? '编辑物品' : '新增物品'} />
      <IonContent>
        <FormSection title="基本信息">
          <FormField label="名称">
            <IonInput
              value={formData.name}
              placeholder="输入名称"
              onIonChange={e => handleInputChange('name', e.detail.value)}
              className={styles.inputField}
            />
          </FormField>
          <FormField label="购买时间">
            <DateInput
              value={formData.purchaseDate}
              onChange={e => handleInputChange('purchaseDate', e.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="以下为选填项">
          <FormField label="价格">
            <IonInput
              type="number"
              value={formData.price}
              placeholder="输入价格"
              onIonChange={e => handleInputChange('price', e.detail.value)}
              className={styles.inputField}
            />
          </FormField>
           <FormField label="使用状态">
            <IonSegment 
              value={formData.status} 
              onIonChange={e => handleInputChange('status', e.detail.value)}
              className={styles.statusSegment}>
              <IonSegmentButton value="服役中">
                <IonLabel>服役中</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="预备役">
                <IonLabel>预备役</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="已退役">
                <IonLabel>已退役</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </FormField>
        </FormSection>

        <FormSection title="价值计算">
          <FormField label="包含二手价值" className={styles.toggleField}>
            <IonToggle
              checked={formData.includeSecondHandValue}
              onIonChange={e => handleInputChange('includeSecondHandValue', e.detail.checked)}
            />
          </FormField>
          <FormField label="计算每次的使用价格" className={styles.toggleField}>
            <IonToggle
              checked={formData.calculatePerUse}
              onIonChange={e => handleInputChange('calculatePerUse', e.detail.checked)}
            />
          </FormField>
        </FormSection>

        <SubmitButton onClick={handleSubmit}>保存</SubmitButton>
      </IonContent>
    </IonPage>
  );
};

export default AddPage;